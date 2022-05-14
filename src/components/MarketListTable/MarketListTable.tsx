import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Table, Input, Row, Col, Radio, Popover, Select, Grid } from 'antd';
import {
  DownSquareFilled,
  EyeOutlined,
  UpSquareFilled,
  SyncOutlined,
} from '@ant-design/icons';
import ftxLogo from '../../assets/ftxLogo.png';
import huobiLogo from '../../assets/huobiLogo.png';
import binanceLogo from '../../assets/binanceLogo.png';
import kucoinLogo from '../../assets/kucoinLogo.png';

import { DepoAPISevice } from '../../services/DepoAPIService';
import money from '../../utility/money';
import numberFormater from '../../utility/numberFormater';

import './styles.scss';
import { __debounce } from '../../utility/debounce';
import { columsKucoinHoldings } from '../DashboardTable/utils/info';

const { Group, Button } = Radio;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Function

const MarketListTable: React.FC<{ type: string }> = ({ type }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [popOverIsLoading, setPopOverIsLoading] = useState(true);
  const exchanges =
    type === 'spot'
      ? ['Binance', 'Huobi', 'FTX', 'Kucoin', 'Gate.io']
      : ['Binance', 'FTX', 'Kucoin', 'Gate.io'];
  const [selectedQuoteTable, setSelectedQuoteTable] = useState<string>('');

  const [selectedExchange, setSelectedExchange] = useState<string>('Binance');
  const [allQuotes, setAllQuotes] = useState<any>([]);
  const [allMarketOffersOfQuote, setAllMarketOffersOfQuote] = useState<any>([]);
  const [searchValueTable, setSearchValueTable] = useState('');
  const [tablePageSize, setTablePageSize] = useState(5);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [allSymbolValue, setAllSymbolValue] = useState<any[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);
  const breakpoint = useBreakpoint();

  const checkIfIsFTXFuture = selectedExchange === 'FTX' && type === 'future';

  const handleFirstApiData = async () => {
    setIsLoading(true);
    try {
      // const firstFetchExchange = 'USDT';
      const response = await DepoAPISevice.getMarketOverviewData(
        type,
        selectedExchange,
        selectedQuoteTable,
      );
      const { allSingleQuotes, marketOfQuote } = response;
      setAllQuotes(allSingleQuotes);
      setAllMarketOffersOfQuote(marketOfQuote);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  // eslint-disable-next-line consistent-return
  const handleAllSymbolValue = async (symbol: string) => {
    setPopOverIsLoading(true);
    try {
      const response = await DepoAPISevice.getSymbolAllExchanges(type, symbol);
      setAllSymbolValue(response);
    } catch (err) {
      console.log(err);
    }
    setPopOverIsLoading(false);
  };

  const getStateSymbolValue = (exchange: string) =>
    allSymbolValue &&
    allSymbolValue.find((item) => item?.exchange === exchange)?.price
      ? parseFloat(
          allSymbolValue.find((item) => item?.exchange === exchange)?.price,
        ).toFixed(6)
      : 'Not Listed';

  const filterMarkets = () => {
    const rgx = new RegExp(searchValueTable.replace(/\W+/gim, ''), 'gim');
    return allMarketOffersOfQuote.filter((market: any) => {
      const symbol = market.symbol.split('/');
      const concat0 = `${symbol[0]}${symbol[1]}`;
      const concat1 = `${symbol[1]}${symbol[0]}`;
      return concat0.match(rgx) || concat1.match(rgx);
    });
  };

  useEffect(() => {
    __debounce(
      () => {
        setFilteredItems(filterMarkets());
      },
      250,
      'fitlerMarketItems',
    );
  }, [searchValueTable]);

  useEffect(() => {
    setFilteredItems(filterMarkets());
  }, [allMarketOffersOfQuote]);

  useEffect(() => {
    if (selectedExchange && selectedQuoteTable) {
      handleFirstApiData();
    }
  }, [selectedExchange, selectedQuoteTable]);

  useEffect(() => {
    setSelectedQuoteTable(type === 'spot' ? 'BTC' : 'USDT');
  }, [type]);

  const popOverContent = (symbol: string) => (
    <div className="depo__market_popover">
      <div className="market_popover-content">
        <div className="market_popover-body">
          {popOverIsLoading ? (
            <Row justify="center">
              <Col>
                <SyncOutlined spin />
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                <Col className="p-0">
                  <span className="market_popover-body-title">
                    This market’s price on other exchanges:
                  </span>
                  <Row style={{ marginTop: '5px' }}>
                    <Col style={{ padding: '0px' }}>
                      <img
                        style={{ width: '24px', margin: '2px 5px 0px 0px' }}
                        src={binanceLogo}
                        alt="graphic"
                      />
                      <span className="market_popover-exchange">
                        {getStateSymbolValue('binance')}
                      </span>
                      <br />
                      <img
                        style={{ width: '24px', margin: '2px 5px 0px 0px' }}
                        src={ftxLogo}
                        alt="graphic"
                      />
                      <span className="market_popover-exchange">
                        {getStateSymbolValue('ftx')}
                      </span>
                      <br />
                      <img
                        style={{ width: '24px', margin: '2px 5px 0px 0px' }}
                        src={huobiLogo}
                        alt="graphic"
                      />
                      <span className="market_popover-exchange">
                        {getStateSymbolValue('huobi')}
                      </span>
                      <br />
                      <img
                        style={{ width: '24px', margin: '2px 5px 0px 0px' }}
                        src={kucoinLogo}
                        alt="graphic"
                      />
                      <span className="market_popover-exchange">
                        {getStateSymbolValue('kucoin')}
                      </span>
                      <br />
                    </Col>
                  </Row>
                  <Row justify="center">
                    <Link
                      to={{
                        pathname: `/market-details/${selectedExchange}-${type}-${symbol.replace(
                          '/',
                          '-',
                        )}`,
                      }}
                    >
                      Go To Market
                    </Link>
                  </Row>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const popOver = (symbol: string) => (
    <Popover
      placement="bottomRight"
      content={() => popOverContent(symbol)}
      trigger="click"
    >
      <EyeOutlined
        style={{ paddingLeft: '10px' }}
        onClick={() => handleAllSymbolValue(symbol)}
      />
    </Popover>
  );

  const columns = [
    {
      title: 'Market',
      dataIndex: 'symbol',
      sorter: (a: any, b: any) => a.symbol.localeCompare(b.symbol),
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span className="item_table">{b.symbol}</span>
          </Link>
        );
      },
    },
    {
      // 2 niveis
      title: 'Volume 24h',
      dataIndex: 'volume_24h',
      // sorter: (a: any, b: any) => a.volume_24h.localeCompare(b.volume_24h),
      sorter: (a: any, b: any) => a.volume_24h - b.volume_24h,
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span className="item_table">{numberFormater(b.volume_24h)} </span>{' '}
            <br />
            <span style={{ color: '#5C5C5D' }}>
              {money(b.volume_24h_usd.toFixed(2))}
            </span>
          </Link>
        );
      },
    },
    {
      // 2 niveis
      title: 'Price',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span className="item_table">{b.price} </span> <br />
            <span style={{ color: '#5C5C5D' }}>{money(b.price_usd)}</span>
          </Link>
        );
      },
    },
    {
      title: 'Change 24h',
      dataIndex: 'change_24h',
      sorter: (a: any, b: any) => a.change_24h - b.change_24h,
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        if (a > 0) {
          return (
            <Link
              to={{
                pathname: `/market-details/${routeInfos}`,
              }}
            >
              <span style={{ color: '#007aff', marginLeft: '10px' }}>
                <UpSquareFilled
                  color="#007aff"
                  style={{ margin: '0px 4px 0px 0px' }}
                />
                {parseFloat(a.toString()).toFixed(2)}%
              </span>
            </Link>
          );
        }
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span style={{ color: 'red', marginLeft: '10px' }}>
              <DownSquareFilled
                color="#F34747"
                style={{ margin: '0px 4px 0px 0px' }}
              />
              {parseFloat(a.toString()).toFixed(2)}%
            </span>
          </Link>
        );
      },
    },
    {
      title: 'View',
      // render: (a: any, b: any) => {
      //   const formattedSymbol = b.symbol.replace('/', '-');
      //   return (
      //     <Link
      //       to={{
      //         pathname: `/market-details/${formattedSymbol}`,
      //       }}
      //     >
      //       <EyeOutlined
      //         style={{ paddingLeft: '10px' }}
      //         // onClick={() => handleAllSymbolValue(symbol)}
      //       />
      //     </Link>
      //   );
      // },
      render: (a: any) => popOver(a.symbol),
    },
  ];

  const mobileColumns = [
    {
      title: 'Name',
      dataIndex: 'symbol',
      sorter: (a: any, b: any) => a.symbol.localeCompare(b.symbol),
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span className="item_table">{b.symbol}</span>
            <br />
            <span
              className="item_table"
              style={{ color: '#5C5C5D', fontSize: 12 }}
            >
              Vol {numberFormater(b.volume_24h)}
            </span>
          </Link>
        );
      },
    },
    {
      // 2 niveis
      title: 'Price',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span className="item_table">{b.price} </span> <br />
            <span style={{ color: '#5C5C5D' }}>{money(b.price_usd)}</span>
          </Link>
        );
      },
    },
    {
      title: '24hr chg%',
      dataIndex: 'change_24h',
      sorter: (a: any, b: any) => a.change_24h - b.change_24h,
      render: (a: any, b: any) => {
        const formattedSymbol = b.symbol.replace('/', '-');
        const routeInfos = `${selectedExchange}-${type}-${formattedSymbol}`;
        if (a > 0) {
          return (
            <Link
              to={{
                pathname: `/market-details/${routeInfos}`,
              }}
            >
              <span style={{ color: '#007aff', marginLeft: '10px' }}>
                <UpSquareFilled
                  color="#007aff"
                  style={{ margin: '0px 4px 0px 0px' }}
                />
                {parseFloat(a.toString()).toFixed(2)}%
              </span>
            </Link>
          );
        }
        return (
          <Link
            to={{
              pathname: `/market-details/${routeInfos}`,
            }}
          >
            <span style={{ color: 'red', marginLeft: '10px' }}>
              <DownSquareFilled
                color="#F34747"
                style={{ margin: '0px 4px 0px 0px' }}
              />
              {parseFloat(a.toString()).toFixed(2)}%
            </span>
          </Link>
        );
      },
    },
  ];

  const handleExchangeChange = (exchangeNameProps: string) => {
    setSelectedExchange(exchangeNameProps);
  };

  const handleQuoteChange = (quoteNameProps: string) => {
    setSelectedQuoteTable(quoteNameProps);
  };

  return (
    <div className="depo__market_table_list">
      <Row>
        <Col xs={24}>
          <div className="depo__market_header">
            <h5 className="market-title">
              <span className="market-info">
                {!checkIfIsFTXFuture ? selectedQuoteTable : 'All'}
              </span>{' '}
              Markets <span className="market-info">on {selectedExchange}</span>
            </h5>
            <div className="market-search-wrapper">
              <Input
                className="market-search"
                onChange={($e) => {
                  setSearchValueTable($e.target.value);
                }}
                placeholder="Search..."
              />
            </div>
            <div className="market-select">
              <span className="market-exchange-name">Exchange</span>
              <Select
                defaultValue={selectedExchange}
                dropdownStyle={{
                  background: '#070708',
                  color: '#fff',
                  borderRadius: 10,
                }}
                onChange={(value) => handleExchangeChange(value)}
              >
                {exchanges.map((exchange) => (
                  <Option
                    key={exchange}
                    value={exchange}
                    className="selectOptions"
                  >
                    {exchange}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Col>
      </Row>
      {!isLoading && !checkIfIsFTXFuture && filteredItems.length > 0 && (
        <Row className="market_table_col_btns">
          <Col xs={24}>
            <Group
              buttonStyle="outline"
              defaultValue={selectedQuoteTable}
              value={selectedQuoteTable}
            >
              {allQuotes
                .filter((quote: any) => !!quote?.length)
                .map((quote: any) => (
                  <Button
                    defaultChecked
                    className="button-radio-group"
                    value={quote}
                    key={quote}
                    onChange={(event) => handleQuoteChange(event.target.value)}
                  >
                    {quote}
                  </Button>
                ))}
            </Group>
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={24}>
          {!isLoading && filteredItems.length === 0 && (
            <p> Oops, {selectedExchange} is not answering. Try again soon.</p>
          )}
          <Table
            className="RCM_two_level_table1 market-list-table"
            columns={breakpoint.sm ? columns : mobileColumns}
            dataSource={filteredItems}
            locale={{ emptyText: 'No data to display!' }}
            pagination={{
              defaultCurrent: tablePageSize,
              pageSizeOptions: ['5', '10', '20', '50'],
              onShowSizeChange: (_, size) => {
                setTablePageSize(size);
              },
            }}
            loading={isLoading}
            rowKey="symbol"
            expandable={{
              expandedRowRender: (row: any) => popOverContent(row.symbol),
              rowExpandable: () => breakpoint.sm !== true,
              expandedRowKeys,
              onExpand: (expanded, row) => {
                if (expanded) {
                  handleAllSymbolValue(row.symbol);
                  setExpandedRowKeys([row.symbol]);
                } else {
                  setExpandedRowKeys([]);
                }
              },
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default MarketListTable;
