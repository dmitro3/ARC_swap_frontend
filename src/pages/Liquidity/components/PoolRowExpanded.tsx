/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Tabs, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { CopyFilled, LoadingOutlined } from '@ant-design/icons';
import money from '../../../utility/money';
import AddLiquidityHandler from './AddLiquidityHandler';
import { AuthContext } from '../../../contexts/AuthProvider';
import UniswapV2Service from '../../../services/UniswapV2Service';
import { PoolToken, SubgraphPair } from '../../../interfaces/Subgraphs';
import { SupportedAPIPools } from '../../../interfaces/NetworkPools';
import Notification from '../../../components/Notification/Notification';
import Loading from '../../../components/Loading/Loading';
import copyToClipboard from '../../../utility/copy-to-clipboard';
import SubgraphClient from '../../../services/SubgraphClient';
import PoolGraphic from './PoolGraphic';
import { IPoolDetails } from '../../../interfaces/IPoolDetails';
import tokenFactory from '../../../utility/token-factory';
import RemoveLiquidityHandler from './RemoveLiquidityHandler';
import cAPY from '../../../utility/apy';
import { __debounce } from '../../../utility/debounce';
import { DepoAPISevice } from '../../../services/DepoAPIService';

const PoolRowExpanded: React.FC<{
  content: SubgraphPair;
  protocol: keyof SupportedAPIPools;
}> = ({ content, protocol = 'uniswap-v2' }) => {
  const { balances, user, setUser, defaultCurrency, getAllBalances } =
    useContext(AuthContext);
  const [balance0, setBalance0] = useState('1');
  const [balance1, setBalance1] = useState('1');

  const [poolDetails, setPoolDetails] = useState<IPoolDetails>();
  const [poolData, setPoolData] = useState<string[]>([]);
  const [apy, setApy] = useState<string>('0');
  const [volume24h, setVolume24h] = useState<string>('$0.00');

  const [token0Allowance, setToken0Allowance] = useState('0');
  const [token1Allowance, setToken1Allowance] = useState('0');
  const [poolTokenAllowance, setPoolTokenAllowance] = useState('0');

  const [token0Loading, setToken0Loading] = useState(false);
  const [token1Loading, setToken1Loading] = useState(false);
  const [poolTokenLoading, setPoolTokenLoading] = useState(false);
  const [poolDataLoading, setPoolDataLoading] = useState(false);

  const { chainId } = useContext(AuthContext);

  /**
   * Binds the argument token to the correct token allowance setter
   * @param token
   * @returns
   */
  const bindSetter = (token: PoolToken) => {
    let fn;
    if (token.symbol === content.token0.symbol) {
      fn = {
        setAllowance: setToken0Allowance,
        setLoading: setToken0Loading,
      };
    } else if (token.symbol === content.token1.symbol) {
      fn = {
        setAllowance: setToken1Allowance,
        setLoading: setToken1Loading,
      };
    } else if (token.symbol === 'LPToken') {
      fn = {
        setAllowance: setPoolTokenAllowance,
        setLoading: setPoolTokenLoading,
      };
    } else {
      throw new Error('Invalid token');
    }
    return fn;
  };

  /**
   * Fetch a single token allowance
   * @param token
   */
  const fetchAllowance = async (token: PoolToken) => {
    if (user?.settings?.defaultWallet) {
      const state = bindSetter(token);
      try {
        const walletAddr = user.settings.defaultWallet;
        state.setLoading(true);
        const allowance = await UniswapV2Service.fetchAllowance(
          walletAddr,
          protocol,
          token,
        );
        state.setAllowance(new BigNumber(allowance).times(0.999).toString());
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          message: `Couldn't get allowance for ${token.symbol}`,
        });
      } finally {
        state.setLoading(false);
      }
    }
  };

  const fetchPoolData = async () => {
    if (user?.settings?.defaultWallet) {
      try {
        const result = await UniswapV2Service.fetchPoolAssetsDetails(
          content.token0,
          content.token1,
          content.id,
          user.settings.defaultWallet,
        );
        setPoolDetails(result);
      } catch (error) {
        const err = error as Error;
        Notification({
          type: 'error',
          message: err.message,
        });
      }
    }
  };

  /**
   * Fetch all token allowances
   */
  const fetchAllowances = async () => {
    if (user?.settings?.defaultWallet) {
      const promises: Promise<any>[] = [0, 1].map((item) =>
        fetchAllowance(content[`token${item}`]),
      );
      promises.push(fetchAllowance(tokenFactory(content.id)));
      Promise.all(promises);
    }
  };

  const getProtocolImage = () => {
    switch (protocol) {
      case 'uniswap-v2':
        return 'https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png';
      case 'pancakeswap':
        return 'https://tokens.1inch.io/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.png';
      case 'sushiswap':
        return 'https://tokens.1inch.io/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2.png';
      default:
        return '';
    }
  };

  const getPool = () => {
    if (chainId) {
      setPoolData([]);
      setTimeout(async () => {
        try {
          setPoolDataLoading(true);
          const client = new SubgraphClient(protocol, chainId);
          const pool = await client.getDailyVolume(content.id);
          setPoolData(pool);
          setApy(cAPY(pool));
          // return pool;
        } catch (error) {
          console.error(error);
        } finally {
          setPoolDataLoading(false);
        }
      }, 250);
    }
  };

  // const poolObj = getPool().then((result) => result);

  const addAssetToWallet = async () => {
    if (window.ethereum) {
      try {
        const result = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: content.contractAddress,
              symbol: `${content.label.replace(/[/\- ]+/, '')}`,
              decimals: 18,
              image: getProtocolImage(),
            },
          },
        });
      } catch (error) {
        const err = error as Error;
        Notification({
          type: 'error',
          message: err.message,
        });
      }
    }
  };
  const allowSpender = async (token: PoolToken) => {
    if (user?.settings?.defaultWallet) {
      const allowance = UniswapV2Service.approveAllowanceFactory(
        new BigNumber(2).pow(128),
        token,
        protocol,
      );
      const state = bindSetter(token);
      try {
        state.setLoading(true);
        allowance
          .send({
            from: user?.settings?.defaultWallet,
          })
          .once('transactionHash', () => {
            Notification({
              type: 'info',
              message: 'Transaction sent. Please wait confirmation to proceed.',
            });
          })
          .once('confirmation', () => {
            setTimeout(() => {
              fetchAllowances();
            }, 1000);
            state.setLoading(false);
            Notification({
              type: 'success',
              message: 'Allowance confirmed!',
            });
          })
          .once('error', (err: any) => {
            state.setLoading(false);
            Notification({
              type: 'error',
              message: err.message,
            });
          });
      } catch (error) {
        state.setLoading(false);
        const txnError = error as Error;
        if (txnError.message.includes('denied')) {
          Notification({
            type: 'info',
            message: 'Cancelled by the user.',
          });
        } else {
          Notification({
            type: 'error',
            message: txnError.message,
          });
        }
      }
    } else {
      Notification({
        type: 'error',
        message: 'Connect a wallet first!',
      });
    }
  };

  const addPoolToUser = async () => {
    // Includes the pool into the users provision list.
    try {
      if (chainId && user) {
        const updatedUser = await DepoAPISevice.addLiquidityPool(
          user,
          content,
          protocol,
          chainId,
        );
        setUser(updatedUser);
        console.log({ updatedUser });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addOrRemoveLiquidity = async (
    amount0: string,
    amount1: string,
    liquidityTokenAmount?: string,
  ) => {
    if (user?.settings?.defaultWallet) {
      /**
       * Amount of token0 in wei
       */
      const token0Amount = new BigNumber(amount0).multipliedBy(
        new BigNumber(10).pow(content.token0.decimals),
      );
      /**
       * Amount of token1 in wei
       */
      const token1Amount = new BigNumber(amount1).multipliedBy(
        new BigNumber(10).pow(content.token1.decimals),
      );
      /**
       * Liquidity token amount converted to wei
       */
      let liquidity;
      if (liquidityTokenAmount)
        liquidity = new BigNumber(
          liquidityTokenAmount.substr(0, 16),
        ).multipliedBy(new BigNumber(10).pow(18));

      try {
        await UniswapV2Service.execute(
          content.token0,
          content.token1,
          defaultCurrency,
          user.settings.defaultWallet,
          token0Amount,
          token1Amount,
          protocol,
          liquidity,
        )
          .send({
            from: user.settings.defaultWallet,
          })
          .once('transactionHash', (txn: string) => {
            addPoolToUser();
            Notification({
              type: 'info',
              message: `Transaction sent. Please, add the proper liquidity token to your Meta Mask. \nTxn: ${txn}.`,
            });
          })
          .once('confirmation', () => {
            let message = [
              'Liquidity provided to',
              `${protocol}: ${content.token0.symbol}/${content.token1.symbol} successfully.`,
            ];
            getAllBalances();
            fetchPoolData();
            if (liquidityTokenAmount) {
              message[0] = 'Liquidity removed from';
            }
            Notification({
              type: 'success',
              message: message.join(' '),
            });
          });
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('denied')) {
          Notification({
            type: 'info',
            message: 'Cancelled by the user.',
          });
        } else {
          Notification({
            type: 'error',
            message: err.message,
          });
        }
      }
    }
  };

  const removeLiquidity = async (amount0: string, amount1: string) => {
    const pair = await UniswapV2Service.fetchPairData(
      content.token0.id,
      content.token1.id,
    );
  };
  useEffect(() => {
    setBalance0(balances[content.token0.id] ?? '0');
    setBalance1(balances[content.token1.id] ?? '0');
    // setBalance0('4000');
    // setBalance1('4000');
  }, [balances]);

  useEffect(() => {
    fetchAllowances();
    fetchPoolData();
    getPool();
  }, [content.id, protocol]);

  useEffect(() => {
    fetchPoolData();
  }, [user?.settings?.defaultWallet]);

  useEffect(() => {
    if (poolData[poolData.length - 1] && +poolData[poolData.length - 1] > 0) {
      const value = poolData[poolData.length - 1];
      setVolume24h(
        money(Number.isNaN(+value) ? 0 : +value, 'en-US', 'USD', 2, 2),
      );
    } else {
      const data = [...poolData];
      const lastVolumeRegister = data.reverse().findIndex((item) => +item > 0);
      const value = data[lastVolumeRegister];
      setVolume24h(
        money(Number.isNaN(+value) ? 0 : +value, 'en-US', 'USD', 2, 2),
      );
    }
  }, [poolData]);

  return (
    <Row className="depo__details-row-expanded rounded-bottom p-0">
      {/* <div className="watch-asset-btn">
        <Tooltip title="Copy LP token address to clipboard">
          <CopyFilled
            className="text-secondary mr-2"
            onClick={() => {
              copyToClipboard(content.id);
              Notification({
                type: 'info',
                message: 'Pool token address copied to clipboard.',
              });
            }}
          />
        </Tooltip>
      </div> */}
      <Col xs={24} lg={14} className="depo__expanded-row-chart">
        <div
          style={{ height: 305, width: '100%' }}
          className="bg-dark rounded d-flex justify-center align-center pool-chart"
        >
          <div
            className="text-secondary"
            style={{ width: '100%', paddingTop: '20px' }}
          >
            <PoolGraphic pairContent={poolData} />
          </div>
        </div>
        <Row className="m-0 p-0" justify="space-between">
          <Col xs={24} md={12}>
            <div className="d-flex justify-between">
              <span>Liquidity (24h)</span>
              <span style={{ fontWeight: 'bold' }}>
                {poolDataLoading ? (
                  <LoadingOutlined />
                ) : (
                  money(+content.reserveUSD, 'en-US', 'USD', 2, 2)
                )}
              </span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="d-flex justify-between">
              <span>Pool APY</span>
              <span>{poolDataLoading ? <LoadingOutlined /> : apy}</span>
            </div>
            {/* <div className="d-flex justify-between">
              <span>- ????</span>
              <span style={{ fontWeight: 'bold' }}>$ 12.345</span>
            </div> */}
          </Col>
          <Col xs={24} md={12}>
            <div className="d-flex justify-between">
              <span>Volume(24h)</span>
              <span style={{ fontWeight: 'bold' }}>
                {poolDataLoading ? <LoadingOutlined /> : volume24h}
              </span>
            </div>
            {/* <div className="d-flex justify-between">
              <span>Earnings(24h)</span>
              <span style={{ fontWeight: 'bold' }}>{money(123.45)}</span>
            </div> */}
          </Col>
        </Row>
      </Col>
      <Col
        xs={24}
        lg={10}
        className="depo__expanded-row-form pool-input rounded-bottom"
      >
        <Tabs className="depo__tabs rounded-bottom">
          <Tabs.TabPane tab="Add Liquidity" key="1">
            <AddLiquidityHandler
              onConfirm={addOrRemoveLiquidity}
              balance0={balance0}
              balance1={balance1}
              token0Allowance={token0Allowance}
              token1Allowance={token1Allowance}
              token0Loading={token0Loading}
              token1Loading={token1Loading}
              content={content}
              onRequestAllowance={allowSpender}
            />
          </Tabs.TabPane>
          {user?.settings?.defaultWallet ? (
            <Tabs.TabPane tab="Remove Liquidity" key="2">
              {!!poolDetails && (
                <RemoveLiquidityHandler
                  onConfirm={addOrRemoveLiquidity}
                  poolDetails={poolDetails}
                  variant="danger"
                  content={content}
                  poolTokenAllowance={poolTokenAllowance}
                  onRequestAllowance={allowSpender}
                  poolTokenLoading={poolTokenLoading}
                />
              )}
            </Tabs.TabPane>
          ) : null}
        </Tabs>
      </Col>
    </Row>
  );
};
export default PoolRowExpanded;
