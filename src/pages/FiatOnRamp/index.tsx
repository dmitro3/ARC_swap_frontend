import WertWidget from '@wert-io/widget-initializer';
import { Button, Input, Tabs } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AuthContext } from 'contexts/AuthProvider';
import Notification from 'components/Notification/Notification';
import React, { useContext, useEffect, useRef, useState } from 'react';
import CoingeckoService from 'services/CoingeckoService';
import { DepoAPISevice } from 'services/DepoAPIService';
import styled from 'styled-components/macro';

const PurchaseDepoWrapper = styled.div<{ step: number }>`
  background: linear-gradient(
    156.25deg,
    #121212 72.03%,
    rgba(18, 18, 18, 0.4) 96.34%
  );
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  color: #fff;
  display: ${(props) => (props.step === 0 ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;

  @media screen and (max-width: 576px) {
    padding: 20px;
  }
`;

const PurchaseDepoContent = styled.div`
  min-width: 480px;

  @media screen and (max-width: 576px) {
    width: 100%;
    min-width: auto;
  }
`;

const InputWrapper = styled.div`
  background: #1e1e1e;
  border-radius: 10px;
  padding: 16px;

  .ant-input-affix-wrapper {
    font-size: 16px;
    font-weight: 500;
    color: #007aff;
    padding-left: 0;
    padding-right: 0;

    .ant-input {
      text-align: right;
    }
  }

  .ant-input {
    font-size: 16px;
    font-weight: 500;
    color: #007aff;

    &::-webkit-input-placeholder {
      font-size: 18px !important;
    }
  }
`;

const DisclaimerWrapper = styled.p`
  max-width: 960px;
  padding: 0 48px;
  padding-top: 16px;
  color: #fff;
  margin: 0 auto;
`;

const { TabPane } = Tabs;

const wertDefaultOptions = {
  partner_id: '01FR5T0F10N01MTZXQJVKAZEXR',
  origin: 'https://widget.wert.io',
  theme: 'dark',
  color_background: '#070708',
  color_buttons: '#007aff',
  color_buttons_text: '#ffffff',
  secondary_buttons_border_radius: '10',
  color_main_text: '#ffffff',
  color_secondary_text: '#007aff',
  color_icons: '#5eacff',
  color_links: '#5eacff',
};

const FiatOnRamp: React.FC = () => {
  const { user } = useContext(AuthContext);
  const amountInputRef = useRef<any>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const wertWidget = new WertWidget({
      ...wertDefaultOptions,
      container_id: 'wert-widget',
      commodities: 'BTC,ETH',
    });
    wertWidget.mount();
  }, []);

  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus({ cursor: 'start' });
    }
  }, [amountInputRef]);

  useEffect(() => {
    if (user && user.settings?.defaultWallet) {
      setAddress(user.settings?.defaultWallet);
    }
  }, [user]);

  const handleBack = () => setStep(0);

  const handleProceed = async () => {
    try {
      const depoAmount = +amountInputRef.current?.input?.value;
      if (depoAmount) {
        setLoading(true);
        const depoToEth = await CoingeckoService.fetchTickerDepoEth();
        const ethAmount = depoToEth * depoAmount;
        // eslint-disable-next-line camelcase
        const { commodity_amount } = await DepoAPISevice.wertConvertUSDToETH(
          ethAmount,
        );
        const { signedData } = await DepoAPISevice.signWertData({
          commodity_amount,
          address,
        });
        const wertWidget = new WertWidget({
          ...signedData,
          ...wertDefaultOptions,
          container_id: 'depo-wert-widget',
        });
        wertWidget.mount();
        setStep(1);
        setLoading(false);
      } else {
        Notification({ type: 'error', message: 'Please input DEPO amount.' });
      }
    } catch (err) {
      setLoading(false);
      Notification({ type: 'error', message: 'Something went wrong.' });
    }
  };

  return (
    <>
      <h3 className="page-title">Fiat on-ramp</h3>
      <Tabs className="depo__tabs_secondary mt-4">
        {/* <TabPane tab="Purchase ARC" key="1" forceRender>
          <PurchaseDepoWrapper step={step}>
            <PurchaseDepoContent>
              <h4 className="text-white mb-5">Purchase ARC</h4>
              <div className="mb-4">
                <h6 className="text-white">Purchase amount</h6>
                <InputWrapper>
                  <Input prefix="ARC" bordered={false} ref={amountInputRef} />
                </InputWrapper>
              </div>
              <div className="mb-5">
                <h6 className="text-white">Wallet address</h6>
                <InputWrapper>
                  <Input
                    bordered={false}
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </InputWrapper>
              </div>
              <Button
                className="btn-depo btn-lg bg-success w-100 text-black"
                onClick={handleProceed}
              >
                {loading && <LoadingOutlined />}
                <span style={{ fontSize: 16 }}>Continue</span>
              </Button>
            </PurchaseDepoContent>
          </PurchaseDepoWrapper>
          <div style={{ display: step === 0 ? 'none' : 'block' }}>
            <Button
              type="text"
              className="p-0 bg-transparent"
              onClick={handleBack}
            >
              <ArrowLeftOutlined />
              Back
            </Button>
            <div
              style={{
                width: '100%',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#0d0d0d',
              }}
            >
              <DisclaimerWrapper>
                We look forward to welcoming you to the ARC community. During
                this process you are initially buying Ethereum (ETH) which is
                why you are seeing ETH prices in the purchase details section.
                Once you confirm your transaction, this purchase will
                automatically convert to ARC. All charges quoted in this price
                are correct and you will not incur any further charges. Rest
                assured that this has been swapped through the cheapest possible
                option, once you click accept you accept all fees at the price
                quoted to you in fiat.
              </DisclaimerWrapper>
              <div id="depo-wert-widget" style={{ height: 580 }} />
            </div>
          </div>
        </TabPane> */}
        <TabPane tab="Purchase other crypto" key="2" forceRender>
          <div
            id="wert-widget"
            style={{
              width: '100%',
              height: 580,
              borderRadius: 10,
              overflow: 'hidden',
              background: '#000',
            }}
          />
        </TabPane>
      </Tabs>
    </>
  );
};

export default FiatOnRamp;
