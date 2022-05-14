/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState, useContext } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'react-perfect-scrollbar/dist/css/styles.css';
import {
  BalanceSummaryChild,
  IBalanceSummaryTable,
} from '../../../interfaces/BalanceSummary';
import BackButton from '../../BackButton/BackButton';
import BalanceSummary from './BalanceSummary';
import money from '../../../utility/money';
import CexBalanceSummaryChild from './CexBalanceSummaryChild';
import CexOpenOrdersModal from './CexOpenOrdersModal';
import { AuthContext } from '../../../contexts/AuthProvider';

const CexBalanceChild: React.FC<BalanceSummaryChild> = ({
  onBack,
  data,
  title,
  totalBalance = {},
}) => {
  const { allOpenOrders } = useContext(AuthContext);

  /**
   * The current displaying data in the children
   */
  const [display, setDisplay] = useState<IBalanceSummaryTable[] | undefined>(
    undefined,
  );

  const [openOrdersDisplay, setOpenOrdersDisplay] = useState<any>([]);

  const [selectedRow, setSelectedRow] = useState('');

  const [tableItems, setTableItems] = useState<IBalanceSummaryTable[]>([]);

  const [openOrdersModalVisible, setOpenOrdersModalVisible] = useState(false);

  const columns = [
    {
      title: 'ASSET',
      key: 'name',
      render: (row: IBalanceSummaryTable) => {
        if (row.name.match(/open order/gi)) {
          return {
            children: (
              <div className="balance-summary-table-col rounded-left-sm rounded-right-sm py-2 pointer text-center">
                {row.name}
              </div>
            ),
            props: {
              colSpan: 2,
            },
          };
        }
        return (
          <div className="balance-summary-table-col rounded-left-sm py-2 pointer ">
            {row.name}
          </div>
        );
      },
    },
    {
      title: 'BALANCE',
      key: 'value',
      render: (row: IBalanceSummaryTable) => {
        const children = (
          <div className="balance-summary-table-col rounded-right-sm py-2 pointer">
            {money(+row.value, 'en-US', 'USD', 2, 2)}
          </div>
        );
        if (row.name.match(/open order/gi)) {
          return {
            children,
            props: {
              colSpan: 0,
            },
          };
        }
        return children;
      },
    },
  ];

  const filterOpenOrders = () => {
    if (Array.isArray(allOpenOrders)) {
      setOpenOrdersDisplay(
        allOpenOrders
          .filter(
            (order) => order.exchange.toLowerCase() === title?.toLowerCase(),
          )
          .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol)),
      );
    }
  };

  const setDataToDisplay = async (name: string) => {
    switch (name) {
      case 'Holdings':
        setDisplay(data);
        break;
      case 'Positions':
        setDisplay([]);
        break;
      case 'Open orders':
        filterOpenOrders();
        setOpenOrdersModalVisible(true);
        break;
      default:
        setDisplay([]);
    }
  };

  useEffect(() => {
    if (selectedRow.length) setDataToDisplay(selectedRow);
  }, [selectedRow]);

  useEffect(() => {
    setTableItems([
      {
        name: 'Holdings',
        value: totalBalance.spot ?? 0,
      },
      {
        name: 'Positions',
        value: totalBalance.future ?? 0,
      },
      {
        name: 'Open orders',
        value: '',
      },
    ]);
  }, [data]);

  return (
    <>
      <BackButton
        onBack={onBack}
        backTitle={title?.toUpperCase()}
        showBackTitle
        className="mb-3 mt-2"
      />
      <BalanceSummary
        childrenTitle={selectedRow}
        title=""
        isLoading={false}
        childrenData={display}
        preloadData={tableItems}
        columns={columns}
        onRowSelect={(row) => {
          setSelectedRow(row.name);
        }}
        onSelectRowRender={<CexBalanceSummaryChild exchange={title} />}
        onCloseChild={() => {
          setDisplay(undefined);
          setSelectedRow('');
        }}
      />
      {!!title && (
        <CexOpenOrdersModal
          type={title}
          open={openOrdersModalVisible}
          onClose={() => {
            setOpenOrdersModalVisible(false);
            setSelectedRow('');
          }}
          data={openOrdersDisplay}
        />
      )}
    </>
  );
};

export default CexBalanceChild;
