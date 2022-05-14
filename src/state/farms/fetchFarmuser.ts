import BigNumber from 'bignumber.js';

import farmsConfig from 'config/constants/farms';
import depoMasterChefABI from 'utility/abi/DepoMasterChef.json';
import ArcMasterChefABI from 'utility/abi/ArcMasterChef.json';
import erc20ABI from 'utility/abi/standard-abi.eth';
import {
  getDepoMasterChefAddress,
  getArcMasterChefAddress,
} from 'utility/addressHelpers';
import multicall from 'utility/multicall';

export const fetchFarmUserAllowances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.isTokenOnly
      ? farm.tokenAddresses[chainId]
      : farm.lpAddress[chainId];
    return {
      address: lpContractAddress,
      name: 'allowance',
      params: [
        account,
        farm.type === 'ARC'
          ? getArcMasterChefAddress(chainId)
          : getDepoMasterChefAddress(chainId, farm.version),
      ],
    };
  });

  const rawLpAllowances = await multicall(
    erc20ABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedLpAllowances = rawLpAllowances.map((lpBalance: any) =>
    new BigNumber(lpBalance).toJSON(),
  );
  return parsedLpAllowances;
};

export const fetchFarmUserNextHarvestUntil = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => ({
    address:
      farm.type === 'ARC'
        ? getArcMasterChefAddress(chainId)
        : getDepoMasterChefAddress(chainId, farm.version),
    name: 'userInfo',
    params: [farm.pid, account],
  }));
  const rawNextHarvestUntil = await multicall(
    depoMasterChefABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedNextHarvestUntil = rawNextHarvestUntil.map(
    (nextHarvestUntil: any) =>
      // eslint-disable-next-line no-underscore-dangle
      new BigNumber(nextHarvestUntil[3]._hex).toJSON(),
  );
  return parsedNextHarvestUntil;
};

export const fetchFarmUserTokenBalances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.isTokenOnly
      ? farm.tokenAddresses[chainId]
      : farm.lpAddress[chainId];
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    };
  });
  const rawTokenBalances = await multicall(
    erc20ABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance: any) =>
    new BigNumber(tokenBalance).toJSON(),
  );
  return parsedTokenBalances;
};

export const fetchFarmUserStakedBalances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => ({
    address:
      farm.type === 'ARC'
        ? getArcMasterChefAddress(chainId)
        : getDepoMasterChefAddress(chainId, farm.version),
    name: 'userInfo',
    params: [farm.pid, account],
  }));
  const rawStakedBalances = await multicall(
    depoMasterChefABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance: any) =>
    // eslint-disable-next-line no-underscore-dangle
    new BigNumber(stakedBalance[0]._hex).toJSON(),
  );
  return parsedStakedBalances;
};

export const fetchFarmUserEarnings = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const depoRawEarnings = await multicall(
    depoMasterChefABI,
    farmsConfig
      .filter((farm) => farm.type === 'DEPO')
      .map((farm) => ({
        address: getDepoMasterChefAddress(chainId, farm.version),
        name: 'pendingDePo',
        params: [farm.pid, account],
      })),
    web3Provider,
    chainId,
  );
  const arcRawEarnings = await multicall(
    ArcMasterChefABI,
    farmsConfig
      .filter((farm) => farm.type === 'ARC')
      .map((farm) => ({
        address: getArcMasterChefAddress(chainId),
        name: 'pendingArc',
        params: [farm.pid, account],
      })),
    web3Provider,
    chainId,
  );
  const rawEarnings = [...depoRawEarnings, ...arcRawEarnings];
  const parsedEarnings = rawEarnings.map((earnings: any) =>
    new BigNumber(earnings).toJSON(),
  );
  return parsedEarnings;
};
