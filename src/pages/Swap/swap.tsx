import { SettingFilled, LoadingOutlined } from '@ant-design/icons';
import { Button, Typography, Slider } from 'antd';
import BigNumber from 'bignumber.js';
/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';

import Notification from '../../components/Notification/Notification';
import { AuthContext } from '../../contexts/AuthProvider';
import { DepoAPISevice } from '../../services/DepoAPIService';
import { __clearDebounce, __debounce } from '../../utility/debounce';
import { SwapBody, SwapContainer, SwapSettingIcons } from './components';
import FromTokenField from './components/FromTokenField';
import SwapSettings from './components/SwapSettings';
import ToTokenField from './components/ToTokenField';
import SwapConfirmModal from './components/SwapConfirmModal';
import useProgressBar from './hooks/useProgressBar';
import useSwap from './hooks/useSwap';
import sliderMarkOptions from '../../utility/slider-options';

import './style.scss';

const Swap: React.FC = () => {
  const { tokens, protocols, defaultCurrency, balances, web3Provider } =
    useContext(AuthContext);
  const {
    selectedTokens,
    setSelectedTokens,
    setCurrentSelecting,
    fromTokenAmount,
    setFromTokenAmount,
    toTokenAmount,
    setToTokenAmount,
    bestTrade,
    setBestTrade,
    alternativeTrade,
    swapData,
    loading,
    setLoading,
    balanceInput,
    setBalanceInput,
    estimatedGas,
    gasPrice,
    slippage,
    setSlippage,
    getQuote,
    handleTokenSelect,
    hasBalance,
    getSwapData,
    switchTokens,
    loadGasPriceWeb3,
    handleQueryString,
  } = useSwap();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [swapConfirmModalVisible, setSwapConfirmModalVisible] = useState(false);
  const [toTokenBalance, setToTokenBalance] = useState(0);

  const [nonce, setNonce] = useState(0);
  const { ProgressBar } = useProgressBar(
    () => {
      getQuote();
      loadGasPriceWeb3();
    },
    nonce,
    10,
  );
  const [ethPrice, setEthPrice] = useState('0');
  const [gasFeeUSD, setGasFeeUSD] = useState('0.00');
  const [rate, setRate] = useState(0);

  const [fromTokenPrice, setFromTokenPrice] = useState(0);
  const [toTokenPrice, setToTokenPrice] = useState(0);
  const [belowMarketPrice, setBelowMarketPrice] = useState(0);
  const [approving, setApproving] = useState(false);

  const getEthPrice = async () => {
    try {
      const currencyPrice = await DepoAPISevice.getPriceUSDT(defaultCurrency);
      setEthPrice(currencyPrice);
    } catch (error) {
      Notification({
        type: 'error',
        message: `Unable to get ${defaultCurrency} market price.`,
      });
    }
  };

  /**
   * Updates balance of the current currency.
   * Updates the amount of token0/token1 in order to get a factor between them
   */
  useEffect(() => {
    const getTokenPrice = async () => {
      try {
        let price = await DepoAPISevice.getPriceUSDTWithAddress(
          selectedTokens.from.symbol,
          selectedTokens.from.address,
        );
        setFromTokenPrice(price);
        if (selectedTokens.to) {
          price = await DepoAPISevice.getPriceUSDTWithAddress(
            selectedTokens.to.symbol,
            selectedTokens.to.address,
          );
          setToTokenPrice(price);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (balances[selectedTokens.from.address]) {
      setBalanceInput(parseFloat(balances[selectedTokens.from.address]) ?? 0);
    }
    if (selectedTokens.to && balances[selectedTokens.to.address]) {
      setToTokenBalance(parseFloat(balances[selectedTokens.to?.address]) ?? 0);
    }
    getTokenPrice();
  }, [balances, selectedTokens]);

  useEffect(() => {
    const gasFee = new BigNumber(estimatedGas * +gasPrice)
      .dividedBy('1000000000')
      .times(ethPrice)
      .toFormat(2);
    setGasFeeUSD(gasFee);
  }, [ethPrice, estimatedGas, gasPrice]);

  useEffect(() => {
    if (+toTokenAmount > 0 && +fromTokenAmount > 0) {
      const rate = +toTokenAmount / +fromTokenAmount;
      setRate(rate);
    }
  }, [fromTokenAmount, toTokenAmount]);

  /**
   * Updates the network gasprice when network is changed.
   */
  useEffect(() => {
    if (web3Provider) loadGasPriceWeb3();
    setSelectedTokens({
      ...selectedTokens,
      to: undefined,
    });
    setToTokenAmount('');
    setFromTokenAmount('');
    setBestTrade(undefined);
  }, [web3Provider]);

  /**
   * Update the native token info
   */
  useEffect(() => {
    if (!tokens.length) {
      setLoading(true);
    } else {
      setLoading(false);
      const nativeToken = tokens.find(
        (item) =>
          item.address.toLowerCase() ===
          '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      );
      if (nativeToken)
        setSelectedTokens({
          ...selectedTokens,
          from: nativeToken,
        });
    }
    getEthPrice();
    handleQueryString();
  }, [tokens]);

  /**
   * Get the quotes when the FromTokenAmount updates.
   */
  useEffect(() => {
    if (fromTokenAmount && +fromTokenAmount > 0) {
      __debounce(loadGasPriceWeb3, 1000, 'syncGasPriceWithWeb3');
      __debounce(() => getQuote(), 1000, 'getQuote');
      __debounce(() => getSwapData(), 1000, 'getSwapData');
    } else if (+fromTokenAmount <= 0 || fromTokenAmount === '.') {
      __clearDebounce('getQuote');
      setBestTrade(undefined);
      setToTokenAmount('');
    } else if (!toTokenAmount) {
      Notification({
        type: 'error',
        title: 'Error',
        message: 'Unable to get quotation!',
      });
    } else if (+fromTokenAmount > +balanceInput) {
      Notification({
        type: 'error',
        title: 'Error',
        message: 'Not enough funds!',
      });
    }
  }, [fromTokenAmount, selectedTokens]);

  useEffect(() => {
    if (bestTrade) {
      setNonce(nonce + 1);
    } else {
      setNonce(0);
    }
    return () => setNonce(0);
  }, [bestTrade]);

  /**
   * Triggers the fulfill modal.
   */
  useEffect(() => {
    if (swapData) {
      setNonce(0);
    }
  }, [swapData]);

  useEffect(() => {
    if (loading || !!alternativeTrade || !bestTrade) setNonce(0);
    else if (bestTrade && !alternativeTrade) setNonce(nonce + 1);
  }, [loading, alternativeTrade]);

  const handleSwap = async () => {
    if (approving) return;

    setApproving(true);
    try {
      const res = await getSwapData(true);
      if (res) {
        setSwapConfirmModalVisible(true);
      }
    } catch {}
    setApproving(false);
  };

  return (
    <div id="depo__swap">
      <Typography.Title style={{ color: '#fff' }}>Swap</Typography.Title>
      {/* <SwapGroup>
        <Radio.Group defaultValue="c" buttonStyle="solid">
          <Radio.Button value="a">ARBITRAGE</Radio.Button>
          <Radio.Button value="b">OVERVIEW</Radio.Button>
          <Radio.Button value="c">SWAP</Radio.Button>
        </Radio.Group>
      </SwapGroup> */}
      <SwapContainer>
        <SwapBody
          className="depo__swap-body-wrapper rounded pt-1"
          style={{ width: '100%' }}
        >
          <div style={{ padding: '28px 32px' }}>
            <div className="position-relative">
              <Typography
                style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
              >
                Swap
              </Typography>
              <SwapSettingIcons>
                <ProgressBar />
                <SettingFilled
                  className="m-1 cursor-pointer"
                  onClick={() => setSettingsVisible(!settingsVisible)}
                />
              </SwapSettingIcons>
            </div>
            <div className="px-0 py-4">
              Select a balance percentage
              <Slider
                disabled={loading}
                marks={sliderMarkOptions(99.8)}
                className="depo__slider"
                value={(+fromTokenAmount / balanceInput) * 100}
                onChange={($e: any) => {
                  if (!loading) {
                    const amount = (+balanceInput * ($e / 100)).toFixed(8);
                    setFromTokenAmount(amount);
                  }
                }}
              />
            </div>
            <div className="mt-4">
              <div className="d-flex justify-between">
                <Typography className="h6">From</Typography>
                <p style={{ color: '#8D8D8D' }}>Balance: {balanceInput} </p>
              </div>
              <FromTokenField
                currentSelecting={setCurrentSelecting}
                fromTokenAmount={fromTokenAmount}
                balanceAmount={balanceInput}
                fromTokenPrice={fromTokenPrice}
                selectedTokens={selectedTokens}
                switchTokens={switchTokens}
                setFromTokenAmount={setFromTokenAmount}
                onSelect={handleTokenSelect}
                disabled={loading}
              />
            </div>
            <div className="mt-3">
              <Typography className="h6">To</Typography>
              <ToTokenField
                currentSelecting={setCurrentSelecting}
                toTokenAmount={toTokenAmount}
                balanceAmount={toTokenBalance}
                selectedTokens={selectedTokens}
                onSelect={handleTokenSelect}
                loading={loading}
              />
            </div>

            {/* True price */}
            <div
              className="d-flex justify-content-between mt-2"
              style={{ color: '#007AFF' }}
            >
              <p style={{ textDecoration: 'underline', fontWeight: 600 }}>
                True price
              </p>
              <p style={{ fontWeight: 500 }}>{(+toTokenAmount).toFixed(3)}</p>
            </div>

            {/* Route */}
            <div style={{ minHeight: '120px' }}>
              {hasBalance() && selectedTokens.to && +fromTokenAmount ? (
                <div className="mt-1 p-3 rounded swap-detail-info">
                  <div className="detail-item">
                    <p>Route</p>
                    <div>
                      {bestTrade?.protocol.map((pt, i) =>
                        pt.map((route, j) => (
                          <div key={`${i}_${j}`} style={{ display: 'inline' }}>
                            <img
                              src={
                                protocols.filter((a) => a.id == route.name)[0]
                                  .img
                              }
                              width={20}
                              height={20}
                              style={{
                                border: '1px solid transparent',
                                borderRadius: '100%',
                              }}
                              alt={route.name}
                            />
                            <span>--{route.part}%--&gt;</span>
                          </div>
                        )),
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <p>Rate</p>
                    <p>
                      1 {selectedTokens.from.symbol} = {rate.toFixed(2)}&nbsp;
                      {selectedTokens.to ? selectedTokens.to.symbol : ''} ~$
                      {(+fromTokenPrice).toFixed(2)}
                    </p>
                  </div>
                  {/* <div className="detail-item">
                    <p>Below market price</p>
                    <p>{belowMarketPrice}%</p>
                  </div> */}
                  <div className="detail-item">
                    <p>Estimated tx cost</p>
                    <p>
                      {/* {estimatedGas * +gasPrice} gwei (~$
                      {gasFeeUSD}) */}
                      ${gasFeeUSD}
                    </p>
                  </div>
                  <div className="detail-item">
                    <p>Slippage tolerance</p>
                    <p>{slippage}%</p>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>

            {/* Swap button */}
            <div className="text-center">
              <Button
                className={`btn-depo btn-lg rounded-sm ${
                  hasBalance() && selectedTokens.to && +fromTokenAmount > 0
                    ? 'bg-swap-success'
                    : 'bg-swap-secondary'
                }`}
                style={{ border: 'none' }}
                onClick={handleSwap}
                disabled={
                  !hasBalance() ||
                  !selectedTokens.to ||
                  +fromTokenAmount == 0 ||
                  approving
                }
                block
              >
                {hasBalance() ? (
                  approving ? (
                    <LoadingOutlined />
                  ) : (
                    'Swap'
                  )
                ) : (
                  'Insufficient balance'
                )}
              </Button>
            </div>
            {/* <p style={{ marginTop: '10px', fontSize: '12px' }}>
              *Includes ARC swap fee
            </p> */}
          </div>

          {/* Settings Modal */}
          {settingsVisible && (
            <SwapSettings
              slippage={slippage}
              onSlippageSelect={(value) => setSlippage(value)}
            />
          )}
        </SwapBody>
      </SwapContainer>

      {/* Select price for swap */}
      <SwapConfirmModal
        visible={swapConfirmModalVisible}
        selectedTokens={selectedTokens}
        fromTokenAmount={fromTokenAmount}
        fromTokenPrice={fromTokenPrice}
        toTokenAmount={toTokenAmount}
        toTokenPrice={toTokenPrice}
        slippage={slippage}
        gasPrice={gasPrice}
        bestTrade={bestTrade}
        gasFeeUSD={gasFeeUSD}
        rate={rate}
        data={swapData}
        onClose={() => {
          setSwapConfirmModalVisible(false);
        }}
      />
    </div>
  );
};

export default Swap;

