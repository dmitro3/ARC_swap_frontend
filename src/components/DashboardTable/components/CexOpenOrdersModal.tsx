/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import DepoModal from '../../DepoModal/DepoModal';

const CexOpenOrdersModal: React.FC<{
  data: any;
  onClose: () => void;
  onOk?: () => void;
  open: boolean;
  type: string;
}> = ({ data, onClose, onOk, open, type }) => {
  const columns: ColumnsType<object> = [
    {
      title: '',
      dataIndex: 'symbol',
      render(value: any) {
        return (
          <div className="balance-summary-table-col py-2 rounded-left-sm">
            {value}
          </div>
        );
      },
    },
    {
      title: 'QUANTITY',
      dataIndex: 'amount',
      render(value: any) {
        return <div className="balance-summary-table-col py-2">{value}</div>;
      },
    },
    {
      title: 'TRIGGER',
      dataIndex: 'price',
      render(value: any) {
        return <div className="balance-summary-table-col py-2">{value}</div>;
      },
    },
    {
      title: 'TYPE',
      dataIndex: 'side',
      render(value: any) {
        return <div className="balance-summary-table-col py-2">{value}</div>;
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render(value: any) {
        return (
          <div className="balance-summary-table-col py-2 rounded-right-sm">
            {value}
          </div>
        );
      },
    },
  ];

  return (
    <DepoModal open={open} onClose={onClose}>
      <Row className="depo__fulfill-modal text-center bg-lightgrey py-3 rounded text-white">
        <div className="close pointer" onClick={onClose}>
          &times;
        </div>
        <Col xs={24} className="text-left">
          <h4 className="text-white">{data.name}</h4>
          <p className="text-secondary mt-3 h6">OPEN ORDERS</p>
          <div className="open-orders-summary-table">
            <Table dataSource={data} columns={columns} pagination={false} />
          </div>
        </Col>
      </Row>
    </DepoModal>
  );
};

export default CexOpenOrdersModal;
