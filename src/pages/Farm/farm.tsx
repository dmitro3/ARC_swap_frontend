import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Grid,
  Input,
  Menu,
  Radio,
  Switch,
  Row,
  Col,
} from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { BiGridHorizontal } from 'react-icons/bi';
import { MdList } from 'react-icons/md';

import { DepoAPISevice } from 'services/DepoAPIService';
import { AuthContext } from '../../contexts/AuthProvider';
import useRefresh from '../../hooks/useRefresh';
import {
  fetchFarmsPublicDataAsync,
  fetchFarmUserDataAsync,
  fetchJungleFarmsPublicDataAsync,
  fetchJungleFarmUserDataAsync,
} from '../../state/actions';
import {
  useFarms,
  useFarmsLoading,
  useJungleFarms,
  useJungleFarmsLoading,
} from '../../state/hook';
import { useAppDispatch } from '../../state';
import ListItem from './Component/listItem';
import PairItem from './Component/pairItem';
import Loading from '../../components/Loading/Loading';

import './style.scss';

const options = [
  { label: 'Active', value: 1 },
  { label: 'Coming soon', value: 2 },
  { label: 'Inactive', value: 3 },
];

const Farm: React.FC = () => {
  const [tabStatus, setTabStatus] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [isStaked, setStaked] = useState(false);
  const [poolInfo, setPoolInfo] = useState<any>([]);
  const [chainIdx, setChainIdx] = useState(1);
  const [arcPrice, setARCPrice] = useState(0);
  const dispatch = useAppDispatch();
  const breakpoints = Grid.useBreakpoint();
  const [isView, setView] = useState(0);
  const { user, web3Provider, chainId, ARCToken } = useContext(AuthContext);

  const farmsLoading = useFarmsLoading();
  const data = useFarms();
  const jungleFarmsLoading = useJungleFarmsLoading();
  const jungleData = useJungleFarms();

  const filterByText = (filterData: any) =>
    filterData.filter(
      (item: any) =>
        item.lpSymbol.includes(searchText.toUpperCase() as string) > 0,
    );

  const filteryByTab = (filter: any) => {
    if (tabStatus === 1) {
      return filter.filter((item: any) => item.active === true);
    }
    if (tabStatus === 3) {
      return filter.filter((item: any) => item.active === false);
    }
    return [];
  };

  const filterByStake = (filter: any) => {
    if (isStaked === true) {
      return filter.filter(
        (item: any) =>
          new BigNumber(item.userData ? item.userData.stakedBalance : 0) >
          new BigNumber(0),
      );
    }
    return filter;
  };

  const { slowRefresh } = useRefresh();

  useEffect(() => {
    if (web3Provider && chainId) {
      setChainIdx(chainId);
      dispatch(fetchFarmsPublicDataAsync({ web3Provider, chainId })).then(
        () => {
          if (user?.settings?.defaultWallet) {
            dispatch(
              fetchFarmUserDataAsync({
                web3Provider,
                chainId,
                account: user?.settings?.defaultWallet,
              }),
            );
          }
        },
      );
      dispatch(fetchJungleFarmsPublicDataAsync({ web3Provider, chainId })).then(
        () => {
          if (user?.settings?.defaultWallet) {
            dispatch(
              fetchJungleFarmUserDataAsync({
                web3Provider,
                chainId,
                account: user?.settings?.defaultWallet,
              }),
            );
          }
        },
      );
    }
  }, [slowRefresh, web3Provider, chainId, user]);

  useEffect(() => {
    let filteredData = data.concat(jungleData);
    filteredData = filteryByTab(filteredData);
    filteredData = filterByText(filteredData);
    filteredData = filterByStake(filteredData);
    setPoolInfo(filteredData);
  }, [data, jungleData, isStaked, tabStatus, searchText]);

  useEffect(() => {
    (async () => {
      const arcPrice = await DepoAPISevice.getPriceUSDTWithAddress(
        ARCToken.symbol,
        ARCToken.address.toLowerCase(),
      );
      setARCPrice(arcPrice);
    })();
  }, []);

  const onChange = (e: any) => setTabStatus(e.target.value);

  const onSearchTextChange = (e: any) => setSearchText(e.target.value);

  const onChangeView = (viewIndex: number) => () => setView(viewIndex);

  const onStacked = (checked: boolean) => setStaked(checked);

  const handleMenuClick = (e: any) => setTabStatus(parseInt(e.key, 10));

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Active</Menu.Item>
      <Menu.Item key="2">Coming Soon</Menu.Item>
      <Menu.Item key="3">Inactive</Menu.Item>
    </Menu>
  );

  const loading = farmsLoading.public || jungleFarmsLoading.public;

  return (
    <>
      {loading && (
        <div className="loader__Wrapper">
          <Loading show={loading} />
        </div>
      )}
      <div id="depo__farm">
        <div className="farm__PanelContainer">
          <div>
            <h3 className="page-title">Farm</h3>
            <div className="farm__PanelText2">Stake tokens to earn.</div>
          </div>
        </div>
        {loading ? null : (
          <>
            <div className="farm__toolbarContainer">
              <div className="farm__filterContainer">
                <Input
                  className="farm__searchInput"
                  placeholder="Search Farms"
                  prefix={<SearchOutlined color="#fff" />}
                  onChange={onSearchTextChange}
                />
                <Dropdown overlay={menu}>
                  <Button className="farm__dropDown">
                    {
                      options.find((option) => option.value === tabStatus)
                        ?.label
                    }
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </div>
              <div className="farm__viewContainer">
                <Switch style={{ marginRight: 8 }} onChange={onStacked} />
                <div style={{ marginRight: 16 }} className="farm__staked">
                  Staked only
                </div>
                <BiGridHorizontal
                  onClick={onChangeView(0)}
                  style={{ marginRight: '0.5rem' }}
                  size={40}
                  color={isView === 0 ? '#007aff' : '#FFFFFF'}
                />
                <MdList
                  onClick={onChangeView(1)}
                  style={{ marginRight: '0.5rem' }}
                  size={40}
                  color={isView === 1 ? '#007aff' : '#FFFFFF'}
                />
              </div>
            </div>
            {isView === 0 ? (
              <Row className="p-0" style={{ margin: '0 -12px' }}>
                {poolInfo.map((item: any) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    key={`${item.version}-${item.pid}`}
                  >
                    <PairItem
                      farmItem={item}
                      lpAddress={
                        item.pid < 0
                          ? item.lockedAddress[chainIdx]
                          : item.lpAddress[chainIdx]
                      }
                      poolId={item.pid}
                      arcPrice={arcPrice}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="farm__listViewContainer">
                {poolInfo.map((item: any, index: number) => (
                  <div key={`${item.version}-${item.pid}`}>
                    <ListItem
                      farmItem={item}
                      lpAddress={
                        item.pid < 0
                          ? item.lockedAddress[chainIdx]
                          : item.lpAddress[chainIdx]
                      }
                      poolId={item.pid}
                      arcPrice={arcPrice}
                    />
                    {index !== poolInfo.length - 1 && (
                      <div className="farm__divider" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Farm;
