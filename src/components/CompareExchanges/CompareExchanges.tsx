import React, { memo } from 'react';
import { Table } from 'antd';

import BinanceLogo from 'assets/binanceLogo.png';
import FTXLogo from 'assets/ftxLogo.png';
import HuobiLogo from 'assets/huobiLogo.png';
import KucoinLogo from 'assets/kucoinLogo.png';
import GateIoLogo from 'assets/gateioLogo.png';

import './styles.scss';
import money from '../../utility/money';
import numberFormater from '../../utility/numberFormater';

const CompareExchanges: React.FC<{
  quote: string;
  isLoading: boolean;
  compareExchangesData: any;
  marketType: any;
}> = ({
  compareExchangesData = { type: undefined, compare: [] },
  isLoading = false,
  quote,
  marketType,
}) => {
  const columns = [
    {
      title: '',
      dataIndex: 'exchange',
      key: 'exchange',
      width: 40,
      render: (exchangeName: any) => (
        <div className="cex-btn">
          <img
            src={
              (exchangeName === 'Binance' && BinanceLogo) ||
              (exchangeName === 'FTX' && FTXLogo) ||
              (exchangeName === 'Huobi' && HuobiLogo) ||
              (exchangeName === 'Kucoin' && KucoinLogo) ||
              GateIoLogo
            }
            alt="exchange"
            width={20}
          />
          {exchangeName}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'exchangePrice',
      key: 'exchangePrice',
      width: 40,
      render: (exchangePrice: number) => (
        <span>
          {exchangePrice
            ? money(exchangePrice, 'currency', 'USD', 0)
            : 'Not found'}
        </span>
      ),
    },
    {
      title: 'Fee',
      dataIndex: 'feeBase',
      key: 'feeBase',
      width: 40,
      render: (a: any, b: any) => (
        <span className="item_table">
          {/* {b.feeBase ? `${b.feeBase.toFixed(4)}/${quote}` : '-'} */}
          {/* <br /> */}
          <span>
            {b.feePercent ? `${(b.feePercent * 100).toFixed(3)}%` : '-'}
          </span>
        </span>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 40,
      render: (totalPrice: number) =>
        totalPrice
          ? money(Number(totalPrice.toFixed(5)), 'currency', 'USD', 0)
          : '-',
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      width: 40,
      render: (volume: number) => (
        <span>{volume ? `${numberFormater(+volume)}/${quote}` : '-'}</span>
      ),
    },
  ];

  const typeOfCompare =
    // eslint-disable-next-line no-nested-ternary
    compareExchangesData.type !== undefined
      ? compareExchangesData.type === 'maker'
        ? 'Buy'
        : 'Sell'
      : '';

  return (
    <div className="compare-exchanges">
      <p className="title">Compare Exchanges {typeOfCompare}</p>
      {!compareExchangesData.type && (
        <span>
          Please click the Compare CEX button in the right to compare your order
          in these exchanges.
        </span>
      )}
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={
          marketType === 'spot'
            ? compareExchangesData.compare
            : compareExchangesData.compare?.filter(
                (value: any) => value !== compareExchangesData.compare[1],
              )
        }
        pagination={false}
      />
    </div>
  );
};

export default memo(CompareExchanges);
