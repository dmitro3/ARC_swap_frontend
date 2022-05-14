import React, { useContext, useEffect, useState, useMemo } from 'react';
import { columsCex } from '../utils/info';

import '../style.scss';
import CexBalanceChild from './CexBalanceChild';
import BalanceSummary from './BalanceSummary';
import Notification from '../../Notification/Notification';
import { AuthContext } from '../../../contexts/AuthProvider';
import {
  Future,
  IBalanceSummaryTable,
  IBalanceSymbol,
  Spot,
} from '../../../interfaces/BalanceSummary';

const CexCard: React.FC = () => {
  const { symbols, uniqueSymbols, cexLoading, isAuthenticated } =
    useContext(AuthContext);
  const [selectedRow, setSelectedRow] = useState('');

  /**
   * The preload data
   */
  const [tableItems, setTableItems] = useState<IBalanceSummaryTable[]>([
    {
      key: '1',
      name: 'Binance',
      value: 0,
    },
    {
      key: '2',
      name: 'FTX',
      value: 0,
    },
    {
      key: '3',
      name: 'Huobi',
      value: 0,
    },
    {
      key: '4',
      name: 'Kucoin',
      value: 0,
    },
    {
      key: '5',
      name: 'Gate.io',
      value: 0,
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
  const [ftx, setFtxData] = useState<IBalanceSummaryTable[]>([]);
  const [huobi, setHuobiData] = useState<IBalanceSummaryTable[]>([]);
  const [kucoin, setKucoinData] = useState<IBalanceSummaryTable[]>([]);
  const [binance, setBinanceData] = useState<IBalanceSummaryTable[]>([]);
  const [gateio, setGateIoData] = useState<IBalanceSummaryTable[]>([]);

  const bindCexToState = (
    name: string,
  ): [typeof binance, typeof setBinanceData] => {
    switch (name.toLowerCase()) {
      case 'binance':
        return [binance, setBinanceData];
      case 'huobi':
        return [huobi, setHuobiData];
      case 'kucoin':
        return [kucoin, setKucoinData];
      case 'ftx':
        return [ftx, setFtxData];
      case 'gate.io':
        return [gateio, setGateIoData];
      default:
        throw new Error(`Exchange name ${name} is not listed yet.`);
    }
  };

  /**
   * Parses the symbol into the current interface
   * @param symbol the symbol
   * @returns a parsed symbol or undefined if not found.
   */
  const parseSymbol = (symbol: any): IBalanceSymbol | undefined => {
    if (symbol.symbol && symbol.amount && symbol.exchange && symbol.usdValue) {
      const parsedSymbol: IBalanceSymbol = {
        name: symbol.symbol,
        value: +symbol.usdValue,
        type: 'spot',
      };

      return parsedSymbol;
    }
    return undefined;
  };

  /**
   * Prepares the table items to be mounted and displayed into the table
   */
  const mountTableItems = () => {
    // Creates an aux balance array object
    const balanceObjectArray: any = {
      binance: [] as IBalanceSummaryTable[],
      huobi: [] as IBalanceSummaryTable[],
      ftx: [] as IBalanceSummaryTable[],
      kucoin: [] as IBalanceSummaryTable[],
      'gate.io': [] as IBalanceSummaryTable[],
    };

    /**
     * Creates an aux total balance object
     *
     * This object contains the schema:
     *
     * ```ts
     * {
     *  exchangename: [Spot: number, Future: number],
     *  //...other exchanges
     * }
     * ```
     */
    const totalBalances: {
      // Correlation of [spot, future]
      [key: string]: [Spot, Future];
    } = {
      binance: [0, 0],
      huobi: [0, 0],
      ftx: [0, 0],
      kucoin: [0, 0],
      'gate.io': [0, 0],
    };

    // Navigate through symbols parsing it and filling the balances
    symbols.forEach((symbol) => {
      const cexName: string = symbol.exchange.toLowerCase();
      if (cexName) {
        const ref = balanceObjectArray[cexName] as IBalanceSymbol[];
        if (ref) {
          const parsedSymbol = parseSymbol(symbol);
          // Separate total balances in order of type
          if (parsedSymbol) {
            if (parsedSymbol.type === 'spot') {
              totalBalances[cexName][0] += +parsedSymbol.value;
            } else if (parsedSymbol.type === 'future') {
              totalBalances[cexName][1] += +parsedSymbol.value;
            }
            ref.push(parsedSymbol);
          }
        }
      }
    });

    // Copies the table items
    const currentTableItems = [...tableItems];
    // Navigate through the balance array to fill the total balances
    Object.keys(totalBalances).forEach((key) => {
      // Get the index of the exchange in the table
      const itemIndex = currentTableItems.findIndex(
        (item) => item.name.toLowerCase() === key,
      );
      if (itemIndex !== -1) {
        // Than sum with the current value
        const [spot, future] = totalBalances[key];
        currentTableItems[itemIndex].value = spot + future;
        currentTableItems[itemIndex].child = { spot, future };
      }
    });
    setTableItems(currentTableItems);

    // Navigate through the total balances array to set the state
    // of each exchange.
    Object.keys(balanceObjectArray).forEach((key) => {
      try {
        const [, setState] = bindCexToState(key);
        setState(balanceObjectArray[key]);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const setDataToDisplay = async (name: string) => {
    try {
      const [state] = bindCexToState(name.toLowerCase());
      setDisplay(state);
    } catch (error) {
      const err = error as Error;
      Notification({
        type: 'info',
        message: `${err.message} - ${name}`,
      });
    }
  };

  const getTotalBalanceForSelectedCex = () => {
    const balance = tableItems.find(
      (item) => item.name.toLowerCase() === selectedRow.toLowerCase(),
    );
    if (balance?.child) return balance.child;
    return { spot: 0, future: 0 };
  };

  useEffect(() => {
    mountTableItems();
  }, [uniqueSymbols]);

  useEffect(() => {
    if (selectedRow.length) setDataToDisplay(selectedRow);
  }, [selectedRow]);

  useEffect(
    () => () => {
      setDisplay(undefined);
      setTableItems([]);
      setFtxData([]);
      setHuobiData([]);
      setKucoinData([]);
      setBinanceData([]);
      setGateIoData([]);
      setSelectedRow('');
    },
    [],
  );
  return (
    <div className="balance-summary-wrapper">
      {useMemo(
        () => (
          <BalanceSummary
            title="CEX"
            isLoading={cexLoading}
            childrenData={display}
            childrenTitle={selectedRow}
            preloadData={tableItems}
            columns={columsCex}
            onRowSelect={(row) => {
              setSelectedRow(row.name);
            }}
            onCloseChild={() => {
              setDisplay(undefined);
              setSelectedRow('');
            }}
            onSelectRowRender={
              <CexBalanceChild totalBalance={getTotalBalanceForSelectedCex()} />
            }
          />
        ),
        [cexLoading, display, tableItems],
      )}
    </div>
  );
};

export default CexCard;
