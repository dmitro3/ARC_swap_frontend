import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';

import { Farm, FarmLoading, State } from './types';

export const useFarms = (): Farm[] =>
  useSelector((state: State) => state.farms.data);

export const useFarmsLoading = (): FarmLoading =>
  useSelector((state: State) => state.farms.loading);

export const useJungleFarms = (): Farm[] =>
  useSelector((state: State) => state.jungleFarms.data);

export const useJungleFarmsLoading = (): FarmLoading =>
  useSelector((state: State) => state.jungleFarms.loading);

export const useFarmFromPid = (pid: number): Farm => {
  const farm = useSelector((state: State) =>
    state.farms.data.find((f) => f.pid === pid),
  );
  return farm as Farm;
};

export const useFarmFromSymbol = (lpSymbol: string): Farm => {
  const farm = useSelector((state: State) =>
    state.farms.data.find((f) => f.lpSymbol === lpSymbol),
  );
  return farm as Farm;
};

export const useFarmUser = (pid: number) => {
  const farm = useFarmFromPid(pid);

  return {
    allowance: farm.userData
      ? new BigNumber(farm.userData.allowance)
      : new BigNumber(0),
    tokenBalance: farm.userData
      ? new BigNumber(farm.userData.tokenBalance)
      : new BigNumber(0),
    stakedBalance: farm.userData
      ? new BigNumber(farm.userData.stakedBalance)
      : new BigNumber(0),
    earnings: farm.userData
      ? new BigNumber(farm.userData.earnings)
      : new BigNumber(0),
  };
};
