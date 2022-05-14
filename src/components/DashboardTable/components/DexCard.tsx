import React, { useContext, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { columsDex } from '../utils/info';
import CoingeckoService from '../../../services/CoingeckoService';
import '../style.scss';
import DexBalanceChild from './DexBalanceChild';
import BalanceSummary from './BalanceSummary';
import Notification from '../../Notification/Notification';
import money from '../../../utility/money';
import { DepoAPISevice } from '../../../services/DepoAPIService';
import { AuthContext } from '../../../contexts/AuthProvider';
import { IBalanceSummaryTable } from '../../../interfaces/BalanceSummary';
import UniswapV2Service from '../../../services/UniswapV2Service';
import { IPoolDetails } from '../../../interfaces/IPoolDetails';
import { __debounce } from '../../../utility/debounce';
import { ILiquidityProvision } from '../../../interfaces/ILiquidityProvision';

const DexCard: React.FC<{
  afterFetchValues: (assetsValues: any[]) => void;
}> = ({ afterFetchValues }) => {
  const { tokens, balances, user, dexLoading, defaultCurrency } =
    useContext(AuthContext);
  const [selectedRow, setSelectedRow] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * The preload data
   */
  const [tableItems, setTableItems] = useState<IBalanceSummaryTable[]>([
    {
      name: 'Pools',
      value: '$0.00',
    },
    {
      name: 'Holdings',
      value: '$0.00',
    },
  ]);
  /**
   * The current displaying data in the children
   */
  const [display, setDisplay] = useState<IBalanceSummaryTable[] | undefined>(
    undefined,
  );

  /**
   * The holding table
   */
  const [holdingData, setHoldingData] = useState<IBalanceSummaryTable[]>([]);
  /**
   * The pool data
   */
  const [poolData, setPoolData] = useState<IBalanceSummaryTable[]>([]);

  const tokenAddress = (symbol: string) =>
    tokens.find((token) => token.symbol === symbol)?.address;

  const tokenSymbol = (address: string) =>
    tokens.find((token) => token.address === address)?.symbol;

  const removeZeroBalances = (): {
    name: string;
    value: string;
    address: string;
  }[] => {
    const nonZeroBalances: any[] = [];
    Object.keys(balances).forEach((key) => {
      if (+balances[key] > 0)
        nonZeroBalances.push({
          name: tokenSymbol(key),
          value: balances[key],
          address: key,
        });
    });
    return nonZeroBalances;
  };

  const fetchHoldingData = async () => {
    const assets = removeZeroBalances();
    if (assets.length > 0) {
      try {
        const prices = await DepoAPISevice.getPricesUSDT(
          assets.map((asset) => asset.name.toUpperCase()),
          assets.map((asset) => asset.address.toLowerCase()),
        );

        if (assets.find((asset) => asset.name === 'DEPO')) {
          prices['DEPO'] = await CoingeckoService.fetchTickerDepoUsd();
        }

        if (assets.find((asset) => asset.name === `W${defaultCurrency}`)) {
          prices[`W${defaultCurrency}`] = prices[defaultCurrency];
        }
        const parsedBalancesWithAmount: any = [];

        const parsedPrices = assets.map((asset) => {
          const obj = {
            name: asset.name,
            value: '',
          };
          if (prices[asset.name] !== undefined) {
            obj.value = money(
              +(prices[asset.name] * +balances[asset.address]).toFixed(2),
              'en-US',
              'USD',
              2,
              2,
            );
          } else {
            // if value === 'not found' we can't sort this
            obj.value = '$0.00';
          }
          parsedBalancesWithAmount.push({
            ...obj,
            balance: balances[asset.address],
          });
          return obj;
        });

        // Object.keys(prices).map((key) => {
        //   parsedBalancesWithAmount.push({
        //     ...obj,
        //     balance: balances[key],
        //   });
        //   return obj;
        // });

        let totalHoldings = 0;
        parsedPrices.forEach((item) => {
          totalHoldings += +parseFloat(
            item.value.replace('$', '').replace(',', ''),
          );
        });

        const updatedTableItems = tableItems;
        updatedTableItems[1].value = money(totalHoldings, 'en-US', 'USD', 2, 2);

        setHoldingData(parsedPrices);
        afterFetchValues(parsedBalancesWithAmount);
        setTableItems(updatedTableItems);
      } catch (error) {
        const err = error as Error;
        Notification({
          type: 'error',
          message: err.message,
        });
      }
    }
  };

  const fetchPoolTokenUsdtValue = async (provisions: ILiquidityProvision[]) => {
    const tokensToFetch: any[] = [];
    let isDefaultCurrency = false;

    provisions.forEach((pool) => {
      if (
        [pool.token0.symbol, pool.token1.symbol].includes(
          `W${defaultCurrency.toUpperCase()}`,
        )
      ) {
        tokensToFetch.push({
          name: defaultCurrency,
          address: tokenAddress(defaultCurrency),
        });
        isDefaultCurrency = true;
      } else {
        tokensToFetch.push({
          name: pool.token0.symbol,
          address: tokenAddress(pool.token0.symbol),
        });
        tokensToFetch.push({
          name: pool.token1.symbol,
          address: tokenAddress(pool.token1.symbol),
        });
      }
    });
    try {
      const toUsdt = await DepoAPISevice.getPricesUSDT(
        tokensToFetch.map((t) => t.name.toUpperCase()),
        tokensToFetch.map((t) => t.address.toLowerCase()),
      );
      if (isDefaultCurrency) {
        toUsdt[`W${defaultCurrency}`] = toUsdt[defaultCurrency];
      }
      return toUsdt;
    } catch (error) {
      throw new Error("Couldn't fetch market prices fot ");
    }
  };

  const fetchPoolData = async () => {
    if (!user) return;
    try {
      if (user.liquidityProvisions && user.settings?.defaultWallet) {
        const provisions = user.liquidityProvisions;
        const walletId = user.settings.defaultWallet;
        const promises: any[] = [];

        user.liquidityProvisions.forEach((pool) => {
          promises.push(
            UniswapV2Service.fetchPoolAssetsDetails(
              pool.token0,
              pool.token1,
              pool.poolContractAddress,
              walletId,
            ),
          );
        });
        const result = await Promise.all(promises);
        const toUsd = await fetchPoolTokenUsdtValue(user.liquidityProvisions);

        const parsedPoolData: IBalanceSummaryTable[] = [];
        let totalBalance = 0;

        result.forEach((pool: IPoolDetails, index) => {
          if (+pool.token0Balance > 0 && +pool.token1Balance > 0) {
            // Gets the current pool
            const details = provisions[index];
            // Mount pool name
            const poolName = `${details.protocol}: ${details.token0.symbol}/${details.token1.symbol}`;

            // Calculates the balance of the pool
            let balance = 0;

            if (toUsd[details.token0.symbol]) {
              balance = toUsd[details.token0.symbol] * +pool.token0Balance * 2;
            } else if (toUsd[details.token1.symbol]) {
              balance = toUsd[details.token1.symbol] * +pool.token1Balance * 2;
            }

            // new BigNumber(pool.token0Balance)
            //   .plus(pool.token1Balance)
            //   .toFixed(2);

            // Adds to the total balance
            totalBalance += +balance;
            // Parses the data to fit in the model
            const parsedData: IBalanceSummaryTable = {
              name: poolName,
              value: money(+balance, 'en-US', 'USD', 2, 2),
            };
            parsedPoolData.push(parsedData);
          }
        });
        // Updates the table preload data
        const updatedTableItems = tableItems;
        updatedTableItems[0].value = money(totalBalance, 'en-US', 'USD', 2, 2);
        setTableItems(updatedTableItems);
        setPoolData(parsedPoolData);
      }
    } catch (error) {
      //
    }
  };

  const setDataToDisplay = async (type: string) => {
    if (type === 'Holdings') {
      setDisplay(holdingData);
    } else if (type === 'Pools') {
      setDisplay(poolData);
    }
  };

  useEffect(() => {
    __debounce(
      async () => {
        setIsLoading(true);
        await fetchHoldingData();
        await fetchPoolData();
        setIsLoading(false);
      },
      250,
      'fetchingDexDashboard',
    );
  }, [balances]);

  useEffect(() => {
    setDataToDisplay(selectedRow);
  }, [selectedRow]);

  useEffect(() => {
    if (!dexLoading) setIsLoading(true);
  }, [dexLoading]);

  return (
    <div className="balance-summary-wrapper">
      <BalanceSummary
        title="DEX"
        isLoading={dexLoading || isLoading}
        childrenData={display}
        childrenTitle={selectedRow}
        preloadData={tableItems}
        columns={columsDex}
        onRowSelect={(row) => {
          setSelectedRow(row.name);
        }}
        onCloseChild={() => {
          setDisplay(undefined);
          setSelectedRow('');
        }}
        onSelectRowRender={<DexBalanceChild />}
      />
    </div>
  );
};

export default DexCard;
