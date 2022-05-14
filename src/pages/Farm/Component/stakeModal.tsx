import { Button, Grid } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import FarmModal from 'components/FarmModal/FarmModal';
import { AuthContext } from 'contexts/AuthProvider';
import UniswapV2LpABI from 'utility/abi/uniswapv2-lp-abi';
import { getAddress } from 'utility/addressHelpers';
import {
  getContract,
  getJungleContract,
  getMasterChefContract,
} from '../utils';

const StakingModal = ({
  open,
  closeModal,
  lpAddress,
  poolId,
  type,
  farmItem,
  onTransaction,
}: any) => {
  const { user, provider, web3Provider, chainId } = useContext(AuthContext);
  const [depositAmount, setAmount] = useState('');
  const [lpName, setName] = useState('');
  const breakpoints = Grid.useBreakpoint();
  const { version, type: farmType } = farmItem;
  const fetchContract = async () => {
    if (web3Provider) {
      const web3 = new Web3(provider || (window.ethereum as any));
      const lpContract = new web3.eth.Contract(
        UniswapV2LpABI.abi as AbiItem[],
        lpAddress,
      );
      const symbol = await lpContract.methods.symbol().call();
      setName(symbol);
    }
  };
  const fetchBalance = async () => {
    if (web3Provider && chainId) {
      const lockedDecimal = parseInt(farmItem.lockedDecimal, 10);
      const ethProvider = provider || (window.ethereum as any);
      const lpContract = getContract(
        ethProvider,
        UniswapV2LpABI.abi,
        lpAddress,
      );
      const masterContract =
        poolId < 0
          ? getJungleContract(
              ethProvider,
              farmType,
              getAddress(farmItem.contractAddress, chainId),
            )
          : getMasterChefContract(ethProvider, farmType, version, chainId);
      let poolInfo;
      if (poolId < 0) {
        poolInfo = await masterContract.methods
          .userInfo(user?.settings?.defaultWallet)
          .call();
      } else {
        poolInfo = await masterContract.methods
          .userInfo(poolId, user?.settings?.defaultWallet)
          .call();
      }
      let stakedBalance;
      if (farmItem.pid < 0) {
        stakedBalance = new BigNumber(poolInfo.amount)
          .dividedBy(new BigNumber(10).pow(new BigNumber(lockedDecimal)))
          .toString();
      } else {
        stakedBalance = new BigNumber(poolInfo.amount)
          .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
          .toString();
      }
      const balance = await lpContract.methods
        .balanceOf(user?.settings?.defaultWallet)
        .call();
      let maxBalance;
      if (farmItem.pid < 0) {
        maxBalance = new BigNumber(balance)
          .dividedBy(new BigNumber(10).pow(new BigNumber(lockedDecimal)))
          .toString();
      } else {
        maxBalance = new BigNumber(balance)
          .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
          .toString();
      }
      if (type === 1) {
        setAmount(maxBalance);
      } else if (type === 2) {
        setAmount(stakedBalance);
      }
    }
  };
  const inpuChange = (e: any) => {
    setAmount(e.target.value);
  };
  const onDeposit = async () => {
    if ((window.ethereum || provider) && chainId) {
      const lockedDecimal = parseInt(farmItem.lockedDecimal, 10);
      const ethProvider = provider || (window.ethereum as any);
      const masterChef =
        poolId < 0
          ? getJungleContract(
              ethProvider,
              farmType,
              getAddress(farmItem.contractAddress, chainId),
            )
          : getMasterChefContract(ethProvider, farmType, version, chainId);
      if (user && user.settings?.defaultWallet && web3Provider) {
        let amount;
        if (poolId < 0) {
          amount = new BigNumber(
            new BigNumber(10)
              .pow(new BigNumber(lockedDecimal))
              .times(new BigNumber(depositAmount)),
          ).toString(16);
        } else {
          amount = new BigNumber(
            new BigNumber(10)
              .pow(new BigNumber(18))
              .times(new BigNumber(depositAmount)),
          ).toString(16);
        }
        const depoAmount = ('0x' as String) + amount;
        closeModal();
        const account = user.settings?.defaultWallet;
        if (poolId < 0) {
          const receipt = await masterChef.methods
            .deposit(depoAmount)
            .send({ from: account })
            .then((response: any) =>
              onTransaction({ web3Provider, chainId, account }),
            );
        } else {
          const receipt = await masterChef.methods
            .deposit(poolId, depoAmount)
            .send({ from: account })
            .then((response: any) =>
              onTransaction({ web3Provider, chainId, account }),
            );
        }
      }
    }
  };
  const onWithdraw = async () => {
    if ((window.ethereum || provider) && chainId) {
      const lockedDecimal = parseInt(farmItem.lockedDecimal, 10);
      const ethProvider = provider || (window.ethereum as any);
      const masterChef =
        poolId < 0
          ? getJungleContract(
              ethProvider,
              farmType,
              getAddress(farmItem.contractAddress, chainId),
            )
          : getMasterChefContract(ethProvider, farmType, version, chainId);
      if (user && user.settings?.defaultWallet && web3Provider) {
        let amount;
        if (poolId < 0) {
          amount = new BigNumber(
            new BigNumber(10)
              .pow(new BigNumber(lockedDecimal))
              .times(new BigNumber(depositAmount)),
          ).toString(16);
        } else {
          amount = new BigNumber(
            new BigNumber(10)
              .pow(new BigNumber(18))
              .times(new BigNumber(depositAmount)),
          ).toString(16);
        }
        const depoAmount = ('0x' as String) + amount;
        closeModal();

        const account = user.settings?.defaultWallet;
        if (poolId < 0) {
          const receipt = await masterChef.methods
            .withdraw(depoAmount)
            .send({ from: account })
            .then((response: any) =>
              onTransaction({ web3Provider, chainId, account }),
            );
        } else {
          const receipt = await masterChef.methods
            .withdraw(poolId, depoAmount)
            .send({ from: user.settings?.defaultWallet })
            .on('confirmation', (confirm: any) => {
              console.log(confirm);
            })
            .then((response: any) =>
              onTransaction({ web3Provider, chainId, account }),
            );
        }
      }
    }
  };
  useEffect(() => {
    fetchContract();
  }, [web3Provider, user]);
  return (
    <FarmModal open={open}>
      {!breakpoints.lg && (
        <MdClose
          style={{
            position: 'fixed',
            right: '0',
            top: '0',
            color: 'white',
            fontSize: '2rem',
          }}
          onClick={closeModal}
        />
      )}
      <div
        className={`${breakpoints.lg ? 'bg-lightgrey' : 'bg-black'} rounded ${
          breakpoints.lg ? 'p-5' : 'p-1'
        } stake-modal__ModalContainer`}
      >
        <h4
          style={{
            color: '#007aff',
          }}
        >
          {type === 1 ? 'Stake tokens' : 'Withdraw tokens'}
        </h4>
        <div className="stake-modal__InputBackContainer">
          <div className="stake-modal__InputContainer">
            <div className="stake-modal__Balance">
              <div>Stake</div>
              <div>Balance</div>
            </div>
            <div className="stake-modal__InputFieldContainer">
              <input
                className="stake-modal__Input"
                type="text"
                id="fname"
                name="fname"
                value={depositAmount}
                onChange={inpuChange}
              />
              <Button
                onClick={() => fetchBalance()}
                className="maxBtn__ant-btn"
              >
                Max
              </Button>
              <div className="stake-modal__InputLPName"> {lpName}</div>
            </div>
          </div>
        </div>
        <div className="stake-modal__ButtonContainer">
          <Button className="cancelBtn__ant-btn" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            style={{
              background: '#007aff',
              width: '48%',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={type === 1 ? onDeposit : onWithdraw}
          >
            Confirm
          </Button>
        </div>
      </div>
    </FarmModal>
  );
};

export default StakingModal;
