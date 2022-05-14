import React, { memo } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { TradingViewComponentProps } from '../../interfaces/ITradingView';

const TradingViewComponent: React.FC<TradingViewComponentProps> = ({
  exchangeName,
  pairsName,
}: TradingViewComponentProps) => (
  <AdvancedRealTimeChart
    hide_side_toolbar={false}
    symbol={`${exchangeName}:${pairsName}`}
    theme="dark"
    autosize
    // eslint-disable-next-line react/style-prop-object
  />
);

export default memo(TradingViewComponent);
