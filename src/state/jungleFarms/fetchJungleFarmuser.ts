import BigNumber from 'bignumber.js';

import farmsConfig from '../../config/constants/jungleFarms';
import masterchefABI from '../../utility/abi/ArcJungle.json';
import erc20ABI from '../../utility/abi/standard-abi.eth';
import { getAddress } from '../../utility/addressHelpers';
import multicall from '../../utility/multicall';

export const fetchJungleFarmUserAllowances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.lockedAddress[chainId];
    return {
      address: lpContractAddress,
      name: 'allowance',
      params: [account, farm.contractAddress[chainId]],
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

export const fetchJungleFarmUserNextHarvestUntil = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const masterAddress = farm.contractAddress[chainId];
    return {
      address: masterAddress,
      name: 'userInfo',
      params: [account],
    };
  });
  const rawNextHarvestUntil = await multicall(
    masterchefABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedNextHarvestUntil = rawNextHarvestUntil.map(
    (nextHarvestUntil: any) =>
      // eslint-disable-next-line no-underscore-dangle
      new BigNumber(nextHarvestUntil._hex).toJSON(),
  );
  return parsedNextHarvestUntil;
};

export const fetchJungleFarmUserTokenBalances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.lockedAddress[chainId];
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

export const fetchJungleFarmUserStakedBalances = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const masterAddress = farm.contractAddress[chainId];
    return {
      address: masterAddress,
      name: 'userInfo',
      params: [account],
    };
  });
  const rawStakedBalances = await multicall(
    masterchefABI,
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

export const fetchJungleFarmUserEarnings = async (
  web3Provider: string,
  chainId: number,
  account: string,
) => {
  const calls = farmsConfig.map((farm) => {
    const masterAddress = getAddress(farm.contractAddress, chainId);
    return {
      address: masterAddress,
      name: 'pendingReward',
      params: [account],
    };
  });
  const rawEarnings = await multicall(
    masterchefABI,
    calls,
    web3Provider,
    chainId,
  );
  const parsedEarnings = rawEarnings.map((earnings: any) =>
    new BigNumber(earnings).toJSON(),
  );
  return parsedEarnings;
};
