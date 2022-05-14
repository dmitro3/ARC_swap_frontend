/* eslint-disable prefer-spread */
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Select, Table } from 'antd';

import BinanceLogo from 'assets/binanceLogo.png';
import FTXLogo from 'assets/ftxLogo.png';
import HuobiLogo from 'assets/huobiLogo.png';
import KuCoinLogo from 'assets/kucoinLogo.png';
import GateIoLogo from 'assets/gateioLogo.png';

import { IOrderBook, OrderBookProps } from '../../interfaces/IOrderBook';
import orderBookSelector from '../../utility/orderBookSelector';
import getTradingPair from '../../utility/getTradingPair';
import { DepoAPISevice } from '../../services/DepoAPIService';

import './style.scss';
import { AuthContext } from '../../contexts/AuthProvider';

const { Option } = Select;

const OrderBook: React.FC<OrderBookProps> = ({
  symbolSelected,
  exchangeSelected,
  marketType,
}: OrderBookProps): JSX.Element => {
  const { user } = useContext(AuthContext);
  const [orderBookData, setOrderBookData] = useState<IOrderBook[]>([]);
  const [asksResult, setAsksResult] = useState<any>();
  const [asksSelected, setAsksSelected] = useState<any>();
  const [bidsSelected, setBidsSelected] = useState<any>();
  const [bidsResult, setBidsResult] = useState<any>();
  const [baseResult, setBaseResult] = useState('');
  const [quoteResult, setQuoteResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectValue, setSelectValue] = useState<number>(6);
  const asksArray: any = [];
  const bidsArray: any = [];
  const selectOptions = [];
  for (let i = 2; i <= 6; i += 1) {
    selectOptions.push({ value: i, label: `${i} decimals` });
  }

  const getAllOrderBook = useCallback(async () => {
    try {
      const response = await DepoAPISevice.getAllOrderBook(
        symbolSelected,
        marketType,
      );
      setOrderBookData(response.allExchangesOrderBook);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const formatNumber = () => {
    if (asksArray) {
      for (let i = 0; i < asksArray.length; i += 1) {
        if (Number(asksArray[i].total) >= 1000) {
          asksArray[i].total = `${(Number(asksArray[i].total) / 1000).toFixed(
            2,
          )}K`;
        }
        if (Number(asksArray[i].total) >= 1) {
          asksArray[i].total = `${Number(asksArray[i].total).toFixed(3)}`;
        }
        if (Number(asksArray[i].amount) >= 1000000) {
          asksArray[i].amount = `${(
            Number(asksArray[i].amount) / 1000000
          ).toFixed(2)}M`;
        }
      }
    }
    if (bidsArray) {
      for (let i = 0; i < bidsArray.length; i += 1) {
        if (Number(bidsArray[i].total) >= 1000) {
          bidsArray[i].total = `${(Number(bidsArray[i].total) / 1000).toFixed(
            2,
          )}K`;
        }
        if (Number(bidsArray[i].total) >= 1) {
          bidsArray[i].total = `${Number(bidsArray[i].total).toFixed(3)}`;
        }
        if (Number(bidsArray[i].amount) >= 1000000) {
          bidsArray[i].amount = `${(
            Number(bidsArray[i].amount) / 1000000
          ).toFixed(2)}M`;
        }
      }
    }
  };

  useEffect(() => {
    getAllOrderBook();
    const timer1 = setInterval(() => getAllOrderBook(), 15000);
    formatNumber();

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  useEffect(() => {
    if (orderBookData.length) {
      setLoading(true);
      for (let i = 0; i < orderBookData.length; i += 1) {
        const { asks, bids } = orderBookSelector(orderBookData[i], selectValue);
        asksArray.push.apply(asksArray, asks.slice(-5));
        bidsArray.push.apply(bidsArray, bids.slice(-5));
      }
      setAsksResult(asksArray);
      setAsksSelected(asksArray);
      setBidsResult(bidsArray);
      setBidsSelected(bidsArray);

      const { base, quote } = getTradingPair(orderBookData[0].orderBook.symbol);
      setBaseResult(base);
      setQuoteResult(quote);
      setLoading(false);
      formatNumber();
    }
  }, [orderBookData]);

  const handleSelect = (value: number) => {
    setSelectValue(value);
    for (let i = 0; i < orderBookData.length; i += 1) {
      const { asks, bids } = orderBookSelector(orderBookData[i], value);

      if (asks.length > 5) {
        asksArray.push.apply(asksArray, asks.slice(-5));
      } else {
        asksArray.push.apply(asksArray, asks);
      }

      if (bids.length > 5) {
        bidsArray.push.apply(bidsArray, bids.slice(-5));
      } else {
        bidsArray.push.apply(bidsArray, bids);
      }
    }
    setAsksResult(asksArray);
    setAsksSelected(asksArray);
    setBidsResult(bidsArray);
    setBidsSelected(bidsArray);
    formatNumber();
  };

  const columns = [
    {
      title: `Price ${quoteResult}`,
      dataIndex: 'price',
      key: 'price',
      width: 100,
      className: 'price',
      // defaultSortOrder: 'descend',
    },
    {
      width: 0,
      // TODO: css class rt-tr-bar
      dataIndex: 'volume',
      key: 'volume',
      className: `rt-tr-bar background-volume`,
      render: (volume: number) => ({
        props: {
          style: {
            marginTop: 2,
            paddingRight: `${volume - 5 || 0}%`,
          },
        },
      }),
    },
    {
      title: `Amount ${baseResult}`,
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
    },
    {
      title: 'CEX',
      dataIndex: 'exchangeName',
      key: 'exchangeName',
      className: 'cex-image',
      render: (cexImage: string) => (
        <img
          src={
            (cexImage === 'Binance' && BinanceLogo) ||
            (cexImage === 'FTX' && FTXLogo) ||
            (cexImage === 'Huobi' && HuobiLogo) ||
            (cexImage === 'Kucoin' && KuCoinLogo) ||
            GateIoLogo
          }
          width={16}
          alt="cex"
        />
      ),
    },
  ];

  return (
    <div className="orderBook">
      <div className="orderBookHeader">
        <p>Order Book</p>
        <Select
          loading={loading}
          disabled={loading}
          className="select"
          defaultValue={selectOptions[4].value}
          onChange={handleSelect}
          dropdownStyle={{
            background: '#070708',
            color: '#fff',
            borderRadius: 10,
          }}
        >
          {selectOptions.map((option) => (
            <Option
              key={option.value}
              value={option.value}
              className="selectOptions"
            >
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={asksSelected}
        pagination={false}
        loading={loading}
        className="orderBookContent  price __column--asks"
      />
      <div className="totalValueOrderBook">
        {orderBookData.length && asksResult !== undefined ? (
          <p>
            {asksResult[0]?.price} {quoteResult}
          </p>
        ) : null}
      </div>
      <Table
        columns={columns}
        dataSource={bidsSelected}
        pagination={false}
        loading={loading}
        className="orderBookContent price __column--bids"
      />
    </div>
  );
};

export default memo(OrderBook);
