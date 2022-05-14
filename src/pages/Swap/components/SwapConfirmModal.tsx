import React, { useContext, useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import DepoModal from 'components/DepoModal/DepoModal';
import Web3 from 'web3';
import { AuthContext } from 'contexts/AuthProvider';
import downArrowImg from 'assets/arrow-down.svg';
import leftArrowImg from 'assets/arrow-left.svg';
import closeImg from 'assets/close.svg';
import Loading from 'components/Loading/Loading';
import { I1InchQuote } from 'interfaces/I1InchQuote';
import { I1InchSwap } from 'interfaces/I1InchSwap';
import { IToken } from '../../../interfaces/IToken';
import Notification from '../../../components/Notification/Notification';

const SwapConfirmModal: React.FC<{
  visible: boolean;
  selectedTokens: { from: IToken; to?: IToken };
  fromTokenAmount: string;
  fromTokenPrice: number;
  toTokenAmount: string;
  toTokenPrice: number;
  slippage: number;
  gasPrice: string;
  bestTrade: I1InchQuote | undefined;
  gasFeeUSD: string;
  rate: number;
  data: I1InchSwap | undefined;
  onClose: () => void;
}> = ({
  visible,
  selectedTokens,
  fromTokenAmount,
  fromTokenPrice,
  toTokenAmount,
  toTokenPrice,
  slippage,
  gasPrice,
  bestTrade,
  gasFeeUSD,
  rate,
  data,
  onClose,
}) => {
  const [priceSwitchVisible, setPriceSwitchVisible] = useState(true);
  const [fromTokenSymbol, setFromTokenSymbol] = useState('');
  const [toTokenSymbol, setToTokenSymbol] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [nonce, setNonce] = useState(0);
  const { getAllBalances, provider, chainId } = useContext(AuthContext);
  useEffect(() => {
    setFromTokenSymbol(selectedTokens.from.symbol);
    setToTokenSymbol(selectedTokens.to ? selectedTokens.to.symbol : '');
  }, [selectedTokens]);

  const onCloseHandler = () => {
    setPriceSwitchVisible(true);
    onClose();
  };
  const dispatchGtagEvent = () => {
    if (window.gtag) {
      window.gtag('event', 'swap_completed');
    }
  };
  const fulfill = async () => {
    if (data && (window.ethereum || provider)) {
      const web3 = new Web3(provider || (window.ethereum as any));
      try {
        setIsSwapping(true);
        setNonce(0);
        await web3.eth
          .sendTransaction({
            ...data.tx,
            maxPriorityFeePerGas: chainId === 1 ? 2000000000 : undefined,
          })
          .once('transactionHash', (txn) => {
            dispatchGtagEvent();
            setIsSwapping(false);
            Notification({
              type: 'info',
              message:
                'Transaction sent. Check your wallet in a few moments. Txn:',
              txnLink: `${txn}`,
            });
            onClose();
          })
          .once('confirmation', () => {
            getAllBalances();
            Notification({
              type: 'success',
              message: `Transaction confirmed.`,
            });
          })
          .once('error', (error) => {
            getAllBalances();
            Notification({
              type: 'error',
              message: error.message,
            });
          });
      } catch (error) {
        const err = error as any;
        console.log(err);
        if (err.code && err.code !== 4001) {
          Notification({
            type: 'error',
            title: 'Error',
            message: 'Something happened during this request.',
          });
        }
      } finally {
        onClose();
        setIsSwapping(false);
      }
    }
  };

  return (
    <DepoModal open={visible} onClose={onClose}>
      <div className="depo__fulfill-modal bg-lightgrey p-4 rounded">
        <Button type="link" className="btn-close" onClick={onCloseHandler}>
          <img src={closeImg} alt="down-arrow" />
        </Button>
        {priceSwitchVisible ? (
          <div className="depo__price-select-tab">
            <Typography className="title">Select price for swap</Typography>
            <div className="depo__price-select">
              {bestTrade?.protocol.map((protocol) => (
                <div
                  className="depo__price-option rounded"
                  key={protocol[0].fromTokenAddress}
                >
                  <div className="detail-item" style={{ fontWeight: 700 }}>
                    <p>Best price</p>
                    <p style={{ color: '#FFFFFF' }}>
                      {(+toTokenAmount).toFixed(3)}
                    </p>
                  </div>
                  <div
                    className="detail-item"
                    style={{ color: '#8D8D8D', fontSize: '10px' }}
                  >
                    <p>
                      {/* Estimated tx cost: {bestTrade?.estimatedGas * +gasPrice}{' '}
                      gwei */}
                      Estimated tx cost:
                    </p>
                    <p>~$ {gasFeeUSD}</p>
                  </div>
                  {protocol.map((route) => (
                    <div className="detail-item" key={route.name}>
                      <div>
                        <span>{route.name}</span>&nbsp;
                        <span style={{ color: '#007AFF' }}>
                          ({route.part}%)
                        </span>
                      </div>
                      <p style={{ color: '#8D8D8D' }}>
                        {((+toTokenAmount * route.part) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="py-3">
              <Button
                className="btn-depo bg-swap-success btn-md rounded-sm"
                onClick={() => {
                  setPriceSwitchVisible(false);
                }}
                block
              >
                Confirm switch
              </Button>
              {/* <p style={{ marginTop: '10px', fontSize: '12px' }}>
                *Includes ARC swap fee
              </p> */}
            </div>
          </div>
        ) : (
          <div className="depo__swap-confirm-tab">
            <Loading show={isSwapping} />
            <Button
              className="left-arrow"
              type="link"
              onClick={() => {
                setPriceSwitchVisible(true);
              }}
            >
              <img src={leftArrowImg} alt="left-arrow" />
            </Button>
            <Typography className="title">Swap confirmation</Typography>
            <div className="from-token">
              <Typography className="h6">From</Typography>
              <div className="token-detail-info">
                <div className="token">
                  <img
                    src={selectedTokens.from.logoURI}
                    alt="Source Token Logo"
                  />
                  <span>{fromTokenSymbol}</span>
                </div>
                <p className="token-amount">{(+fromTokenAmount).toFixed(3)}</p>
              </div>
              <div className="down-arrow">
                <img src={downArrowImg} alt="down-arrow" />
              </div>
            </div>
            <div className="to-token">
              <Typography className="h6">To</Typography>
              <div className="token-detail-info">
                <div className="token">
                  <img
                    src={selectedTokens.to ? selectedTokens.to.logoURI : ''}
                    alt="Target Token Logo"
                  />
                  <span>{toTokenSymbol}</span>
                </div>
                <p className="token-amount">{(+toTokenAmount).toFixed(3)}</p>
              </div>
            </div>
            <div className="swap-detail-info">
              <div className="detail-item">
                <p>{fromTokenSymbol} price</p>
                <div>
                  <span style={{ color: '#8D8D8D' }}>~${fromTokenPrice}</span>
                  &nbsp;
                  <span>
                    {rate.toFixed(8)} {toTokenSymbol}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <p>{toTokenSymbol} price</p>
                <div>
                  <span style={{ color: '#8D8D8D' }}>~${toTokenPrice}</span>
                  &nbsp;
                  <span>
                    {(1 / rate).toFixed(8)} {fromTokenSymbol}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <p>Minimum Received</p>
                <p>
                  {(+toTokenAmount * (1 - slippage / 100)).toFixed(8)}{' '}
                  {toTokenSymbol}
                </p>
              </div>
              <div className="detail-item">
                <p>Gas Price</p>
                <p>{gasPrice} gwei</p>
              </div>
              <div className="detail-item">
                <p>Slippage</p>
                <div>
                  {/* <Button type="link" className="btn-edit-slippage">
                    Edit
                  </Button>
                  &nbsp; */}
                  <span>{slippage}%</span>
                </div>
              </div>
            </div>
            <div className="py-3">
              <Button
                className="btn-depo bg-swap-success btn-md rounded-sm"
                onClick={fulfill}
                block
              >
                Confirm swap
              </Button>
            </div>
          </div>
        )}
      </div>
    </DepoModal>
  );
};

export default SwapConfirmModal;
