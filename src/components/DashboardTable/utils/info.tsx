/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { Button } from 'antd';

import BinanceLogo from 'assets/binanceLogo.png';
import FTXLogo from 'assets/ftxLogo.png';
import HuobiLogo from 'assets/huobiLogo.png';
import KucoinLogo from 'assets/kucoinLogo.png';
import GateioLogo from 'assets/gateioLogo.png';

import raribleLogo from '../../../assets/raribleLogo.png';
import openLogo from '../../../assets/openLogo.png';
import niftyLogo from '../../../assets/niftyLogo.png';
// Do not remove, it is being used, trust me!!
import money from '../../../utility/money';

function getCexLogo(value: string): string {
  if (value === 'binance') return BinanceLogo;
  if (value === 'huobi') return HuobiLogo;
  if (value === 'kucoin') return KucoinLogo;
  if (value === 'ftx') return FTXLogo;
  return GateioLogo;
}

const columsCex = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
    render(value: string) {
      return (
        <div className="cex-btn">
          <img src={getCexLogo(value.toLowerCase())} alt="" width={20} />
          {value}
        </div>
      );
    },
  },
  {
    title: 'BALANCE',
    dataIndex: 'value',
    key: 'value',
    render: (value: number) => money(value, 'en-US', 'USD', 2, 2),
  },
];

const columsDex = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => (
      <div className="dex-btn">
        <Button>{value}</Button>
      </div>
    ),
  },
  {
    title: 'BALANCE',
    dataIndex: 'value',
    key: 'value',
  },
];
const columsNft = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];
const dataNft = [
  {
    key: '1',
    name: (
      <p
        style={{ margin: '0', padding: '0', fontSize: '12px', fontWeight: 300 }}
      >
        {' '}
        <img
          src={openLogo}
          alt="texto"
          style={{
            marginRight: '5px',
          }}
          className="logos"
        />
        OpenSea
      </p>
    ),
    balance: 'Coming soon',
    percent: '15,5%',
  },
  {
    key: '2',
    name: (
      <p
        style={{ margin: '0', padding: '0', fontSize: '12px', fontWeight: 300 }}
      >
        {' '}
        <img
          width={35}
          height={35}
          src={raribleLogo}
          alt="texto"
          style={{ marginRight: '10px' }}
          className="logos"
        />
        Rarible
      </p>
    ),
    balance: 'Coming soon',
    percent: '15,5%',
  },
  {
    key: '3',
    name: (
      <p
        style={{ margin: '0', padding: '0', fontSize: '12px', fontWeight: 300 }}
      >
        {' '}
        <img
          width={35}
          height={35}
          src={niftyLogo}
          alt="texto"
          style={{ marginRight: '10px' }}
          className="logos"
        />
        Nifty
      </p>
    ),
    balance: 'Coming soon',
    percent: '15,5%',
  },
];

const columsPools = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHoldings = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsBinance = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsFtx = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsFtxHoldings = [
  {
    title: 'HOLDINGS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsFtxPositions = [
  {
    title: 'POSITIONS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHuobi = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHuobiHoldings = [
  {
    title: 'HOLDINGS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHuobiPositions = [
  {
    title: 'POSITIONS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHuobiOrders = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'QUANTITY',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'TRIGGER',
    dataIndex: 'trigger',
    key: 'trigger',
  },
  {
    title: 'TYPE',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
  },
];

const columsKucoin = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsKucoinHoldings = [
  {
    title: 'HOLDINGS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsKucoinPositions = [
  {
    title: 'POSITIONS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsKucoinOrders = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'QUANTITY',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'TRIGGER',
    dataIndex: 'trigger',
    key: 'trigger',
  },
  {
    title: 'TYPE',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
  },
];

const columsBinanceHoldings = [
  {
    title: 'HOLDINGS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsBinancePositions = [
  {
    title: 'POSITIONS',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsBinanceOrders = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'QUANTITY',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'TRIGGER',
    dataIndex: 'trigger',
    key: 'trigger',
  },
  {
    title: 'TYPE',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
  },
];

const columsFtxOrders = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'QUANTITY',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'TRIGGER',
    dataIndex: 'trigger',
    key: 'trigger',
  },
  {
    title: 'TYPE',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
  },
];

const columsBtc = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsHoldingTable = [
  {
    title: 'COIN',
    dataIndex: 'name',
    key: 'coin',
    // sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
    sorter: (a: any, b: any) => a.balance - b.balance,
  },
  {
    title: 'RESERVED BALANCE',
    dataIndex: 'reserved',
    key: 'reserved',
    sorter: (a: any, b: any) =>
      +a.reserved.replace('$', '') - +b.reserved.replace('$', ''),
  },
  {
    title: 'BTC VALUE',
    dataIndex: 'btcValue',
    key: 'btc',
    sorter: (a: any, b: any) => a.btcValue - b.btcValue,
  },
  {
    title: 'USD VALUE',
    dataIndex: 'usdValue',
    key: 'usd',
    sorter: (a: any, b: any) =>
      +a.usdValue.replace('$', '') - +b.usdValue.replace('$', ''),
    render(value: string) {
      // if (+value.replace('$', '') === 0) return 'Price not found';
      return value;
    },
  },
];
const columsBtcPosition = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsDot = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];
const columsEth = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const columsOneinch = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
  {
    title: '24H',
    dataIndex: 'percent',
    key: 'percent',
  },
  {
    title: 'P/L',
    dataIndex: 'pl',
    key: 'pl',
  },
];
const dataHoldingTable = [
  {
    key: '1',
    coin: (
      <p id="margin" className="exchange-balance">
        BTC
      </p>
    ),
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    reserved: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    btc: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    usd: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
  {
    key: '2',
    coin: (
      <p id="margin" className="exchange-balance">
        BTC
      </p>
    ),
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    reserved: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    btc: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    usd: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
  {
    key: '3',
    coin: (
      <p id="margin" className="exchange-balance">
        BTC
      </p>
    ),
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    reserved: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    btc: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    usd: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
  {
    key: '4',
    coin: (
      <p id="margin" className="exchange-balance">
        BTC
      </p>
    ),
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    reserved: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    btc: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    usd: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
];
const dataOneinch = [
  {
    key: '1',
    balance: <p id="margin">$30.345,67</p>,
    percent: <p id="margin">15,5%</p>,
    pl: <p id="margin">15,5%</p>,
  },
];

const columsLiquidity = [
  {
    title: 'BALANCE',
    dataIndex: 'balance',
    key: 'balance',
  },
  {
    title: '24H',
    dataIndex: 'percent',
    key: 'percent',
  },
  {
    title: 'P/L',
    dataIndex: 'pl',
    key: 'pl',
  },
];
const dataLiquidity = [
  {
    key: '1',
    balance: <p id="margin">$30.345,67</p>,
    percent: <p id="margin">15,5%</p>,
    pl: <p id="margin">15,5%</p>,
  },
];
const dataBinanceOrders = [
  {
    key: '1',
    name: (
      <div id="margin" className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: (
      <p id="margin" className="exchange-balance">
        0.00207
      </p>
    ),
    trigger: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    type: (
      <p id="margin" className="exchange-balance">
        Buy
      </p>
    ),
    status: (
      <p id="margin" className="exchange-balance">
        NEW
      </p>
    ),
  },
  {
    key: '2',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
  {
    key: '3',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
];

const dataBtc = [
  {
    key: '1',
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
];

const dataBtcPosition = [
  {
    key: '1',
    balance: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
  },
];
const dataHuobiOrders = [
  {
    key: '1',
    name: (
      <div id="margin" className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: (
      <p id="margin" className="exchange-balance">
        0.00207
      </p>
    ),
    trigger: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    type: (
      <p id="margin" className="exchange-balance">
        Buy
      </p>
    ),
    status: (
      <p id="margin" className="exchange-balance">
        NEW
      </p>
    ),
  },
  {
    key: '2',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
  {
    key: '3',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
];

const dataKucoinOrders = [
  {
    key: '1',
    name: (
      <div id="margin" className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: (
      <p id="margin" className="exchange-balance">
        0.00207
      </p>
    ),
    trigger: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    type: (
      <p id="margin" className="exchange-balance">
        Buy
      </p>
    ),
    status: (
      <p id="margin" className="exchange-balance">
        NEW
      </p>
    ),
  },
  {
    key: '2',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
  {
    key: '3',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
];
const dataFtxOrders = [
  {
    key: '1',
    name: (
      <div id="margin" className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: (
      <p id="margin" className="exchange-balance">
        0.00207
      </p>
    ),
    trigger: (
      <p id="margin" className="exchange-balance">
        $30.345,67
      </p>
    ),
    type: (
      <p id="margin" className="exchange-balance">
        Buy
      </p>
    ),
    status: (
      <p id="margin" className="exchange-balance">
        NEW
      </p>
    ),
  },
  {
    key: '2',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
  {
    key: '3',
    name: (
      <div className="exchange-balance">
        <p>BTC</p>
      </div>
    ),
    quantity: <p className="exchange-balance">0.00207</p>,
    trigger: <p className="exchange-balance">$30.345,67</p>,
    type: <p className="exchange-balance">Buy</p>,
    status: <p className="exchange-balance">NEW</p>,
  },
];

export {
  dataNft,
  dataOneinch,
  dataLiquidity,
  dataBinanceOrders,
  dataBtc,
  dataBtcPosition,
  dataFtxOrders,
  dataHuobiOrders,
  dataHoldingTable,
  dataKucoinOrders,
  columsLiquidity,
  columsCex,
  columsDex,
  columsHoldings,
  columsBinanceHoldings,
  columsBinancePositions,
  columsBtcPosition,
  columsFtxHoldings,
  columsFtxPositions,
  columsFtxOrders,
  columsHuobi,
  columsHuobiHoldings,
  columsHuobiPositions,
  columsHuobiOrders,
  columsKucoin,
  columsKucoinHoldings,
  columsKucoinPositions,
  columsKucoinOrders,
  columsBinance,
  columsFtx,
  columsDot,
  columsBtc,
  columsEth,
  columsOneinch,
  columsPools,
  columsBinanceOrders,
  columsNft,
  columsHoldingTable,
};
