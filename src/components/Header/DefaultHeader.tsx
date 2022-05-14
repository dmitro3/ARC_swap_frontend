/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useContext } from 'react';
import { Button, Grid } from 'antd';
import { LoadingOutlined, MenuOutlined } from '@ant-design/icons';
import { isMobile } from 'web3modal';

import useSwap from '../../pages/Swap/hooks/useSwap';
import useRefresh from '../../hooks/useRefresh';
import { AuthContext } from '../../contexts/AuthProvider';
import NetworkWidget from '../MetaMask/NetworkWidget/NetworkWidget';
import OnboardingButton from '../MetaMask/OnboardingButton/OnboardingButton';
import ConnectWalletButton from '../ConnectWalletButton';
import MetaMaskSvg from '../../assets/MetaMask_Fox 1.svg';
import gasStationSvg from '../../assets/gasStation.svg';

import './style.scss';

const DefaultHeader: React.FC<{ onMenuClick: () => void }> = ({
  onMenuClick,
}) => {
  const [cexBalance, setCexBalance] = useState('');
  const [metamaskBalance, setMetamaskBalance] = useState('0.000000');
  const [loadingDex, setLoadingDex] = useState(false);
  const [loadingCex, setLoadingCex] = useState(false);
  const {
    user,
    tokens,
    balances,
    walletAvailableValue,
    defaultCurrency,
    chainId,
    isAuthenticated,
    setDexIsLoading,
    setCexIsLoading,
    web3Provider,
    defaultCurrencyAddr,
  } = useContext(AuthContext);
  const { gasPrice, loadGasPriceWeb3 } = useSwap();
  const breakpoints = Grid.useBreakpoint();
  const mobile = isMobile();
  const { fastRefresh } = useRefresh();

  const getMetamaskBalance = async () => {
    if (balances[defaultCurrencyAddr]) {
      setLoadingDex(false);
      setMetamaskBalance((+balances[defaultCurrencyAddr]).toFixed(6));
    }
  };

  useEffect(() => {
    getMetamaskBalance();
  }, [balances]);

  useEffect(() => {
    setMetamaskBalance('0.000000');
    setLoadingDex(true);
  }, [chainId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMetamaskBalance('0.000000');
      setCexBalance('');
    } else {
      setLoadingDex(true);
      setLoadingCex(true);
    }
    if (!user?.exchanges || !user.exchanges.length) {
      setLoadingCex(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCexBalance(parseFloat(walletAvailableValue.toString()).toFixed(6));
    if (loadingCex) setLoadingCex(!loadingCex);
  }, [walletAvailableValue]);

  // Update context loaders to spread all over the dashboard
  useEffect(() => {
    setDexIsLoading(loadingDex);
  }, [loadingDex]);

  useEffect(() => {
    setCexIsLoading(loadingCex);
  }, [loadingCex]);

  useEffect(() => {
    if (web3Provider) loadGasPriceWeb3();
  }, [web3Provider, fastRefresh]);

  return (
    <div className="depo__headers">
      {!breakpoints.xl && (
        <Button
          icon={<MenuOutlined />}
          style={{ color: '#007aff' }}
          onClick={onMenuClick}
        />
      )}

      <div className="depo_balance_wrapper">
        {isAuthenticated && chainId === 1 && (
          <div className="gas-fee mb-2">
            <img src={gasStationSvg} height={20} alt="Gas fee" />{' '}
            {parseInt(gasPrice, 10)}
          </div>
        )}
        <div className="d-flex align-center metamask mb-2">
          {isAuthenticated && (
            <div
              className="px-2 metamask-balance"
              onClick={() => {
                getMetamaskBalance();
              }}
            >
              {loadingDex ? (
                <LoadingOutlined />
              ) : (
                <img src={MetaMaskSvg} height={20} alt="Metamask" />
              )}
              <span className="ml-1">
                {metamaskBalance} {defaultCurrency}
              </span>
            </div>
          )}
          {mobile ? <ConnectWalletButton /> : <OnboardingButton size="sm" />}
        </div>
        {!mobile && <NetworkWidget />}
      </div>
    </div>
  );
};

export default DefaultHeader;
