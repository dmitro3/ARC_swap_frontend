import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Col, Row, Tabs, Tooltip, Grid } from 'antd';
import { useParams } from 'react-router-dom';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Notification from '../../components/Notification/Notification';

import { ICompareExchange } from '../../interfaces/ICompareExchange';

import { DepoAPISevice } from '../../services/DepoAPIService';

import TradingViewComponent from '../../components/TradingView/TradingView';
import OrderBook from '../../components/OrderBook/OrderBook';

import PlaceOrder from '../../components/PlaceOrder/PlaceOrder';
import PlaceOrderFuture from '../../components/PlaceOrder/PlaceOrderFuture';

import CompareExchanges from '../../components/CompareExchanges/CompareExchanges';
import OrdersTable from '../../components/OrdersTable/OrdersTable';
import { AuthContext } from '../../contexts/AuthProvider';

import './style.scss';

const TooltipMessage =
  'If you know you should have orders for a certain exchange, but they are not showing here, the exchange might be down. Please try again soon.';

const { TabPane } = Tabs;

const { useBreakpoint } = Grid;

interface ISymbol {
  routeInfos: string;
}

const MarketDetails: React.FC = () => {
  const { user, isAuthenticated, getUserCexBalance } = useContext(AuthContext);
  const { routeInfos }: ISymbol = useParams();
  const [exchange] = useState(routeInfos.split('-')[0]);
  const [marketType] = useState(routeInfos.split('-')[1]);
  const [symbol] = useState(
    `${routeInfos.split('-')[2]}-${routeInfos.split('-')[3]}`,
  );
  // const [isModalAlertOpen, setIsModalAlertOpen] = useState<boolean>(true);
  const [userOpenOrders, setUserOpenOrders] = useState<any[]>([]);
  const [userClosedOrders, setUserClosedOrders] = useState<any[]>([]);
  const [compareExchangeLoading, setCompareExchangeLoading] =
    useState<boolean>(false);
  const [compareExchangesData, setCompareExchangesData] = useState<
    ICompareExchange[]
  >([]);

  const [ordersTableLoading, setOrdersTableLoading] = useState<boolean>(true);
  const [cancelOrdersLoading, setCancelOrdersLoading] =
    useState<boolean>(false);

  const breakpoints = useBreakpoint();

  const fetchUserOpenAndClosedOrders = useCallback(async () => {
    setOrdersTableLoading(true);
    if (user?.settings?.defaultWallet) {
      try {
        const response = await DepoAPISevice.getUserOrders(
          user?.settings?.defaultWallet,
          marketType,
          symbol,
        );

        if (response && response.openOrders && response.closedOrders) {
          const { openOrders, closedOrders } = response;

          // console.log(openOrders);

          if (openOrders.length > 0) {
            const filteredOpenOrders = openOrders.filter(
              (item: any) => item.info.status === 'open',
            );
            const sortedOpenOrders = filteredOpenOrders.sort(
              (a: any, b: any) => a.timestamp - b.timestamp,
            );
            setUserOpenOrders(sortedOpenOrders);
          }

          if (closedOrders.length > 0) {
            const filteredClosedOrders = openOrders.filter(
              (item: any) => item.info.status !== 'open',
            );

            const sortedClosedOrders = closedOrders
              .concat(filteredClosedOrders)
              .sort((a: any, b: any) => a.timestamp - b.timestamp);
            setUserClosedOrders(sortedClosedOrders);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    setOrdersTableLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserOpenAndClosedOrders();
  }, [isAuthenticated]);

  const handleCompareExchanges = async (
    symbolToCompare: string,
    type: string,
    userPriceUnit: string,
    userSize: string,
  ) => {
    setCompareExchangeLoading(true);
    try {
      const response = await DepoAPISevice.getExchangeTradeCompare(
        marketType,
        symbolToCompare,
        type,
        userPriceUnit,
        userSize,
      );
      setCompareExchangesData(response);
    } catch (err) {
      console.log(err);
    }
    setCompareExchangeLoading(false);
  };

  const handleCancelOrder = async (exchangeName: string, orderId: string) => {
    setCancelOrdersLoading(true);
    try {
      const walletId = user!.wallets![0]!.address;
      const response = await DepoAPISevice.cancelOrder(
        walletId,
        exchangeName,
        orderId,
        symbol,
      );

      Notification({
        type: 'success',
        message:
          'Order cancelled successfully. The exchange might take a while to reflect this in your balance, please refresh it in a moment.',
      });

      setUserOpenOrders(
        userOpenOrders.filter((order: any) => order.id !== orderId),
      );
    } catch (err) {
      Notification({
        type: 'error',
        message: 'Failed to cancel order, maybe it has already been closed.',
      });
      console.log(err);
    } finally {
      getUserCexBalance(user?.settings?.defaultWallet);
      setCancelOrdersLoading(false);
    }
  };

  const handleNewOrder = (
    order: any,
    exchangeSelected: string,
    type: string,
  ) => {
    const formatedOrder = {
      ...order.response,
      exchange: exchangeSelected,
      price: type === 'Market' ? '0' : +order.response.price,
    };
    return setUserOpenOrders([...userOpenOrders, formatedOrder]);
  };

  // const handleCloseModalAlert = () => {
  //   setIsModalAlertOpen(!isModalAlertOpen);
  // };

  useEffect(() => {
    if (user?.settings?.defaultWallet) {
      setTimeout(() => {
        getUserCexBalance(user?.settings?.defaultWallet);
      }, 5000);
    }
  }, [cancelOrdersLoading]);

  const tabsToolTip = (
    <Tooltip
      placement="leftBottom"
      title={TooltipMessage}
      style={{
        borderRadius: '10px',
        marginBottom: '10px',
      }}
      // className={styles.tooltip}
    >
      <QuestionCircleOutlined style={{ color: 'white' }} />
    </Tooltip>
  );

  return (
    <>
      <Row className="titlepage">
        <div className="page-title mb-2">
          <span>Market Details</span>
          <span className="separatorTitle mx-2">-</span>
          {marketType.toUpperCase()}
          <span className="separatorTitle mx-2">-</span>
          <span>{symbol}</span>
        </div>
      </Row>
      <Row>
        <Col span={24} className="p-1">
          <p>Rates by TradingView</p>
          <p>
            Please note that when you have executed a trade successfully (Buy or
            Sell) it will not automatically populate on the platform. In order
            for it to populate in the balance you will need to refresh the page
            to show the new balance.
          </p>
          <p>
            <strong className="text-danger">
              This requirement to manually refresh the page has no effect on the
              trade being executed.
            </strong>
          </p>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={6}
          style={{
            paddingLeft: '0.3rem',
            paddingRight: '0.3rem',
            order: !breakpoints.lg ? 2 : 0,
          }}
        >
          <OrderBook
            marketType={marketType}
            exchangeSelected={exchange}
            symbolSelected={symbol}
          />
        </Col>
        <Col
          sm={24}
          md={24}
          lg={12}
          className="middle-column"
          style={{ paddingLeft: '0.3rem', paddingRight: '0.3rem' }}
        >
          <Row className="middle-column-content">
            <Col className="trading-view-content">
              <TradingViewComponent
                exchangeName={exchange}
                pairsName={symbol.replace('-', '')}
              />
            </Col>
          </Row>

          <Row className="middle-column-content">
            <Col className="compare-exchanges">
              <CompareExchanges
                quote={symbol.split('-')[1]}
                isLoading={compareExchangeLoading}
                compareExchangesData={compareExchangesData || []}
                marketType={marketType}
              />
            </Col>
          </Row>
          <Row className="middle-column-content">
            {marketType === 'spot' ? (
              <Col style={{ width: '100%' }}>
                {/* Orders */}
                <Tabs
                  defaultActiveKey="1"
                  type="card"
                  className="depo__tabs_wrapper"
                  tabBarExtraContent={tabsToolTip}
                >
                  <TabPane tab="Open Orders" key="1">
                    {/* open orders */}
                    <OrdersTable
                      handleCancelOrder={handleCancelOrder}
                      isLoading={ordersTableLoading}
                      data={userOpenOrders || []}
                      type="Open"
                    />
                  </TabPane>
                  <TabPane tab="Closed Orders" key="2">
                    {/* closed orders */}
                    <OrdersTable
                      handleCancelOrder={handleCancelOrder}
                      isLoading={ordersTableLoading}
                      data={userClosedOrders || []}
                      type="Closed"
                    />
                  </TabPane>
                </Tabs>
              </Col>
            ) : null}
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={6}
          style={{ paddingLeft: '0.3rem', paddingRight: '0.3rem' }}
        >
          {marketType === 'spot' ? (
            <PlaceOrder
              marketType={marketType}
              symbolSelected={symbol}
              handleCompareExchanges={handleCompareExchanges}
              handleNewOrder={handleNewOrder}
              cancelOrdersLoading={cancelOrdersLoading}
            />
          ) : (
            <PlaceOrderFuture
              marketType={marketType}
              symbolSelected={symbol}
              handleCompareExchanges={handleCompareExchanges}
              handleNewOrder={handleNewOrder}
              cancelOrdersLoading={cancelOrdersLoading}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default MarketDetails;
