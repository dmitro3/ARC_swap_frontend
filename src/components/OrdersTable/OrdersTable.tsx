import React, { useEffect } from 'react';

import { Table, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import ScrollBar from 'react-perfect-scrollbar';

import './styles.scss';
import money from '../../utility/money';

const OrdersTable: React.FC<{
  data: any[];
  type: string;
  isLoading: boolean;

  handleCancelOrder(exchangeName: string, orderId: string): any;
}> = ({ data, type, isLoading = false, handleCancelOrder }) => {
  const openOrdersColumns = [
    {
      title: 'Coin',
      dataIndex: 'symbolPair',
      sorter: (a: any, b: any) => a.symbolPair.localeCompare(b.symbolPair),
    },
    {
      title: 'Side',
      dataIndex: 'side',
      sorter: (a: any, b: any) => a.type.localeCompare(b.side),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: (a: any, b: any) => a.type.localeCompare(b.type),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      sorter: (a: any, b: any) => a.size - b.size,
    },
    {
      title: 'Deal Price',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.price.localeCompare(b.price),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      sorter: (a: any, b: any) => a.total.localeCompare(b.total),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a: any, b: any) => a.timestamp - b.timestamp,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
    {
      title: 'Exchange',
      dataIndex: 'exchange',
      sorter: (a: any, b: any) => a.exchange.localeCompare(b.exchange),
    },
    {
      title: 'Cancel',
      render: (a: any, b: any) =>
        b.status !== 'closed' &&
        b.status !== 'canceled' && (
          <DeleteFilled
            className="text-danger"
            onClick={() => handleCancelOrder(b.exchange, b.orderId)}
          />
        ),
    },
  ];

  const closedOrdersColumns = [
    {
      title: 'Coin',
      dataIndex: 'symbolPair',
      sorter: (a: any, b: any) => a.symbolPair.localeCompare(b.symbolPair),
    },
    {
      title: 'Side',
      dataIndex: 'side',
      sorter: (a: any, b: any) => a.type.localeCompare(b.side),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: (a: any, b: any) => a.type.localeCompare(b.type),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      sorter: (a: any, b: any) => a.size - b.size,
    },
    {
      title: 'Deal Price',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.price.localeCompare(b.price),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      sorter: (a: any, b: any) => a.total.localeCompare(b.total),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a: any, b: any) => a.timestamp - b.timestamp,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
    {
      title: 'Exchange',
      dataIndex: 'exchange',
      sorter: (a: any, b: any) => a.exchange.localeCompare(b.exchange),
    },
  ];

  const handleFormatedData = () => {
    if (data) {
      const formatedData = data.map((order) => ({
        orderId: order.id,
        symbolPair: order.symbol,
        exchange: order.exchange.toUpperCase(),
        type: order.type,
        side: order.side,
        size: order.amount,
        price: +order.price === 0 ? 'market' : money(+order.price),
        total:
          +order.price === 0 ? 'market' : money(+order.price * +order.amount),
        timestamp: order.timestamp,
        date: new Date(order.timestamp).toLocaleDateString('en-US'),
        status: order.info.status ? order.info.status : 'new',
      }));

      return formatedData.sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    return [];
  };

  return (
    <div className="depo__orders_table">
      {/* <p className="text-white text-center">
        Here will be your <span className="text-success">{type}</span> orders
      </p> */}
      <ScrollBar className="perfect_content">
        <Table
          // scroll={{ x: 100 }}
          loading={isLoading}
          className="RCM_two_level_table1"
          columns={type === 'Open' ? openOrdersColumns : closedOrdersColumns}
          dataSource={data && handleFormatedData()}
          locale={{ emptyText: 'No data to display!' }}
          pagination={{ pageSize: 7 }}
        />
      </ScrollBar>
    </div>
  );
};

export default OrdersTable;
