/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { Row, Col, Radio, Input, RadioChangeEvent, Switch } from 'antd';
import styled from 'styled-components';

const DEFAULT_SLIPPAGES = [0.1, 0.5, 1, 2, 3, 5, 10];

const Wrapper = styled.div`
  background: linear-gradient(
    162.94deg,
    #232323 59%,
    rgba(35, 35, 35, 0.7) 96.48%
  );
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  min-width: 240px;
  position: absolute;
  top: 0;
  margin-left: 16px;
  left: 100%;
  border-radius: 10px;

  .ant-radio-group {
    background-color: transparent !important;
    height: auto !important;
    border-radius: 30px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    flex-wrap: wrap;
    gap: 8px;

    .ant-radio-button-wrapper {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      align-items: center !important;
      background-color: #070708 !important;
      border: none !important;
      border-radius: 6px !important;
      font-size: 10px !important;
      font-weight: 400 !important;
      padding: 2px 4px !important;
      min-width: 40px !important;
      line-height: 24px !important;
      color: #fff !important;

      &.ant-radio-button-wrapper-checked {
        color: #000 !important;
        background: #007aff !important;
        font-weight: 600 !important;
        height: auto !important;
      }
      &:before {
        display: none !important;
      }
    }
  }

  .ant-switch {
    background-color: #070708 !important;
    border-radius: 6px !important;
    height: 27px !important;
    &:focus {
      box-shadow: none !important;
    }

    .ant-switch-handle {
      width: 37px !important;
      height: 27px !important;
      top: 0px !important;
      &:before {
        border-radius: 6px !important;
        background-color: #007aff !important;
      }
    }

    &:not(.ant-switch-checked) {
      .ant-switch-handle {
        left: 0px !important;
        &:before {
          background-color: #363636 !important;
        }
      }
    }

    .ant-switch-inner {
      margin-left: 44px !important;
    }

    &.ant-switch-checked {
      .ant-switch-inner {
        margin-left: 7px !important;
      }
    }
  }

  @media screen and (max-width: 576px) {
    right: -16px;
    left: -16px;
    bottom: -24px;
    border-radius: 0;
    top: auto;
    transform: none;
    width: calc(100% + 32px);
  }
`;

const SettingsInput = styled(Input)`
  background-color: #070708 !important;
  width: 40px !important;
  height: 28px !important;
  padding: 0px !important;
  text-align: center;
  font-size: 10px !important;
  border-radius: 6px !important;
  &:hover {
    border: none !important;
  }
  &:focus {
    border: 1px solid #007aff !important;
    box-shadow: none !important;
  }
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  color: white;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 15px;
  color: white;
  margin-bottom: 6px;
`;

const NormalText = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 15px;
  color: #898989;
`;

const SwapSettings: React.FC<{
  onSlippageSelect: (slippage: number) => void;
  slippage: number;
}> = ({ onSlippageSelect, slippage }) => {
  const [value, setValue] = useState(
    DEFAULT_SLIPPAGES.includes(slippage) ? slippage : -1,
  );
  const [customSlippage, setCustomSlippage] = useState(slippage);

  const handleChange = (e: RadioChangeEvent) => {
    const radioValue = e.target.value;
    setValue(radioValue);
    if (radioValue > 0) {
      onSlippageSelect(radioValue);
    }
  };

  const handleCustomInput = (e: any) => {
    const newSlippage = +e.target.value;
    setCustomSlippage(newSlippage);
    onSlippageSelect(newSlippage);
  };

  return (
    <Wrapper>
      <Row className="text-white p-2">
        <Col span={24} className="pb-0">
          <Title>Transaction Settings</Title>
          <div>
            <Subtitle>Slippage tolerance</Subtitle>
            <Radio.Group
              defaultValue={value}
              buttonStyle="solid"
              onChange={handleChange}
            >
              <Radio.Button value={0.1}>0.1%</Radio.Button>
              <Radio.Button value={0.5}>0.5%</Radio.Button>
              <Radio.Button value={1}>1%</Radio.Button>
              <Radio.Button value={2}>2%</Radio.Button>
              <Radio.Button value={3}>3%</Radio.Button>
              <Radio.Button value={5}>5%</Radio.Button>
              <Radio.Button value={10}>10%</Radio.Button>
              <Radio.Button value={-1}>
                <div className="d-flex align-center">
                  <span className="mr-1" style={{ whiteSpace: 'nowrap' }}>
                    Custom %
                  </span>
                  {value === -1 && (
                    <SettingsInput
                      type="number"
                      defaultValue={customSlippage}
                      onChange={handleCustomInput}
                    />
                  )}
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
          <div className="mt-2">
            <Subtitle>Transaction deadline</Subtitle>
            <SettingsInput /> &nbsp; <NormalText>Minutes</NormalText>
          </div>
        </Col>
        <Col span={24} className="pb-0 mt-2">
          <Title>Interface Settings</Title>
          <div className="mb-2">
            <Subtitle>Toggle expert mode</Subtitle>
            <Switch
              checkedChildren="On"
              unCheckedChildren="Off"
              defaultChecked
            />
          </div>
          <div className="mt-1 mb-2">
            <Subtitle>Disable multihops</Subtitle>
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </div>
        </Col>
      </Row>
    </Wrapper>
  );
};

export default SwapSettings;
