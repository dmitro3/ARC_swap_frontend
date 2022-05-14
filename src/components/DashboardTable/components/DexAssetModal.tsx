/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Button, Col, Row, Table } from 'antd';
import { IBalanceSummaryTable } from '../../../interfaces/BalanceSummary';
import DepoModal from '../../DepoModal/DepoModal';
import PageChangeEvent from '../../../utility/page-change-event';

const DexAssetModal: React.FC<{
  data: IBalanceSummaryTable;
  onClose: () => void;
  onOk?: () => void;
  open: boolean;
  type: string;
}> = ({ data, onClose, onOk, open, type }) => {
  const getPoolUrl = () => {
    if (type === 'Holdings') {
      return `/pools?filterByToken=${data.name}`;
    }
    if (type === 'Pools') {
      const parts = data.name.split(': ');
      if (parts.length === 2)
        return `/pools?filterByToken=${parts[1]}&protocol=${parts[0]}`;
    }
    return '/pools';
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
            {data.value}
          </div>
        </Col>
        <Col xs={24}>
          {type === 'Holdings' && (
            <Button
              className="btn-depo bg-light-alpha-10 px-5"
              onClick={() => {
                PageChangeEvent.prepareAndDispatch(
                  `/swap?inputToken=${data.name}`,
                );
              }}
            >
              Swap
            </Button>
          )}
          <Button
            className="btn-depo bg-light-alpha-10 px-5 ml-3"
            onClick={() => {
              PageChangeEvent.prepareAndDispatch(getPoolUrl());
            }}
          >
            Pools
          </Button>
        </Col>
      </Row>
    </DepoModal>
  );
};

export default DexAssetModal;
