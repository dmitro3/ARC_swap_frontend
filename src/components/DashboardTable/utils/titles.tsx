import React from 'react';
import binanceLogo from 'assets/binanceLogo.png';
import ftxLogo from 'assets/ftxLogo.png';
import huobiLogo from 'assets/huobiLogo.png';
import kucoinLogo from 'assets/kucoinLogo.png';
import gateioLogo from 'assets/gateioLogo.png';

const binanceModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={binanceLogo} alt="logo" />
    BINANCE
  </p>
);
const binanceOrdersModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={binanceLogo} alt="logo" />
    BINANCE OPEN ORDERS
  </p>
);

const btcModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    BTC
  </p>
);

const ethModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    ETH
  </p>
);

const dotModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    DOT
  </p>
);

const ftxModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={ftxLogo} alt="logo" />
    FTX
  </p>
);

const ftxOrdersModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={ftxLogo} alt="logo" />
    FTX OPEN ORDERS
  </p>
);

const huobiModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={huobiLogo} alt="logo" />
    Huobi
  </p>
);

const huobiOrdersModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={huobiLogo} alt="logo" />
    HUOBI OPEN ORDERS
  </p>
);

const kucoinModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={kucoinLogo} alt="logo" width="38px" />
    Kucoin
  </p>
);

const kucoinOrdersModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={kucoinLogo} alt="logo" />
    KUCOIN OPEN ORDERS
  </p>
);

const gateIoModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={kucoinLogo} alt="logo" width="38px" />
    Gate.io
  </p>
);

const gateIoOrdersModalTitle = (
  <p style={{ padding: '0', margin: '0 0 0 30px', width: 'fit-content' }}>
    <img src={gateioLogo} alt="logo" />
    GATE.IO OPEN ORDERS
  </p>
);

const poolModalTitle = (
  <p style={{ padding: '6px 0', margin: '0 0 0 30px', width: 'fit-content' }}>
    POOLS
  </p>
);

const holdingModalTitle = (
  <p style={{ padding: '6px 0', margin: '0 0 0 30px', width: 'fit-content' }}>
    Holdings
  </p>
);

export {
  binanceModalTitle,
  binanceOrdersModalTitle,
  ftxModalTitle,
  ftxOrdersModalTitle,
  huobiModalTitle,
  huobiOrdersModalTitle,
  kucoinOrdersModalTitle,
  kucoinModalTitle,
  gateIoModalTitle,
  gateIoOrdersModalTitle,
  btcModalTitle,
  ethModalTitle,
  dotModalTitle,
  poolModalTitle,
  holdingModalTitle,
};
