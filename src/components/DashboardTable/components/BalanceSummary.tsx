import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Row, Table } from 'antd';
import Loading from '../../Loading/Loading';
import { IBalanceSummary } from '../../../interfaces/BalanceSummary';

/**
 * Renders a default balance summary to the dashboard
 * @param props
 */
const BalanceSummary: React.FC<IBalanceSummary> = ({
  title,
  columns,
  preloadData = [],
  onSelectRowRender,
  childrenTitle = '',
  childrenData,
  isLoading = false,
  onCloseChild,
  onRowSelect,
}) => {
  const [shouldHideChild, setShouldHideChild] = useState(false);
  const BoundChildrenElement = React.isValidElement(onSelectRowRender)
    ? React.cloneElement(onSelectRowRender, {
        onBack: () => {
          setShouldHideChild(true);
          setTimeout(() => {
            onCloseChild();
            setShouldHideChild(false);
          }, 350);
        },
        data: childrenData,
        title: childrenTitle,
      })
    : onSelectRowRender;

  return (
    <div className="depo__balance-summary p-2">
      <Loading show={isLoading} />
      <div
        className={`balance-summary-children px-3 py-1 w-100 deft ${
          !!childrenData && !isLoading && !shouldHideChild
            ? 'push-left'
            : 'push-right'
        }`}
      >
        {BoundChildrenElement}
      </div>
      <Row
        style={{
          // width: '100%',
          zIndex: 1,
          position: 'relative',
          marginBottom: '-26px',
          top: '5px',
        }}
      >
        <h4 style={{ color: '#FFF', fontSize: '20px' }}>
          {title.toUpperCase()}
        </h4>
      </Row>
      <Table
        columns={columns}
        dataSource={JSON.parse(JSON.stringify(preloadData))}
        pagination={false}
        onRow={(record) => ({
          onClick: () => {
            onRowSelect(record);
          },
        })}
        // style={{ width: '500px', marginBottom: '106px' }}
      />
      {/* <div className="dex-graphic">
        <MiniChart
        colorTheme="dark"
        autosize={trueValue}
        symbol="BINANCE:ETHBTC"
        isTransparent
        />
        </div>
        <div className="dexinfo">
        <Row>
        <p>Available balance: $15,000.15</p>
        <p>Collateralization: 15,000.15</p>
        </Row>
      </div> */}
    </div>
  );
};

export default BalanceSummary;
