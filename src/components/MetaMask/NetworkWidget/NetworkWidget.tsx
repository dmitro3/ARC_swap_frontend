/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Col, Row, Select } from 'antd';
import Notification from '../../Notification/Notification';
import './style.scss';
import ChainHelper from '../../../utility/chainlist/ChainHelper';
import Loading from '../../Loading/Loading';

import ETH from '../../../assets/tokens/eth.png';
import BNB from '../../../assets/tokens/bnb.png';
import MATIC from '../../../assets/tokens/matic.png';
import OETH from '../../../assets/tokens/optimism.svg';

import { AuthContext } from '../../../contexts/AuthProvider';
import MetamaskHandler from '../OnboardingButton/controller/metamask-onboarding';
import DepoModal from '../../DepoModal/DepoModal';

const NetworkWidget: React.FC = () => {
  const chainlist = ChainHelper.getChainlist();
  const [currentNetwork, setCurrentNetwork] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const [lastNetwork, setLastNetwork] = useState(0);
  const { setChainId, setWeb3Provider, setDefaultCurrency } =
    useContext(AuthContext);
  const [openWarningModal, setOpenWarningModal] = useState(false);
  const internalProviders = {
    1: 'https://morning-morning-cherry.quiknode.pro/1941e6ed73d14b2708a2cd3670b5e6032a515542/',
    137: 'https://dark-red-frog.matic.quiknode.pro/2232b38fa4dc39a6409e1fd0c2d35c3d32b8234f/',
  } as any;

  const tokenImages: any = {
    '0x1': ETH,
    '0x38': BNB,
    '0x89': MATIC,
    '0xa': OETH,
  };

  const setWeb3ProviderHandler = (provider: string, chainId: number) => {
    // if (internalProviders[chainId] && process.env.NODE_ENV === 'production') {
    //   setWeb3Provider(internalProviders[chainId]);
    // } else {
    //   setWeb3Provider(provider);
    // }
    setWeb3Provider(provider);
  };

  const handleSelect = async (chainIndex: number) => {
    if (chainlist[chainIndex]) {
      try {
        setIsLoading(true);
        await ChainHelper.changeNetwork(chainlist[chainIndex]);
        setCurrentNetwork(chainIndex);
        setChainId(parseInt(chainlist[chainIndex].chainId, 16));
        setWeb3ProviderHandler(
          chainlist[chainIndex].rpcUrls[0],
          parseInt(chainlist[chainIndex].chainId, 16),
        );
        setDefaultCurrency(chainlist[chainIndex].nativeCurrency.symbol);
        if (lastNetwork !== currentNetwork)
          Notification({
            type: 'success',
            message: `Network changed to ${chainlist[chainIndex].chainName}`,
          });
      } catch (error) {
        const err = error as Error;
        if (err.message && err.message.includes('already pending')) {
          Notification({
            type: 'info',
            message:
              'Seems like you have a pending request in your Metamask. Please verify before trying again.',
          });
        } else if (err.message.includes('User rejected')) {
          setCurrentNetwork(lastNetwork);
        } else if (err.message.includes('unlock')) {
          return;
        } else {
          Notification({
            type: 'error',
            message: 'Something happened during this request.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNetworkChange = (chainId: string) => {
    const networkIndex = chainlist.findIndex(
      (item) => item.chainId === chainId,
    );
    if (networkIndex >= 0) {
      setCurrentNetwork(networkIndex);
      setChainId(parseInt(chainlist[networkIndex].chainId, 16));
      setWeb3ProviderHandler(
        chainlist[networkIndex].rpcUrls[0],
        parseInt(chainId, 16),
      );
      setDefaultCurrency(chainlist[networkIndex].nativeCurrency.symbol);
    } else {
      handleSelect(0);
    }
  };

  const getNetworkTokenImg = (hexChainId: string) =>
    tokenImages[hexChainId] ?? tokenImages['0x1'];

  useEffect(() => {
    setTimeout(() => {
      if (window.ethereum) {
        const { chainId } = window.ethereum;
        handleNetworkChange(chainId);
        /**
         * Listens to the network changes in order to change the
         * app network and refetch user data.
         */
        MetamaskHandler.listenNetworkChange((networkId) => {
          const chainIndex = chainlist.findIndex(
            (item) => +parseInt(item.chainId, 16) === +networkId,
          );
          setCurrentNetwork(chainIndex);
        });
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (componentLoaded) {
      if (currentNetwork === -1) setOpenWarningModal(true);
      handleSelect(currentNetwork);
    } else {
      setComponentLoaded(true);
    }
  }, [currentNetwork]);

  return (
    <div className="depo__network-widget d-flex ml-3">
      <Select
        className="text-white bg-lightgrey ant-select-customize-input"
        value={currentNetwork}
        dropdownStyle={{
          background: '#070708',
          color: 'white !important',
          borderRadius: 10,
        }}
        onChange={($e) => {
          console.log(window);
          if (!window?.ethereum?.selectedAddress) {
            Notification({
              type: 'info',
              title: 'Please, unlock your wallet first.',
              message:
                'If you have already unlocked and keep seeing this message, maybe your extension is not enabled. Try refreshing the page.',
            });
            return;
          }
          setLastNetwork(currentNetwork);
          setCurrentNetwork($e);
        }}
        dropdownClassName="depo__dropdown-selector"
      >
        <Select.Option value={-1} disabled className="selectOptions">
          Select a Network
        </Select.Option>
        {!!chainlist.length &&
          chainlist.map((chain, index) => (
            <Select.Option
              value={index}
              disabled={index === currentNetwork}
              className="selectOptions"
              key={chain.chainId}
            >
              {isLoading ? (
                <LoadingOutlined className="mr-2" />
              ) : (
                <img
                  src={getNetworkTokenImg(chain.chainId)}
                  alt={chain.nativeCurrency.name}
                  height={20}
                  className="mr-2"
                />
              )}
              {chain.chainName}
            </Select.Option>
          ))}
      </Select>
      <DepoModal
        open={openWarningModal}
        onClose={() => {
          setOpenWarningModal(false);
        }}
      >
        <Row className="depo__fulfill-modal text-center bg-lightgrey py-3 rounded">
          <div
            className="close pointer"
            onClick={() => {
              setOpenWarningModal(false);
            }}
          >
            &times;
          </div>
          <Col xs={24} className="text-white">
            <h3 className="text-danger">Notice!</h3>
            <p>
              Seems that you are using a network that is not supported, and you
              may not be able to use all of our features.
            </p>
          </Col>
        </Row>
      </DepoModal>
    </div>
  );
};

export default NetworkWidget;
