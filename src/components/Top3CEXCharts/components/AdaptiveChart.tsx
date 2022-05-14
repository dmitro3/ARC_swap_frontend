import GateIoChart from 'components/GateIoChart';
import React from 'react';
import { MiniChart } from 'react-ts-tradingview-widgets';

const AdaptiveChart: React.FC<{
  baseSymbol: string;
  quoteSymbol: string;
  logo: string;
  title: string;
  id?: string;
  isPartner?: boolean;
}> = ({ baseSymbol, quoteSymbol, logo, title, id, isPartner }) => (
  <div
    className="chart-container-wraper"
    id={id}
    style={isPartner ? { border: '5px solid #DE596B' } : {}}
  >
    <div className="d-flex align-center justify-start" style={{ height: 48 }}>
      <img src={logo} alt={title} className="mx-2" width={32} />
      <span>{title}</span>
      {isPartner && <span className="partner-wrapper">Partners</span>}
    </div>
    {title === 'Gate.io' ? (
      <GateIoChart currencyPair={`${baseSymbol}_${quoteSymbol}`} />
    ) : (
      <MiniChart
        colorTheme="dark"
        autosize
        symbol={`${title.toUpperCase()}:${baseSymbol}${quoteSymbol}`}
        trendLineColor="#007aff"
        underLineColor="transparent"
        isTransparent
        dateRange="1D"
      />
    )}
  </div>
);

export default AdaptiveChart;
