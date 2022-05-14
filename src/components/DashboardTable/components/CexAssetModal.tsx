/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { Button, Col, Row, Select } from 'antd';
import { IBalanceSummaryTable } from '../../../interfaces/BalanceSummary';
import DepoModal from '../../DepoModal/DepoModal';
import PageChangeEvent from '../../../utility/page-change-event';
import money from '../../../utility/money';

const CexAssetModal: React.FC<{
  data: IBalanceSummaryTable;
  onClose: () => void;
  onOk?: () => void;
  open: boolean;
  type: string;
}> = ({ data, onClose, onOk, open, type }) => {
  const [tradeTarget, setTradeTarget] = useState();

  const availableAssetsToTrade = [
    {
      title: 'USDT',
      value: 'USDT',
    },
    {
      title: 'BTC',
      value: 'BTC',
    },
  ];

  // http://localhost:3001/market-details/Binance-spot-ETH-BTC
  const getMarketUrl = () => {
    if (data.name === 'USDT' && tradeTarget === 'BTC')
      return `/market-details/${type}-spot-${tradeTarget}-${data.name}`;
    return `/market-details/${type}-spot-${data.name}-${tradeTarget}`;
  };

  return (
    <DepoModal open={open} onClose={onClose}>
      <Row className="depo__fulfill-modal text-center bg-lightgrey py-3 rounded text-white">
        <div className="close pointer" onClick={onClose}>
          &times;
        </div>
        <Col xs={24} className="text-left">
          <h4 className="text-white">{data.name}</h4>
          <p className="text-secondary mt-3 h6">BALANCE</p>
          <div className="pl-3 py-1 border-top border-bottom border-secondary w-100">
            {money(+data.value, 'en-US', 'USD', 2, 2)}
          </div>
        </Col>
        <Col xs={24}>
          <Select
            options={availableAssetsToTrade.filter(
              (asset) => asset.value !== data.name,
            )}
            className="select"
            defaultValue={tradeTarget}
            dropdownStyle={{
              background: '#070708',
              color: '#fff',
              borderRadius: 10,
            }}
            onChange={(value) => setTradeTarget(value)}
          />
          <Button
            className="btn-depo bg-success bg-light-alpha-10 px-5 ml-3"
            onClick={() => {
              PageChangeEvent.prepareAndDispatch(getMarketUrl());
              onClose();
            }}
          >
            TRADE
          </Button>
        </Col>
      </Row>
    </DepoModal>
  );
};

export default CexAssetModal;
