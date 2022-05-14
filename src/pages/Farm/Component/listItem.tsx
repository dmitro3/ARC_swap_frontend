import { Button, Grid, Image, Row } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useAppDispatch } from 'state';
import { fetchFarmUserDataAsync } from 'state/farms';
import { fetchJungleFarmUserDataAsync } from 'state/jungleFarms';

import ModalAlert from 'components/ModalAlert';
import { AuthContext } from 'contexts/AuthProvider';
import standardAbiEth from 'utility/abi/standard-abi.eth';
import UniswapV2LpABI from 'utility/abi/uniswapv2-lp-abi';
import {
  getAddress,
  getArcMasterChefAddress,
  getDepoMasterChefAddress,
} from 'utility/addressHelpers';

import StakingModal from './stakeModal';
import {
  getMasterChefContract,
  getJungleContract,
  getContract,
} from '../utils';

const ZERO = new BigNumber(0);
const ListItem: React.FC<{
  farmItem: any;
  lpAddress: string;
  poolId: number;
  arcPrice: number;
}> = ({ farmItem, lpAddress, poolId, arcPrice }) => {
  const breakpoints = Grid.useBreakpoint();
  const [isHidden, setHidden] = useState(true);
  const [pairName, setPairName] = useState('');
  const [totalLiquidity, setLiquidity] = useState('0');
  const [apy, setAPY] = useState('0');
  const [farmStatus, setFarmStatus] = useState(0);
  const [isVisible, setVisible] = useState(false);
  const [earnings, setEarning] = useState('0');
  const [staked, setStakeAmout] = useState('0');
  const [modalType, setModalType] = useState(1);
  const [depositFee, setFee] = useState('0%');
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const { user, provider, web3Provider, chainId, isAuthenticated } =
    useContext(AuthContext);

  const dispatch = useAppDispatch();

  const { type, active, version } = farmItem;

  const fetchPoolInfo = async () => {
    if (farmItem.userData) {
      const rewardDecimal = parseInt(farmItem.rewardDecimal, 10);
      const lockedDecimal = parseInt(farmItem.lockedDecimal, 10);
      const allow = new BigNumber(farmItem.userData.allowance);
      let id = 0;
      if (!isAuthenticated) {
        id = 0;
      } else if (isAuthenticated) {
        id = 1;
        if (allow > ZERO) {
          id = 2;
        }
      }
      let earn;
      if (farmItem.pid < 0) {
        earn = new BigNumber(farmItem.userData.earnings)
          .dividedBy(new BigNumber(10).pow(new BigNumber(rewardDecimal)))
          .toFixed(8);
      } else {
        earn = new BigNumber(farmItem.userData.earnings)
          .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
          .toFixed(8);
      }
      setEarning(earn);
      let stake;
      if (farmItem.pid < 0) {
        stake = new BigNumber(farmItem.userData.stakedBalance)
          .dividedBy(new BigNumber(10).pow(new BigNumber(lockedDecimal)))
          .toFixed(2);
      } else {
        stake = new BigNumber(farmItem.userData.stakedBalance)
          .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
          .toFixed(2);
      }
      setStakeAmout(stake);
      setFarmStatus(id);
      if (farmItem.apy) {
        setAPY(farmItem.apy.toFixed(4));
      }
      if (farmItem.totalLiquidity) {
        let total;
        if (farmItem.pid < 0) {
          total = new BigNumber(farmItem.totalLiquidity)
            .dividedBy(new BigNumber(10).pow(new BigNumber(lockedDecimal)))
            .toFixed(2);
        } else {
          total = new BigNumber(farmItem.totalLiquidity)
            .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
            .toFixed(2);
        }
        setLiquidity(total);
      }
      if (farmItem.stakedTokenTransferFee) {
        setFee(`${farmItem.stakedTokenTransferFee}%`);
      } else if (farmItem.depositFee) {
        setFee(farmItem.depositFee);
      }
    }
  };

  const handleTransaction = async (params: any) => {
    if (poolId >= 0) {
      await dispatch(fetchFarmUserDataAsync(params));
    } else {
      await dispatch(fetchJungleFarmUserDataAsync(params));
    }
    await fetchPoolInfo();
  };

  const onStaking = () => {
    setModalType(1);
    setVisible(true);
  };

  const onWithdraw = () => {
    setModalType(2);
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onLPLink = () => {
    if (window && chainId) {
      const token0Address = getAddress(
        farmItem.quoteTokenAddresses,
        chainId,
      ) as string;
      const token1Address = getAddress(
        farmItem.tokenAddresses,
        chainId,
      ) as string;
      const originUrl = `https://app.uniswap.org/#/add/v2/${token0Address}/${token1Address}`;
      window.open(originUrl, '_blank');
    } else {
      window.open('https://app.uniswap.org/#/add/v2/WETH', '_blank');
    }
  };

  const onCompond = async () => {
    if ((window.ethereum || provider) && chainId) {
      const masterChef = getMasterChefContract(
        provider || (window.ethereum as any),
        type,
        version,
        chainId,
      );
      if (user && user.settings?.defaultWallet && web3Provider) {
        const account = user.settings?.defaultWallet;
        const receipt = await masterChef.methods
          .compound(poolId)
          .send({ from: account })
          .then(() => handleTransaction({ web3Provider, chainId, account }));
      }
    }
  };

  const onHarvest = async () => {
    if ((window.ethereum || provider) && chainId) {
      const ethProvider = provider || (window.ethereum as any);
      const masterChef =
        poolId < 0
          ? getJungleContract(
              ethProvider,
              type,
              getAddress(farmItem.contractAddress, chainId),
            )
          : getMasterChefContract(ethProvider, type, version, chainId);

      if (user && user.settings?.defaultWallet && web3Provider) {
        const account = user.settings?.defaultWallet;
        if (poolId < 0) {
          const receipt = await masterChef.methods
            .withdraw(0)
            .send({ from: account })
            .then(() => handleTransaction({ web3Provider, chainId, account }));
        } else {
          const receipt = await masterChef.methods
            .withdraw(poolId, 0)
            .send({ from: account })
            .then(() => handleTransaction({ web3Provider, chainId, account }));
        }
      }
    }
  };

  const onEnable = async () => {
    setWarningModalOpen(false);
    if ((window.ethereum || provider) && chainId) {
      const lpContract = getContract(
        provider || (window.ethereum as any),
        farmItem.pid < 0 ? standardAbiEth : UniswapV2LpABI.abi,
        lpAddress,
      );
      if (user && user.settings?.defaultWallet && web3Provider) {
        const account = user.settings?.defaultWallet;
        const receipt = await lpContract.methods
          .approve(
            // eslint-disable-next-line no-nested-ternary
            farmItem.pid < 0
              ? farmItem.contractAddress[chainId]
              : type
              ? getArcMasterChefAddress(chainId)
              : getDepoMasterChefAddress(chainId, version),
            `0x${new BigNumber(2)
              .pow(new BigNumber(256))
              .minus(1)
              .toString(16)}`,
          )
          .send({ from: account })
          .then(() => handleTransaction({ web3Provider, chainId, account }));
      }
    }
  };

  const handleEnable = async () => {
    if (active) {
      await onEnable();
    } else {
      setWarningModalOpen(true);
    }
  };

  const onHidden = () => {
    setHidden(!isHidden);
  };

  useEffect(() => {
    fetchPoolInfo();
  }, [web3Provider, farmItem, farmStatus, user, isAuthenticated]);

  if (!chainId) return null;

  return (
    <>
      <ModalAlert
        open={warningModalOpen}
        message='This Farm option is inactive and no longer paying rewards. Live farms can be found in the "Active" tab. Please only click "Enable Contract" below if you need to withdraw funds from this inactive Farm.'
        onCancel={() => setWarningModalOpen(false)}
        onOk={onEnable}
      />
      {breakpoints.lg ? (
        <div className="list-view__listViewItem">
          <StakingModal
            open={isVisible}
            closeModal={onClose}
            lpAddress={
              farmItem.pid < 0
                ? farmItem.lockedAddress[chainId]
                : farmItem.lpAddress[chainId]
            }
            poolId={poolId}
            type={modalType}
            farmItem={farmItem}
            onTransaction={handleTransaction}
          />
          <div className="list-view__listViewPanelAvatar">
            <Image width="100%" preview={false} src={farmItem.logoImage} />
          </div>
          <div
            className="list-view__listViewPanelField grid-view__PairName"
            style={{ width: '20%', marginLeft: '3%' }}
          >
            {`${farmItem.lpSymbol}${
              active ? '' : ` ${version.toFixed(1)} Inactive`
            }`}
          </div>
          <div className="list-view__listEarn" style={{ width: '15%' }}>
            <div className="list-view__earnTitle">My Earning</div>
            <div className="list-view__earnValue">
              {(+earnings).toFixed(2)} ($
              {(+earnings * arcPrice).toFixed(2)})
            </div>
          </div>
          {active && (
            <div className="list-view__listEarn" style={{ width: '25%' }}>
              <div className="list-view__earnTitle">APY</div>
              <div className="list-view__earnValue">{apy}%</div>
            </div>
          )}
          {active && (
            <div className="list-view__listEarn" style={{ width: '20%' }}>
              <div className="list-view__earnTitle">Liquidity</div>
              <div className="list-view__earnValue">
                <div style={{ marginRight: '15px' }}>
                  {totalLiquidity}{' '}
                  <AiOutlineQuestionCircle
                    size={20}
                    style={{ verticalAlign: 'middle' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="list-view__listEarn" style={{ width: '15%' }}>
            <div className="list-view__earnTitle">Multiplier</div>
            <div className="list-view__earnValue">
              <div style={{ marginRight: '15px' }}>
                {farmItem.multiplier}{' '}
                <AiOutlineQuestionCircle
                  size={20}
                  style={{ verticalAlign: 'middle' }}
                />
              </div>
            </div>
          </div>

          <Row
            className="list-view__listViewItem"
            style={{ width: '8%' }}
            onClick={onHidden}
          >
            {isHidden ? <MdExpandMore size={33} /> : <MdExpandLess size={33} />}
          </Row>
        </div>
      ) : (
        <div className="list-view__listViewItem">
          <StakingModal
            open={isVisible}
            closeModal={onClose}
            lpAddress={
              farmItem.pid < 0
                ? farmItem.lockedAddress[chainId]
                : farmItem.lpAddress[chainId]
            }
            poolId={poolId}
            type={modalType}
            farmItem={farmItem}
            onTransaction={handleTransaction}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div className="list-view__listViewPanelAvatar">
              <Image width="45px" preview={false} src={farmItem.logoImage} />
            </div>
            <div
              className="list-view__listViewPanelField grid-view__PairName"
              style={{ width: '80%', marginLeft: '20px', fontSize: '14px' }}
            >
              {farmItem.lpSymbol}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '10px',
              width: '100%',
            }}
          >
            <div className="list-view__listEarn" style={{ width: '40%' }}>
              <div className="list-view__earnTitle">My Earning</div>
              <div className="list-view__earnValue">{earnings}</div>
            </div>
            {active && (
              <div className="list-view__listEarn" style={{ width: '40%' }}>
                <div className="list-view__earnTitle">APY</div>
                <div className="list-view__earnValue">{apy}%</div>
              </div>
            )}
            <Row
              className="list-view__listViewItem"
              style={{ width: '15%' }}
              onClick={onHidden}
            >
              {isHidden ? (
                <MdExpandMore size={45} />
              ) : (
                <MdExpandLess size={45} />
              )}
            </Row>
          </div>
        </div>
      )}

      {!isHidden && (
        <div className="list-view__listViewContainer">
          <div className="list-view__detailsEarn">
            <div className="list-view__earnTitle">
              Add Liquidity:{' '}
              {farmItem.pid < 0 ? farmItem.rewardSymbol : farmItem.type}
            </div>
          </div>

          <div className="list-view__listViewDetailsItem">
            {active && (
              <div className="list-view__RewardDetailsPanel">
                <div className="list-view__RewardPanelContainer">
                  <div className="list-view__earnTitle">Pending reward</div>
                  <div className="list-view__earnValue">{earnings}</div>
                </div>
                <Button
                  style={{
                    backgroundColor: isAuthenticated ? '#007aff' : '#2C2C2C',
                    borderRadius: '10px',
                    color: '#000000',
                    height: '42px',
                    fontSize: breakpoints.lg ? '18px' : '14px',
                    fontWeight: 'bold',
                    lineHeight: '24px',
                  }}
                  onClick={onHarvest}
                >
                  Harvest
                </Button>
              </div>
            )}

            <div className="list-view__RewardDetailsPanel">
              <div className="list-view__RewardPanelContainer">
                <div className="list-view__earnTitle">Start farming</div>
              </div>

              {farmStatus === 0 && (
                <Button
                  style={{
                    backgroundColor: '#007aff',
                    borderRadius: '10px',
                    color: '#000000',
                    height: '42px',
                    fontSize: breakpoints.lg ? '18px' : '14px',
                    fontWeight: 'bold',
                    lineHeight: '24px',
                  }}
                >
                  Connect wallet
                </Button>
              )}
              {farmStatus === 1 && active && (
                <Button
                  style={{
                    backgroundColor: '#007aff',
                    borderRadius: '10px',
                    color: '#000000',
                    height: '52px',
                    fontSize: breakpoints.lg ? '18px' : '14px',
                    fontWeight: 'bold',
                    lineHeight: '24px',
                  }}
                  onClick={handleEnable}
                >
                  Enable contract
                </Button>
              )}
              {farmStatus === 2 && (
                <div className="list-view__ButtonContainer">
                  {active && (
                    <Button
                      style={{
                        backgroundColor: '#007aff',
                        borderRadius: '10px',
                        color: '#000000',
                        height: '42px',
                        fontSize: breakpoints.lg ? '18px' : '14px',
                        fontWeight: 'bold',
                        lineHeight: '24px',
                        marginBottom: '8px',
                        padding: 0,
                      }}
                      onClick={onStaking}
                    >
                      Start farms
                    </Button>
                  )}
                  {active && (
                    <Button
                      style={{
                        background: '#007aff',
                        borderRadius: '10px',
                        color: '#000000',
                        height: '42px',
                        fontSize: breakpoints.lg ? '18px' : '14px',
                        fontWeight: 'bold',
                        lineHeight: '24px',
                        padding: 0,
                      }}
                      onClick={onWithdraw}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              )}
            </div>
            {active && (
              <div className="list-view__RewardDetailsPanel">
                {!farmItem.isTokenOnly && poolId >= 0 && (
                  <Button className="compound__ant-btn" onClick={onLPLink}>
                    LP link
                  </Button>
                )}
                {farmItem.isTokenOnly && poolId >= 0 && (
                  <Button className="compound__ant-btn" onClick={onCompond}>
                    Compound
                  </Button>
                )}
                {poolId < 0 && (
                  <Button
                    className="disable-compound__ant-btn"
                    onClick={onCompond}
                  >
                    Compound
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListItem;
