/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import farmsConfig from '../../config/constants/jungleFarms';
import { Farm, FarmsState } from '../types';
import fetchJungleFarms from './fetchJungleFarms';
import {
  fetchJungleFarmUserAllowances,
  fetchJungleFarmUserEarnings,
  fetchJungleFarmUserNextHarvestUntil,
  fetchJungleFarmUserStakedBalances,
  fetchJungleFarmUserTokenBalances,
} from './fetchJungleFarmuser';

const initialState: FarmsState = {
  data: [...farmsConfig],
  loading: { public: true, user: true },
};

export const fetchJungleFarmsPublicDataAsync = createAsyncThunk<
  any,
  { web3Provider: string; chainId: number }
>('jungleFarms/public', async ({ web3Provider, chainId }) => {
  const farms = await fetchJungleFarms(web3Provider, chainId);
  return farms;
});

export const fetchJungleFarmUserDataAsync = createAsyncThunk<
  { arrayOfUserDataObjects: Array<any> },
  { web3Provider: string; chainId: number; account: string }
>('jungleFarms/user', async ({ web3Provider, chainId, account }) => {
  const userFarmAllowances = await fetchJungleFarmUserAllowances(
    web3Provider,
    chainId,
    account,
  );
  const userFarmTokenBalances = await fetchJungleFarmUserTokenBalances(
    web3Provider,
    chainId,
    account,
  );
  const userStakedBalances = await fetchJungleFarmUserStakedBalances(
    web3Provider,
    chainId,
    account,
  );
  const userFarmEarnings = await fetchJungleFarmUserEarnings(
    web3Provider,
    chainId,
    account,
  );
  const userNextHarvestUntil = await fetchJungleFarmUserNextHarvestUntil(
    web3Provider,
    chainId,
    account,
  );

  const arrayOfUserDataObjects = userFarmAllowances.map(
    (farmAllowance: any, index: string | number) => ({
      index,
      allowance: userFarmAllowances[index],
      tokenBalance: userFarmTokenBalances[index],
      stakedBalance: userStakedBalances[index],
      earnings: userFarmEarnings[index],
      nextHarvestUntil: userNextHarvestUntil[index],
    }),
  );

  return { arrayOfUserDataObjects };
});

export const jungleFarmsSlice = createSlice({
  name: 'JungleFarms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJungleFarmsPublicDataAsync.pending, (state) => {
        state.loading.public = true;
      })
      .addCase(fetchJungleFarmsPublicDataAsync.fulfilled, (state, action) => {
        const liveFarmsData: Farm[] = action.payload;
        state.data = state.data.map((farm) => {
          const liveFarmData = liveFarmsData.find(
            (f) =>
              f.pid === farm.pid &&
              f.version === farm.version &&
              f.type === farm.type,
          );
          return { ...farm, ...liveFarmData };
        });
        state.loading.public = false;
      })
      .addCase(fetchJungleFarmUserDataAsync.pending, (state) => {
        state.loading.user = true;
      })
      .addCase(fetchJungleFarmUserDataAsync.fulfilled, (state, action) => {
        const { arrayOfUserDataObjects } = action.payload;
        arrayOfUserDataObjects.forEach((userDataEl: any) => {
          const { index } = userDataEl;
          state.data[index] = { ...state.data[index], userData: userDataEl };
        });
        state.loading.user = false;
      });
  },
});

export default jungleFarmsSlice.reducer;
