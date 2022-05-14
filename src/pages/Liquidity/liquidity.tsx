/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import { Row, Col, Select } from 'antd';
import SubgraphClient from '../../services/SubgraphClient';
import PoolFilter from './components/PoolFilter';
import PoolTable from './components/PoolTable';
import Notification from '../../components/Notification/Notification';
import Loading from '../../components/Loading/Loading';
import { AuthContext } from '../../contexts/AuthProvider';
import { SupportedAPIPools } from '../../interfaces/NetworkPools';
import { SubgraphPair } from '../../interfaces/Subgraphs';
import { INetworkLiquidityProtocol } from '../../interfaces/NetworkLiquidityProtocol';
import { __clearDebounce, __debounce } from '../../utility/debounce';
import protocols from '../../utility/liquidity-protocols/protocols';
import sushiLogo from '../../assets/sushiLogo.svg';
import uniswapLogo from '../../assets/uniswapLogo.svg';
import { DepoAPISevice } from '../../services/DepoAPIService';

import './style.scss';
import { useLocation } from 'react-router-dom';
import parseQueryString from '../../utility/query-string';

const Liquidity: React.FC = () => {
  // const [isModalAlertOpen, setIsModalAlertOpen] = useState<boolean>(true);
  const { search: query } = useLocation();
  const [search, setSearch] = useState('');
  const [pools, setPools] = useState<SubgraphPair[]>([]);
  const [isPoolsLoading, setIsPoolsLoading] = useState(false);
  const [isPoolLoading, setIsPoolLoading] = useState(false);
  const [protocol, setProtocol] = useState<keyof SupportedAPIPools | undefined>(
    'uniswap-v2',
  );
  const [prot, setProt] = useState<any>();
  const { tokens, chainId } = useContext(AuthContext);
  const [filteredPools, setFilteredPools] = useState<SubgraphPair[]>([]);
  const [compatibleProtocols, setCompatibleProtocols] = useState<
    INetworkLiquidityProtocol[]
  >([]);

  const handleQueryString = () => {
    const query = parseQueryString();

    if (query['filterByToken']) {
      setSearch(query.filterByToken);
    }
    if (query['protocol']) {
      setProtocol(query.protocol as keyof SupportedAPIPools);
    }
  };

  const fetchFromSubgraphs = async () => {
    if (chainId) {
      const client = new SubgraphClient(protocol, chainId);
      const hasRemotePool = await getPool(client, search);
      if (hasRemotePool) return [hasRemotePool];
    }
    return [];
  };

  const filterPools = async () => {
    const rgx = new RegExp(search.replace(/\W+/gim, ''), 'gim');
    let filtered = pools.filter((pool) => {
      const symbol0 = pool.token0.symbol;
      const symbol1 = pool.token1.symbol;
      const concat0 = `${symbol0}${symbol1}`;
      const concat1 = `${symbol1}${symbol0}`;
      return concat0.match(rgx) || concat1.match(rgx) || pool.id.match(rgx);
    });
    if (!filtered.length && /(0x)?[0-9a-f]{40}$/gi.test(search)) {
      filtered = await fetchFromSubgraphs();
    }
    return filtered;
  };

  const getPool = async (client: SubgraphClient, contract: string) => {
    try {
      setIsPoolLoading(true);
      const pool = await client.getPair(contract);
      if (pool) {
        return pool;
      }
      throw new Error('Pair not found.');
    } catch (error) {
      const err = error as Error;
      Notification({
        type: 'error',
        message: err.message ?? 'Pair not found',
      });
    } finally {
      setIsPoolLoading(false);
    }
    return undefined;
  };

  const getPools = async () => {
    setIsPoolsLoading(true);
    if (chainId && protocol) {
      try {
        const client = new SubgraphClient(protocol, chainId);
        const foundPools = await DepoAPISevice.getLiquidityPools(
          chainId,
          protocol,
        );
        setPools(foundPools.pairs);
        setFilteredPools(foundPools.pairs);
        setProt(client.getProtocol());
        handleQueryString();
      } catch (error) {
        const err = error as Error;
        Notification({
          type: 'error',
          message: err.message,
        });
      } finally {
        setIsPoolsLoading(false);
      }
    }
  };

  const filterNetworks = () => {
    const compatible = protocols.filter((item) =>
      item.networks.find(
        (network) => +parseInt(network.chainId, 16) === chainId,
      ),
    );
    setCompatibleProtocols(compatible);
    if (compatible.length) {
      setProtocol(compatible[0].parsedName);
    } else {
      setProtocol(undefined);
      // setProtocol(undefined);
      Notification({
        type: 'info',
        message: 'No protocol available for the current network.',
      });
    }
  };

  useEffect(() => {
    if (tokens.length && protocol) {
      __debounce(
        () => {
          getPools();
        },
        250,
        'getPools',
      );
    } else {
      __clearDebounce('getPools');
      setFilteredPools([]);
      setPools([]);
    }
  }, [tokens, protocol]);

  // const handleCloseModalAlert = () => {
  //   setIsModalAlertOpen(!isModalAlertOpen);
  // };
  useEffect(() => {
    __debounce(
      async () => {
        const filtered = await filterPools();
        setFilteredPools(filtered);
      },
      250,
      'filterLiquidityPools',
    );
    refreshTable();
  }, [search]);

  useEffect(() => {
    filterNetworks();
    refreshTable();
  }, [chainId, filteredPools]);

  // const handleCloseModalAlert = () => {
  //   setIsModalAlertOpen(!isModalAlertOpen);
  // };
  const refreshTable = () => {
    const elementArray = document.getElementsByClassName('ant-table-row');
    if (elementArray.length !== 0) {
      for (let i = 0; i < filteredPools.length; i += 1) {
        const el = elementArray.item(i % 10);
        if (el) {
          const sibling = el.nextElementSibling?.children[0]?.children[0];
          // First row cell
          const cell1 = el.children[0].children[0];
          // Last row cell
          const cell4 =
            el.children.length > 4
              ? el.children[4].children[0].children[0]
              : el.children[1].children[0].children[0];
          if (cell1 && cell4) {
            if (sibling && sibling.className.includes('expanded')) {
              sibling.className = sibling.className.replace(
                'row-expanded',
                'row-collapsed',
              );
            }

            // And if is closing, add them.
            cell1.className += ' rounded-bottom-left';
            cell4.className = cell4.className.replace(
              'rotate-z-90',
              'rounded-bottom-right',
            );
          }
        }
      }
    }
  };
  const onSearchChange = (e: any) => {
    setSearch(e.target.value);
  };
  return (
    <div className="py-3 depo__liquidity-body-wrapper">
      <h3 className="page-title">Pools</h3>
      <Loading show={isPoolLoading || isPoolsLoading} />

      <Row gutter={[24, 0]}>
        <Col flex="auto" className="rounded text-left mx-0 pl-0">
          <PoolFilter search={search} onChange={onSearchChange} />
        </Col>
        <Col className="d-flex align-items-end px-0">
          <Select
            className="depo__select bg-dark rounded w-100"
            value={protocol}
            onChange={($e) => {
              setProtocol($e as keyof SupportedAPIPools);
            }}
          >
            {compatibleProtocols.map((item) => {
              if (item.name === 'Sushi Swap') {
                return (
                  <option value={item.parsedName}>
                    <img src={sushiLogo} alt="logo" />
                    <span className="option-text">{item.name}</span>
                  </option>
                );
              } else {
                return (
                  <option value={item.parsedName}>
                    <img src={uniswapLogo} alt="logo" />
                    <span className="option-text">{item.name}</span>
                  </option>
                );
              }
            })}
          </Select>
        </Col>
      </Row>
      <Row gutter={[24, 0]}>
        <Col span={24} className="bg-light-alpha-10 rounded pool-table-content">
          {!!pools.length ? (
            <PoolTable protocol={protocol} items={filteredPools} />
          ) : (
            <div className="text-center">
              <h5 className="text-white">
                No protocol available for the current network.
              </h5>
              <p className="text-secondary">Try changing the network</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Liquidity;
