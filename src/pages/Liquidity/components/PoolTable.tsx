/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-template */
import React, { useContext, useState } from 'react';
import { Row, Col, Table, Grid } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RightOutlined } from '@ant-design/icons';
import { ExpandableConfig } from 'antd/lib/table/interface';
import PoolRowExpanded from './PoolRowExpanded';
import { AuthContext } from '../../../contexts/AuthProvider';
import money from '../../../utility/money';
import { SupportedAPIPools } from '../../../interfaces/NetworkPools';
import { SubgraphPair } from '../../../interfaces/Subgraphs';
import NoTokenImage from '../../../assets/tokens/no-token-image.png';
import CoingeckoService from '../../../services/CoingeckoService';
import { __debounce } from '../../../utility/debounce';

const { useBreakpoint } = Grid;

const PoolTable: React.FC<{
  items: SubgraphPair[];
  protocol?: keyof SupportedAPIPools;
}> = ({ items, protocol = 'uniswap-v2' }) => {
  const { tokens } = useContext(AuthContext);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [tokenImages, setTokenImages] = useState<{
    [key: string]: string;
  }>({});
  const breakpoints = useBreakpoint();

  /**
   * Searches for the token Logo URI in the stored 1Inch supported tokens.
   * @param symbol the token symbol
   * @returns
   */
  const getTokenLogoURI = (
    symbol: string,
    // contractAddress?: string,
  ): string => {
    if (!tokenImages[symbol]) {
      setTokenImages({
        ...tokenImages,
        [symbol]: NoTokenImage,
      });

      const token = tokens.find((item) => item.symbol === symbol);
      // if (!token?.logoURI && contractAddress) {
      //   return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contractAddress}/logo.png`;
      // }/*  */
      if (token && token.logoURI) {
        setTokenImages({
          ...tokenImages,
          [symbol]: token.logoURI,
        });
      } else {
        __debounce(
          async () => {
            const logoURI = await CoingeckoService.tokenInfoById(
              symbol.toLowerCase(),
            );
            if (logoURI) {
              setTokenImages({
                ...tokenImages,
                [symbol]: logoURI,
              });
            }
          },
          250,
          `get${symbol}LogoURI`,
        );
      }
    }
    return tokenImages[symbol];
  };

  /**
   * Returns the contract address in a shorthand form like `7abgc08c...a5cdx`
   * @param address contract address
   */
  const getShortPoolAddress = (address: string) => {
    if (address) {
      const addr =
        address.substr(0, 6) +
        '...' +
        address.substr(address.length - 4, address.length);
      return addr;
    }
    return '';
  };

  /**
   * Antd expandable row options
   */
  const rowExpandableOpts: ExpandableConfig<SubgraphPair> = {
    expandRowByClick: true,
    expandIconColumnIndex: 5,
    expandIcon: () => {
      return (
        <div className="depo__table-item d-flex align-center rounded-top-right rounded-bottom-right justify-right deft">
          <RightOutlined className="depo__table-go-icon deft" />
        </div>
      );
    },
    expandedRowRender: (row: SubgraphPair) => (
      <PoolRowExpanded protocol={protocol} content={row} />
    ),
    onExpand: (expanded, row: SubgraphPair) => {
      const elementArray = document.getElementsByClassName('ant-table-row');
      if (row.key !== undefined) {
        const el = elementArray.item(row.key % tablePageSize);
        if (el) {
          const sibling = el.nextElementSibling?.children[0]?.children[0];
          // In orde to animate collapse, we need to change sibling class
          if (sibling) {
            sibling.className = sibling.className.replace(
              'row-collapsed',
              'row-expanded',
            );
          }
          // First row cell
          const cell1 = el.children[0].children[0];
          // Last row cell
          const cell4 =
            el.children.length > 4
              ? el.children[4].children[0].children[0]
              : el.children[1].children[0].children[0];
          // If it is expanding, remove rounded borders from bottom
          if (expanded) {
            if (cell1) {
              cell1.className = cell1.className.replace(
                'rounded-bottom-left',
                '',
              );
            }
            if (cell4) {
              cell4.className = cell4.className.replace(
                'rounded-bottom-right',
                'rotate-z-90',
              );
            }
          } else {
            // In order to animate, we need to change sibling classes
            if (sibling) {
              sibling.className = sibling.className.replace(
                'row-expanded',
                'row-collapsed',
              );
            }
            // And wait until animation ends before readding the borders
            setTimeout(() => {
              // And if is closing, add them.
              if (cell1) {
                cell1.className += ' rounded-bottom-left';
              }
              if (cell4) {
                cell4.className = cell4.className.replace(
                  'rotate-z-90',
                  'rounded-bottom-right',
                );
              }
            }, 500);
          }
        }
      }
    },
  };

  /**
   * Antd table column rendering definition
   */
  const columns: ColumnsType<SubgraphPair> = [
    {
      key: 'address',
      title: 'Pool',
      render(row: SubgraphPair) {
        return (
          <div
            className="depo__table-item rounded-top-left rounded-bottom-left deft"
            id={`st-expandible-${row.key}`}
          >
            <Row align="middle" className="h-100 py-0 my-0">
              <Col xs={12} className="p-0 m-0">
                <div>{getShortPoolAddress(row.id)}</div>
              </Col>
              <Col xs={6} className="p-0 m-0">
                <img
                  src={getTokenLogoURI(row.token0.symbol)}
                  width="30"
                  alt={row.token0.symbol}
                />
                <span className="ml-2">{row.token0.symbol}</span>
              </Col>
              <Col xs={6} className="p-0 m-0">
                <img
                  src={getTokenLogoURI(row.token1.symbol)}
                  width="30"
                  alt={row.token1.symbol}
                />
                <span className="ml-2">{row.token1.symbol}</span>
              </Col>
            </Row>
          </div>
        );
      },
    },
    {
      key: 'liquidity',
      title: 'Liquidity',
      render(row: SubgraphPair) {
        return (
          <div className="depo__table-item d-flex align-center deft">
            {money(+row.reserveUSD, 'en-Us', 'USD', 2, 2)}
          </div>
        );
      },
    },
    {
      key: 'yearlyROI',
      title: '',
      render() {
        return (
          <div className="depo__table-item d-flex align-center deft">
            &nbsp;
          </div>
        );
      },
    },
    {
      key: 'fee',
      title: 'Fee (%)',
      render() {
        return (
          <div className="depo__table-item d-flex align-center deft w-100">
            <span className="ml-4">0.3%</span>
          </div>
        );
      },
    },
  ];
  const mobileColumns: ColumnsType<SubgraphPair> = [
    {
      key: 'address',
      title: 'Pool',
      render(row: SubgraphPair) {
        return (
          <div
            className="depo__table-item rounded-top-left rounded-bottom-left deft"
            id={`st-expandible-${row.key}`}
          >
            <Row align="middle" className="h-100 py-0 my-0">
              <Col className="p-0 m-0">
                <img
                  src={getTokenLogoURI(row.token0.symbol)}
                  alt={row.token0.symbol}
                  className="depo__symbol-logo"
                />
                <img
                  src={getTokenLogoURI(row.token1.symbol)}
                  alt={row.token1.symbol}
                  className="depo__symbol-logo symbol-base"
                />
              </Col>
              <Col className="p-0 m-0">
                <span className="ml-2">
                  {row.token0.symbol}/{row.token1.symbol}
                </span>
              </Col>
            </Row>
          </div>
        );
      },
    },
  ];

  return (
    <Row className="px-0">
      <Col xs={24} className="m-0 p-0">
        <Table
          className="depo__pool-table"
          columns={breakpoints.sm ? columns : mobileColumns}
          showHeader={breakpoints.sm}
          dataSource={items.map((item, index) => {
            return {
              ...item,
              key: index,
            };
          })}
          expandable={rowExpandableOpts}
          pagination={{
            pageSizeOptions: ['10', '20', '50'],
            onShowSizeChange: (current, size) => {
              setTablePageSize(size);
            },
          }}
        />
      </Col>
    </Row>
  );
};

export default PoolTable;
