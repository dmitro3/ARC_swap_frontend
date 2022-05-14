import { SwapOutlined } from '@ant-design/icons';
import { Col, Row, Select } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import binanceLogo from 'assets/binanceLogo.png';
import btcLogo from 'assets/btcLogo.png';
import ftxLogo from 'assets/ftxLogo.png';
import huobiLogo from 'assets/huobiLogo.png';
import kucoinLogo from 'assets/kucoinLogo.png';
import gateioLogo from 'assets/gateioLogo.png';

import { AuthContext } from '../../contexts/AuthProvider';
import { __debounce } from '../../utility/debounce';
import AdaptiveChart from './components/AdaptiveChart';

import './styles.scss';

const { Option } = Select;

function getElementWidth(id: string): number {
  const el = document.getElementById(id);
  if (!el) return 450;

  return +el.clientWidth - 10;
}

const Top3CEXCharts: React.FC = () => {
  const { tokens } = useContext(AuthContext);
  const [baseSymbol, setBaseSymbol] = useState<string>('BTC');
  const [quoteSymbol, setQuoteSymbol] = useState<string>('USDT');
  const [tokenAux, setTokenAux] = useState<any[]>(tokens);
  const [maxChartWidth, setMaxChartWidth] = useState(450);
  const cexes = [
    { logo: gateioLogo, title: 'Gate.io', isPartner: true },
    { logo: binanceLogo, title: 'Binance' },
    { logo: huobiLogo, title: 'Huobi' },
    { logo: ftxLogo, title: 'FTX' },
    { logo: kucoinLogo, title: 'Kucoin' },
  ];

  const handleTokensChange = () => {
    if (tokens.length > 0) {
      const aux = JSON.parse(JSON.stringify(tokens));
      aux.unshift({
        address: '',
        decimals: 18,
        logoURI: btcLogo,
        name: 'Bitcoin',
        symbol: 'BTC',
      });
      setTokenAux(aux);
    }
  };

  useEffect(() => {
    handleTokensChange();
  }, [tokens]);

  useEffect(() => {
    setMaxChartWidth(getElementWidth(`chart_id__0`));

    window.onresize = () => {
      __debounce(
        () => {
          setMaxChartWidth(getElementWidth(`chart_id__0`));
        },
        250,
        'setMaxChartWidth',
      );
    };
  }, [baseSymbol]);

  const renderCharts = () =>
    useMemo(
      () => (
        <Row justify="space-around">
          {cexes.map((cex, index) => (
            <Col md={12} sm={24} className="w-100" key={cex.title}>
              <AdaptiveChart
                id={`chart_id__${index}`}
                baseSymbol={baseSymbol}
                quoteSymbol={quoteSymbol}
                title={cex.title}
                logo={cex.logo}
                isPartner={cex.isPartner}
              />
            </Col>
          ))}
        </Row>
      ),
      [baseSymbol, quoteSymbol, maxChartWidth],
    );

  const searchChange = (value: any) => {
    const aux = JSON.parse(JSON.stringify(tokens));
    aux.unshift({
      address: '',
      decimals: 18,
      logoURI: btcLogo,
      name: 'Bitcoin',
      symbol: 'BTC',
    });

    if (value === '') {
      setTokenAux(aux);
    } else {
      const filtredData = aux.filter(
        (token: any) =>
          token.name.toLowerCase().includes(value.toLowerCase()) === true,
      );
      setTokenAux(filtredData);
    }
  };

  return (
    <div className="chart-container">
      <Row justify="start">
        <Col>
          <div>
            <h5 className="cex-title">Top CEXs</h5>
            <h6 className="cex-volume">(24h Volume - Rates by TradingView)</h6>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={24} className="coins-select-container">
          <Select
            className="select"
            showSearch
            onChange={(value) => setBaseSymbol(value)}
            filterOption={false}
            onSearch={searchChange}
            defaultValue="Bitcoin"
            // defaultValue={
            //   tokenAux &&
            //   tokenAux.find((token) => token?.symbol === 'ETH')?.name
            // }
            dropdownStyle={{
              background: '#070708',
              color: '#fff',
              borderRadius: 10,
            }}
          >
            {tokenAux.map((coin) => (
              <Option
                key={coin.symbol}
                value={coin.symbol}
                className="selectOptions"
              >
                <img
                  src={
                    tokenAux.find((token) => token.symbol === coin.symbol)
                      ?.logoURI
                  }
                  style={{ width: 20, margin: '0px 10px 0px 0px' }}
                  alt=""
                />
                {coin.name}
              </Option>
            ))}
          </Select>
          <SwapOutlined className="switch-icon" />
          <Select
            className="select"
            showSearch
            filterOption={false}
            onChange={(value) => setQuoteSymbol(value)}
            onSearch={searchChange}
            defaultValue="Tether USD"
            // defaultValue={
            //   tokenAux &&
            //   tokenAux.find((token) => token?.symbol === 'BTC')?.name
            // }
            dropdownStyle={{
              background: '#070708',
              color: '#fff',
              borderRadius: 10,
            }}
          >
            {tokenAux.map((coin) => (
              <Option
                key={coin.symbol}
                value={coin.symbol}
                className="selectOptions"
              >
                <img
                  src={
                    tokenAux.find((token) => token.symbol === coin.symbol)
                      ?.logoURI
                  }
                  style={{ width: 20, margin: '0px 10px 0px 0px' }}
                  alt=""
                />
                {coin.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      {renderCharts()}
    </div>
  );
};

export default Top3CEXCharts;
