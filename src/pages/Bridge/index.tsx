/* eslint-disable no-nested-ternary */
import { Web3Provider } from '@ethersproject/providers';
import { Button, Col, Row, Table, Slider } from 'antd';
import { Breakpoint } from 'antd/lib/_util/responsiveObserve';
import { LoadingOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useState } from 'react';
import { ethers, Signer } from 'ethers';
import {
  NxtpSdk,
  NxtpSdkEvents,
  GetTransferQuote,
  HistoricalTransactionStatus,
} from '@connext/nxtp-sdk';
import {
  AuctionResponse,
  getChainData,
  ChainData,
  TransactionPreparedEvent,
} from '@connext/nxtp-utils';

import { AuthContext } from 'contexts/AuthProvider';
import Notification from 'components/Notification/Notification';
import IBridgeTransaction from 'interfaces/IBridgeTransaction';
import sliderMarkOptions from 'utility/slider-options';

import { chainConfig } from './config';
import BridgeProvider, { BridgeContext } from './context/bridgeContext';
import Activity from './components/Activity';
import ChainSelector from './components/ChainSelector';
import TokenSelector from './components/TokenSelector';

import {
  BridgeContainer,
  BridgeBody,
  BridgeLabel,
  BridgeInputWrapper,
  BridgeTokenWrapper,
  BridgeInfoWrapper,
  BridgeAmountInput,
  BridgeTransactions,
} from './components/styles';

const BridgeUI: React.FC<{ chainData: Map<string, ChainData> }> = ({
  chainData,
}) => {
  const [sdk, setSdk] = useState<NxtpSdk>();
  const [signer, setSigner] = useState<Signer>();
  const [balance, setBalance] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [gasFeeAmount, setGasFeeAmount] = useState('');
  const [metaTxFeeInRouter, setMetaTxFeeInRouter] = useState('');
  const [auctionResponse, setAuctionResponse] = useState<AuctionResponse>();
  const [loading, setLoading] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<IBridgeTransaction[]>([]);

  const { user, provider, chainId } = useContext(AuthContext);

  const {
    sendingChainId,
    sendingAssetId,
    receivingChainId,
    receivingAssetId,
    amount,
    setAmount,
  } = useContext(BridgeContext);

  const cancelTransfer = async (tx: any) => {
    if (!sdk) {
      return;
    }

    const { crosschainTx } = tx;
    const { sending, invariant } = crosschainTx;
    const txData = { ...invariant, ...sending };

    await sdk.cancel({ signature: '0x', txData }, invariant.sendingChainId);
  };

  const finishTransfer = async (tx: any) => {
    if (!sdk) {
      return;
    }

    const { crosschainTx, bidSignature, encodedBid, encryptedCallData } = tx;
    const { receiving, invariant } = crosschainTx;
    if (receiving) {
      const txData = { ...invariant, ...receiving };
      const event: Omit<TransactionPreparedEvent, 'caller'> = {
        bidSignature,
        encodedBid,
        encryptedCallData,
        txData,
      };
      await sdk.fulfillTransfer(event, true);
    }
  };

  const getAsset = (chainId: number, address: string) => {
    const assetId = chainData.get(chainId.toString())?.assetId;
    if (assetId) {
      const key = Object.keys(assetId).find(
        (id) => id.toLowerCase() === address.toLowerCase(),
      );
      if (key) {
        return assetId[key];
      }
    }
    return null;
  };

  const getTransferQuote = async (): Promise<GetTransferQuote | undefined> => {
    if (!sdk || !user?.settings?.defaultWallet) {
      return;
    }

    if (chainId !== sendingChainId) {
      Notification({
        type: 'error',
        message: `Please switch chains to the sending chain!`,
      });
      return;
    }

    setLoading(true);
    try {
      const sendingAsset = getAsset(sendingChainId, sendingAssetId);
      const receivingAsset = getAsset(receivingChainId, receivingAssetId);
      if (sendingAsset && receivingAsset) {
        const response = await sdk.getTransferQuote({
          sendingChainId,
          sendingAssetId,
          receivingChainId,
          receivingAssetId,
          receivingAddress: user?.settings?.defaultWallet,
          amount: ethers.utils
            .parseUnits(amount, sendingAsset.decimals)
            .toString(),
          expiry: Math.floor(Date.now() / 1000) + 3600 * 24 * 3, // 3 days
        });
        const receivedAmount = ethers.utils.formatUnits(
          response?.bid.amountReceived ?? ethers.constants.Zero,
          receivingAsset.decimals,
        );
        const gasFeeAmount = ethers.utils.formatUnits(
          response?.gasFeeInReceivingToken ?? ethers.constants.Zero,
          receivingAsset.decimals,
        );
        const metaTxFeeInRouter = ethers.utils.formatUnits(
          response?.metaTxRelayerFee ?? ethers.constants.Zero,
          receivingAsset.decimals,
        );
        setReceivedAmount(receivedAmount);
        setGasFeeAmount(gasFeeAmount);
        setMetaTxFeeInRouter(metaTxFeeInRouter);
        setAuctionResponse(response);
      }
    } catch (err: any) {
      Notification({
        type: 'error',
        message: err.message,
      });
    }
    setLoading(false);
  };

  const handleBridge = async () => {
    if (!sdk || !auctionResponse) {
      return;
    }

    if (chainId !== auctionResponse.bid.sendingChainId) {
      Notification({
        type: 'error',
        message: `Please switch chains to the sending chain!`,
      });
      return;
    }

    setLoading(true);
    try {
      await sdk.prepareTransfer(auctionResponse, true);
    } catch (err: any) {
      Notification({
        type: 'error',
        message: err.message,
      });
    }
    setLoading(false);

    setReceivedAmount('');
    setGasFeeAmount('');
    setMetaTxFeeInRouter('');
    setAuctionResponse(undefined);
  };

  const getExplorerLinkForTx = (
    tx: string,
    chainId: number,
    chainData: Map<string, ChainData>,
  ) => {
    const explorer = chainData.get(chainId.toString())?.explorers[0]?.url;
    return explorer ? `${explorer}/tx/${tx}` : '#';
  };

  const parseTx = (tx: any): IBridgeTransaction => {
    const { crosschainTx, status, preparedTimestamp, fulfilledTxHash } = tx;
    const { receiving, sending, invariant } = crosschainTx;
    const variant = receiving ?? sending;
    const { sendingChainId, sendingAssetId } = invariant;
    const sendingAsset = getAsset(sendingChainId, sendingAssetId);
    const sentAmount = ethers.utils.formatUnits(
      sending?.amount ?? '0',
      sendingAsset?.decimals,
    );
    const { receivingChainId, receivingAssetId } = invariant;
    const receivingAsset = getAsset(receivingChainId, receivingAssetId);
    const receivedAmount = ethers.utils.formatUnits(
      receiving?.amount ?? '0',
      receivingAsset?.decimals,
    );
    const { transactionId } = invariant;

    return {
      transactionId,
      fromChainId: sendingChainId,
      fromTokenAddress: sendingAsset?.mainnetEquivalent,
      fromAmount: `${+(+sentAmount).toFixed(6)} ${sendingAsset?.symbol}`,
      toChainId: receivingChainId,
      toTokenAddress: receivingAsset?.mainnetEquivalent,
      toAmount: `${+(+receivedAmount).toFixed(6)} ${receivingAsset?.symbol}`,
      preparedAt: preparedTimestamp,
      status,
      expiry: variant.expiry,
      fulfilledTxHash,
      action: tx,
    };
  };

  const parseTxs = (txs: any[]): IBridgeTransaction[] =>
    txs.map((tx) => parseTx(tx));

  const columns = [
    {
      title: 'From',
      key: 'from',
      render: (tx: IBridgeTransaction) => (
        <Activity.Asset
          chainId={tx.fromChainId}
          tokenAddress={tx.fromTokenAddress}
          amount={tx.fromAmount}
        />
      ),
    },
    {
      title: 'To',
      key: 'to',
      render: (tx: IBridgeTransaction) => (
        <Activity.Asset
          chainId={tx.toChainId}
          tokenAddress={tx.toTokenAddress}
          amount={tx.toAmount}
        />
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (tx: IBridgeTransaction) => (
        <Activity.Time preparedAt={tx.preparedAt} />
      ),
      responsive: ['lg' as Breakpoint],
    },
    {
      title: 'Status',
      key: 'status',
      render: (tx: IBridgeTransaction) => (
        <Activity.Status status={tx.status} expiry={tx.expiry} />
      ),
      responsive: ['lg' as Breakpoint],
    },
    {
      title: 'Action',
      key: 'action',
      render: ({
        action,
        fulfilledTxHash,
        toChainId,
        status,
        expiry,
      }: IBridgeTransaction) => {
        if (
          status === HistoricalTransactionStatus.FULFILLED &&
          fulfilledTxHash
        ) {
          return (
            <a
              href={getExplorerLinkForTx(fulfilledTxHash, toChainId, chainData)}
              target="_blank"
              rel="noreferrer"
            >
              View Tx
            </a>
          );
        }
        if (status === NxtpSdkEvents.ReceiverTransactionPrepared) {
          return (
            <Button
              className="bg-success"
              type="link"
              onClick={() => finishTransfer(action)}
            >
              Finish
            </Button>
          );
        }
        if (expiry && Date.now() / 1000 > expiry) {
          return (
            <Button
              className="bg-danger"
              type="link"
              onClick={() => cancelTransfer(action)}
            >
              Cancel
            </Button>
          );
        }
        return <></>;
      },
    },
  ];

  useEffect(() => {
    const init = async () => {
      if (!user?.settings?.defaultWallet || (!window.ethereum && !provider)) {
        return;
      }
      const _provider: Web3Provider =
        provider || new Web3Provider(window.ethereum);
      const _signer: Signer = _provider.getSigner();

      try {
        const _sdk = await NxtpSdk.create({
          chainConfig,
          signer: _signer,
          network: 'mainnet',
        });

        const activeTxs = await _sdk.getActiveTransactions();
        const historicalTxs = await _sdk.getHistoricalTransactions();
        setTransactions(parseTxs([...activeTxs, ...historicalTxs]));

        _sdk.attach(NxtpSdkEvents.SenderTransactionPrepared, (data) => {
          const { amount, expiry, preparedBlockNumber, ...invariant } =
            data.txData;
          const tx = {
            crosschainTx: {
              invariant,
              sending: { amount, expiry, preparedBlockNumber },
            },
            preparedTimestamp: Math.floor(Date.now() / 1000),
            bidSignature: data.bidSignature,
            encodedBid: data.encodedBid,
            encryptedCallData: data.encryptedCallData,
            status: NxtpSdkEvents.SenderTransactionPrepared,
          };
          setTransactions([parseTx(tx), ...transactions]);
        });

        _sdk.attach(NxtpSdkEvents.ReceiverTransactionPrepared, (data) => {
          console.log(data);
          const { amount, expiry, preparedBlockNumber, ...invariant } =
            data.txData;
          const index = transactions.findIndex(
            (t) => t.transactionId === invariant.transactionId,
          );

          if (index === -1) {
            const tx = {
              preparedTimestamp: Math.floor(Date.now() / 1000),
              crosschainTx: {
                invariant,
                sending: {} as any, // Find to do this, since it defaults to receiver side info
                receiving: { amount, expiry, preparedBlockNumber },
              },
              bidSignature: data.bidSignature,
              encodedBid: data.encodedBid,
              encryptedCallData: data.encryptedCallData,
              status: NxtpSdkEvents.ReceiverTransactionPrepared,
            };
            setTransactions([parseTx(tx), ...transactions]);
          } else {
            const txs = [...transactions];
            const tx = { ...txs[index] };
            txs[index] = {
              ...tx,
              status: NxtpSdkEvents.ReceiverTransactionPrepared,
            };
            setTransactions(txs);
          }
        });

        _sdk.attach(
          NxtpSdkEvents.ReceiverTransactionFulfilled,
          async (data) => {
            const { transactionHash, txData } = data;
            const index = transactions.findIndex(
              (t) => t.transactionId === txData.transactionId,
            );
            if (index >= 0) {
              const txs = [...transactions];
              const tx = { ...txs[index] };
              txs[index] = {
                ...tx,
                status: HistoricalTransactionStatus.FULFILLED,
                fulfilledTxHash: transactionHash,
                expiry: undefined,
              };
              setTransactions(txs);
            }
          },
        );

        _sdk.attach(
          NxtpSdkEvents.ReceiverTransactionCancelled,
          async (data) => {
            const index = transactions.findIndex(
              (t) => t.transactionId === data.txData.transactionId,
            );
            if (index >= 0) {
              const txs = [...transactions];
              const tx = { ...txs[index] };
              txs[index] = {
                ...tx,
                status: HistoricalTransactionStatus.CANCELLED,
                fulfilledTxHash: undefined,
                expiry: undefined,
              };
              setTransactions(txs);
            }
          },
        );

        setSdk(_sdk);
        setSigner(_signer);
      } catch (err) {
        console.log(err);
      }
    };
    if (user?.settings?.defaultWallet && chainId) {
      init();
    }
  }, [user, chainId]);

  useEffect(() => {
    const updateBalance = async () => {
      const address = await signer?.getAddress();
      if (address) {
        try {
          const balance = await sdk?.getBalance(
            sendingChainId,
            address,
            sendingAssetId,
          );
          if (balance) {
            const decimals = await sdk?.getDecimalsForAsset(
              sendingChainId,
              sendingAssetId,
            );
            setBalance(
              (+ethers.utils.formatUnits(balance, decimals)).toFixed(6),
            );
          }
        } catch (err) {
          console.log(err);
        }
      }
    };
    if (sdk && signer) {
      setBalance('');
      updateBalance();
    }
  }, [sdk, signer, sendingAssetId, sendingChainId]);

  return (
    <>
      <h3 className="page-title">Bridge</h3>
      <Row className="p-0" gutter={[16, 16]}>
        <Col>
          <BridgeBody>
            <Row style={{ zIndex: 0 }}>
              <Col xs={24} className="pb-0 pt-4">
                <BridgeLabel fontSize={20} fontWeight={600}>
                  Bridge
                </BridgeLabel>
              </Col>
              <Col xs={24}>
                <div className="d-flex align-center justify-between my-2">
                  <BridgeLabel fontWeight={700}>From</BridgeLabel>
                  <ChainSelector type="from" />
                </div>
                <BridgeInputWrapper>
                  <BridgeTokenWrapper>
                    <TokenSelector type="from" />
                    <BridgeAmountInput
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </BridgeTokenWrapper>
                  <BridgeInfoWrapper>
                    <span>Balance</span>
                    <span>{balance}</span>
                  </BridgeInfoWrapper>
                </BridgeInputWrapper>
              </Col>
              <Col xs={24}>
                <div className="d-flex align-center justify-between my-2">
                  <BridgeLabel fontWeight={700}>To</BridgeLabel>
                  <ChainSelector type="to" />
                </div>
                <BridgeInputWrapper>
                  <BridgeTokenWrapper>
                    <TokenSelector type="to" />
                    <BridgeAmountInput
                      readOnly
                      value={(+receivedAmount).toFixed(6)}
                    />
                  </BridgeTokenWrapper>
                  {!!gasFeeAmount && (
                    <BridgeInfoWrapper>
                      <span>Gas Fee</span>
                      <span>{(+gasFeeAmount).toFixed(6)}</span>
                    </BridgeInfoWrapper>
                  )}
                  {!!metaTxFeeInRouter && (
                    <BridgeInfoWrapper>
                      <span>Router Fee</span>
                      <span>{(+metaTxFeeInRouter).toFixed(6)}</span>
                    </BridgeInfoWrapper>
                  )}
                </BridgeInputWrapper>
              </Col>
              <Col xs={24}>
                <Slider
                  disabled={!balance}
                  marks={sliderMarkOptions(100)}
                  className="depo__slider"
                  value={balance ? (+amount / +balance) * 100 : 0}
                  onChange={(value: any) => {
                    if (balance) {
                      const amount = (+balance * (value / 100)).toFixed(6);
                      setAmount(amount);
                    }
                  }}
                />
              </Col>
              <Col xs={24}>
                <Button
                  className="my-4 btn-depo btn-lg bg-success"
                  style={{ border: 'none', width: '100%', fontSize: 20 }}
                  onClick={!auctionResponse ? getTransferQuote : handleBridge}
                >
                  {loading && <LoadingOutlined />}{' '}
                  {!auctionResponse ? 'Get Transfer Quote' : 'Bridge'}
                </Button>
              </Col>
            </Row>
          </BridgeBody>
        </Col>
        <Col flex="auto">
          <BridgeTransactions>
            <BridgeLabel fontSize={20} fontWeight={600} className="mb-4">
              Recent Activity
            </BridgeLabel>
            <Table columns={columns} dataSource={transactions} />
          </BridgeTransactions>
        </Col>
      </Row>
    </>
  );
};

const Bridge: React.FC = () => {
  const [chainData, setChainData] = useState<Map<string, ChainData>>();

  useEffect(() => {
    const init = async () => {
      const data = await getChainData();
      setChainData(data);
    };
    init();
  }, []);

  if (!chainData) return null;

  return (
    <BridgeProvider>
      <BridgeUI chainData={chainData} />
    </BridgeProvider>
  );
};

export default Bridge;
