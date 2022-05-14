/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { Table } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import ScrollBar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import {
  BalanceSummaryChild,
  IBalanceSummaryTable,
} from '../../../interfaces/BalanceSummary';
import BackButton from '../../BackButton/BackButton';
import DexAssetModal from './DexAssetModal';

const DexBalanceChild: React.FC<BalanceSummaryChild> = ({
  onBack,
  data,
  title,
}) => {
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<IBalanceSummaryTable>();

  const columns = [
    {
      title: 'ASSET',
      key: 'name',
      render: (row: IBalanceSummaryTable) => (
        <div className="balance-summary-table-col rounded-left-sm py-2 pointer">
          {row.name}
        </div>
      ),
    },
    {
      title: 'BALANCE',
      key: 'value',
      render: (row: IBalanceSummaryTable) => (
        <div className="balance-summary-table-col rounded-right-sm py-2 pointer">
          {+String(row.value).replace('$', '') < 0 ? '$0.00' : row.value}
        </div>
      ),
    },
  ];

  const handleRowClick = (record: IBalanceSummaryTable) => {
    setAssetModalVisible(true);
    setSelectedRow(record);
  };

  const handleModalClose = () => {
    setAssetModalVisible(false);
    setTimeout(() => {
      setSelectedRow(undefined);
    }, 300);
  };

  return (
    <>
      <ScrollBar>
        <BackButton
          onBack={onBack}
          backTitle={title?.toUpperCase()}
          showBackTitle
          className="mb-3 mt-2"
        />
        <div>
          <Table
            id="balance-summary-table"
            columns={columns}
            dataSource={data}
            pagination={false}
            onRow={(record) => ({
              onClick: () => {
                handleRowClick(record);
              },
            })}
          />
        </div>
      </ScrollBar>
      {!!selectedRow && title && (
        <DexAssetModal
          type={title}
          open={assetModalVisible}
          data={selectedRow}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default DexBalanceChild;
