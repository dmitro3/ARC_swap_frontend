import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Tabs, Table, Tooltip } from 'antd';
import { MiniChart } from 'react-ts-tradingview-widgets';
import { Link } from 'react-router-dom';
import ScrollBar from 'react-perfect-scrollbar';
import { QuestionCircleOutlined } from '@ant-design/icons';

import TradeLogo from '../../assets/tradeicon.png';
import SwapLogo from '../../assets/swapicon.png';
import PoolsLogo from '../../assets/poolsicon.png';
import MetaMaskSvg from '../../assets/MetaMask_Fox 1.svg';
import logoImg from '../../assets/icons/ARC_Full.svg';

import DashboardTable from '../../components/DashboardTable/DashboardTable';
import DashboardDonut from '../../components/DashboardDonut/DashboardDonut';
import { columsHoldingTable } from '../../components/DashboardTable/utils/info';
import Notification from '../../components/Notification/Notification';
import { AuthContext } from '../../contexts/AuthProvider';
import { IBalanceSummaryTable } from '../../interfaces/BalanceSummary';
import CoingeckoService from '../../services/CoingeckoService';
import { __debounce } from '../../utility/debounce';
import formateNumberWithK from '../../utility/formateNumberWIthK';
import money from '../../utility/money';

import 'react-perfect-scrollbar/dist/css/styles.css';
import './styles.scss';

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const { symbols, uniqueSymbols } = useContext(AuthContext);

  const [chartData, setChartData] = useState<IBalanceSummaryTable[]>([]);
  const [displayUniqueSymbols, setDisplayUniqueSymbols] = useState<any[]>([]);
  const [dexAssets, setDexAssets] = useState<any[]>([]);
  const [btcUsd, setBtcUsd] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [balanceStatuses, setBalanceStatuses] = useState<{
    available: number;
    reserved: number;
  }>({
    available: 0,
    reserved: 0,
  });

  const TooltipMessage =
    "If the USD value for a token you own is $0.00, we couldn't find its conversion rate.";

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

  const fetchBtcUsd = async () => {
    try {
      setIsLoading(true);
      const result = await CoingeckoService.fetchTickerBtcUsd();
      setBtcUsd(+result);
    } catch (error) {
      Notification({
        type: 'error',
        message: 'Unable to get the BTC value in USD.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseBalances = () => {
    if (Array.isArray(symbols)) {
      const parsed = [0, 0];

      symbols.forEach((symbol) => {
        parsed[0] += +symbol.usdValue;
        parsed[1] += +symbol.amount - +symbol.availableValue;
      });

      dexAssets.forEach((asset) => {
        parsed[0] += +asset.value.replace('$', '').replace(',', '');
      });
      const [available, reserved] = parsed;
      setBalanceStatuses({ available, reserved });
    }
  };

  const parseUniqueSymbols = () => {
    if (Array.isArray(uniqueSymbols)) {
      return uniqueSymbols.map((symbol) => ({
        name: `${symbol.symbol}`,
        usdValue: money(symbol.usdValue, 'currency', 'USD', 2, 2),
        reserved: money(
          +symbol.amount - symbol.availableValue,
          'currency',
          'USD',
          2,
          2,
        ),
        symbol: symbol.symbol,
        balance: Intl.NumberFormat('en-US', {
          minimumFractionDigits: 6,
        }).format(symbol.amount),
        btcValue:
          btcUsd !== undefined
            ? (symbol.usdValue / btcUsd).toFixed(8)
            : '0.00000000',
      }));
    }
    return [];
  };

  const parseDexSymbols = () =>
    dexAssets.map((asset: any) => ({
      name: (
        <div className="d-flex align-center">
          <img src={MetaMaskSvg} alt="" width={15} className="mr-2" />
          <span>{asset.name}</span>
        </div>
      ),
      symbol: asset.name,
      usdValue: asset.value,
      reserved: `-`,
      balance: Intl.NumberFormat('en-US', { minimumFractionDigits: 6 }).format(
        asset.balance,
      ),
      btcValue:
        btcUsd !== undefined
          ? (
              parseFloat(asset.value.replace(/[\\$\\,]/g, '')) / +btcUsd
            ).toFixed(8)
          : '0.00000000',
    }));

  const mountTableData = () => {
    const dex = parseDexSymbols();
    const cex = parseUniqueSymbols();
    const tableItems = [...cex, ...dex];

    setDisplayUniqueSymbols(tableItems);
    setChartData(
      tableItems.map(
        (item) =>
          ({
            name: item.symbol,
            value: +parseFloat(item.usdValue.replace('$', '').replace(',', '')),
          } as IBalanceSummaryTable),
      ),
    );
  };

  // useEffect(() => {
  //   fetchBtcUsd();
  // }, []);

  // useEffect(() => {
  //   __debounce(parseBalances, 250, 'parseBalances');
  // }, [symbols]);

  // useEffect(() => {
  //   __debounce(mountTableData, 250, 'mountTableData');
  // }, [uniqueSymbols]);

  // useEffect(() => {
  //   __debounce(mountTableData, 250, 'mountTableData');
  //   __debounce(parseBalances, 250, 'parseBalances');
  // }, [dexAssets]);

  return (
    <Row align="middle" style={{ height: '90vh' }}>
      <Col style={{ textAlign: 'center' }}>
        <img
          style={{ marginBottom: 30, width: '200px' }}
          src={logoImg}
          className="normalLogo"
          alt="depo"
        />
        <h3 className="page-title">
          We are currently working on an extensive upgrade process to deliver a
          new and improved dashboard experience
        </h3>
      </Col>
    </Row>
    // <div>
    //   <h3 className="page-title">Dashboard</h3>
    //   <Row className="p-0 mt-4" gutter={[16, 0]}>
    //     <Col xs={24} sm={24} md={12} lg={8}>
    //       <div className="display__mainbalance">
    //         <div className="display__mainbalance__title">
    //           <p>Total Balance</p>
    //         </div>
    //         <div className="display__mainbalance__balance">
    //           <p>${formateNumberWithK(balanceStatuses.available)}</p>
    //         </div>
    //         <DashboardDonut data={chartData} />
    //         <Row className="display__mainbalance__menu">
    //           <Link to="/market/spot">
    //             <img src={TradeLogo} alt="trade" />
    //             Trade
    //           </Link>
    //           <Link to="/swap">
    //             <img src={SwapLogo} alt="trade" />
    //             Swap
    //           </Link>
    //           <Link to="/pools">
    //             <img src={PoolsLogo} alt="trade" />
    //             Pools
    //           </Link>
    //         </Row>
    //       </div>
    //     </Col>
    //     <Col xs={24} sm={24} md={12} lg={16}>
    //       <div className="display__graphic-content">
    //         <ScrollBar>
    //           <Tabs defaultActiveKey="2">
    //             <TabPane tab="Available Balance" disabled key="1">
    //               <Col className="chart">
    //                 <MiniChart
    //                   autosize
    //                   colorTheme="dark"
    //                   symbol="BINANCE:ETHBTC"
    //                   height={600}
    //                   isTransparent
    //                 />
    //               </Col>
    //             </TabPane>
    //             <TabPane tab="Holdings" key="2" className="table-holdings">
    //               <div
    //                 style={{
    //                   width: 'fit-content',
    //                   height: 'fit-content',
    //                   position: 'relative',
    //                   left: '96%',
    //                   bottom: '48px',
    //                 }}
    //               >
    //                 {tabsToolTip}
    //               </div>
    //               <Table
    //                 columns={columsHoldingTable}
    //                 dataSource={displayUniqueSymbols}
    //                 style={{
    //                   width: '98%',
    //                   marginBottom: '10px',
    //                 }}
    //                 scroll={{ x: true }}
    //                 pagination={false}
    //               />
    //             </TabPane>
    //           </Tabs>
    //         </ScrollBar>
    //       </div>
    //     </Col>
    //   </Row>
    //   <DashboardTable dexHandler={setDexAssets} />
    // </div>
  );
};

export default Dashboard;
