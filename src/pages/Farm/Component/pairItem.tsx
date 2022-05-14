import { Button, Image, Row } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch } from 'state';
import { fetchFarmUserDataAsync } from 'state/farms';
import { fetchJungleFarmUserDataAsync } from 'state/jungleFarms';

import coreImg from 'assets/core.svg';
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
const PairItem: React.FC<{
  farmItem: any;
  lpAddress: string;
  poolId: number;
  arcPrice: number;
}> = ({ farmItem, lpAddress, poolId, arcPrice }) => {
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

  const { type, active, version, poolTokenPrice } = farmItem;

  const dispatch = useAppDispatch();

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

  const onHidden = () => setHidden(!isHidden);

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

  useEffect(() => {
    fetchPoolInfo();
  }, [web3Provider, farmItem, farmStatus, user, isAuthenticated]);

  if (!chainId) return null;

  return (
    <div className="grid-view__PoolContainer stake-modal__ant-modal-mask">
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
      <ModalAlert
        open={warningModalOpen}
        message='This Farm option is inactive and no longer paying rewards. Live farms can be found in the "Active" tab. Please only click "Enable Contract" below if you need to withdraw funds from this inactive Farm.'
        onCancel={() => setWarningModalOpen(false)}
        onOk={onEnable}
      />
      <div className="grid-view__ItemContainer">
        <div
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <div className="grid-view__ImagePair">
            <Image
              className="grid-view__ItemImage"
              width="90px"
              height="90px"
              preview={false}
              src={farmItem.logoImage}
            />
            <div className="grid-view__PairTitle">
              <div className="grid-view__PairName">
                {`${farmItem.lpSymbol}${
                  active ? '' : ` ${version.toFixed(1)} Inactive`
                }`}
              </div>
              <div className="grid-view__PairStatus">
                {farmItem.lpSymbol === 'DEPO-WETH' && farmItem.active ? (
                  <>Rewards end 22 March</>
                ) : (
                  <div className="grid-view__PairConfig">
                    <img className="core-image-filter" src={coreImg} alt="" />
                    <div style={{ marginLeft: '15px' }}>Core</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid-view__ItemAPR">
            {active && (
              <div className="grid-view__ItemValue">
                <div className="grid-view__ValueTitle">APY:</div>
                <div className="grid-view__ValueText">{apy} %</div>
              </div>
            )}
            <div className="grid-view__ItemValue">
              <div className="grid-view__ValueTitle">Earn:</div>
              <div className="grid-view__ValueText">
                <div style={{ marginRight: '0.3rem' }}>
                  {farmItem.pid < 0 ? farmItem.rewardSymbol : farmItem.type}
                </div>
              </div>
            </div>
            {active && (
              <div className="grid-view__ItemValue">
                <div className="grid-view__ValueTitle">Deposit fee:</div>
                <div className="grid-view__ValueText">
                  <div style={{ marginRight: '0.3rem' }}>{depositFee}</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto' }}>
            {active && (
              <div className="grid-view__EarnedPanel">
                <div className="grid-view__EarnedT">
                  <div className="grid-view__EarnedTitle">
                    {farmItem.pid < 0 ? farmItem.rewardSymbol : farmItem.type}{' '}
                    Earned
                  </div>
                  <div className="grid-view__EarnedValue">
                    {(+earnings).toFixed(2)} ($
                    {(+earnings * arcPrice).toFixed(2)})
                  </div>
                </div>
                <button
                  type="button"
                  className="grid-view__Harvest"
                  onClick={onHarvest}
                  disabled={!isAuthenticated}
                >
                  Harvest
                </button>
              </div>
            )}
            <div className="grid-view__LPPanel">
              <p className="grid-view__EarnedTitle">{`Staked amount: ${staked} ($${(
                +staked * poolTokenPrice
              ).toFixed(2)})`}</p>
              {farmStatus === 0 && (
                <Button className="grid-view__PairButton">
                  Connect wallet
                </Button>
              )}
              {farmStatus === 1 && active && (
                <Button
                  className="grid-view__PairButton"
                  onClick={handleEnable}
                >
                  Enable contract
                </Button>
              )}
              {farmStatus === 2 && (
                <div className="grid-view__ButtonContainer">
                  {active && (
                    <>
                      <Button
                        className="grid-view__PairButton"
                        style={{
                          width: '45%',
                          padding: 0,
                        }}
                        onClick={onStaking}
                      >
                        Start farms
                      </Button>
                      <Button
                        className="grid-view__PairButton"
                        style={{
                          width: active ? '45%' : '100%',
                          padding: 0,
                        }}
                        onClick={onWithdraw}
                      >
                        Withdraw
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            {active && (
              <div className="grid-view__CompoundPanel">
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
      </div>
      {/* {active && (
        <div className="grid-view__ItemDetails">
          <div className="farm__divider" />
          <div className="grid-view__details">
            <div className="grid-view__btn-details">
              {isHidden ? (
                <Row
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={onHidden}
                >
                  Details <MdExpandMore style={{ marginLeft: '2px' }} />
                </Row>
              ) : (
                <div style={{ width: '100%' }}>
                  <Row
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={onHidden}
                  >
                    Hide <MdExpandLess style={{ marginLeft: '2px' }} />
                  </Row>
                  <div className="grid-view__ItemValue">
                    <div className="grid-view__ValueTitle">Total staked:</div>
                    <div
                      className="grid-view__ValueText"
                      style={{ marginBottom: '-15px' }}
                    >
                      <div style={{ marginRight: '0.3rem' }}>
                        $
                        {totalLiquidity.replace(
                          /(\d)(?=(\d{3})+(?!\d))/g,
                          '$1,',
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PairItem;
