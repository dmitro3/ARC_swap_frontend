/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import farmsConfig from '../../config/constants/farms';
import { Farm, FarmsState } from '../types';
import fetchFarms from './fetchFarms';
import {
  fetchFarmUserAllowances,
  fetchFarmUserEarnings,
  fetchFarmUserNextHarvestUntil,
  fetchFarmUserStakedBalances,
  fetchFarmUserTokenBalances,
} from './fetchFarmuser';

const initialState: FarmsState = {
  data: [...farmsConfig],
  loading: { public: true, user: true },
};

export const fetchFarmsPublicDataAsync = createAsyncThunk<
  any,
  { web3Provider: string; chainId: number }
>('farms/public', async ({ web3Provider, chainId }) => {
  const farms = await fetchFarms(web3Provider, chainId);
  return farms;
});

export const fetchFarmUserDataAsync = createAsyncThunk<
  { arrayOfUserDataObjects: any },
  { web3Provider: string; chainId: number; account: string }
>('farms/user', async ({ web3Provider, chainId, account }) => {
  const userFarmAllowances = await fetchFarmUserAllowances(
    web3Provider,
    chainId,
    account,
  );
  const userFarmTokenBalances = await fetchFarmUserTokenBalances(
    web3Provider,
    chainId,
    account,
  );
  const userStakedBalances = await fetchFarmUserStakedBalances(
    web3Provider,
    chainId,
    account,
  );
  const userFarmEarnings = await fetchFarmUserEarnings(
    web3Provider,
    chainId,
    account,
  );
  const userNextHarvestUntil = await fetchFarmUserNextHarvestUntil(
    web3Provider,
    chainId,
    account,
  );

  const arrayOfUserDataObjects = userFarmAllowances.map(
    (farmAllowance: any, index: number) => ({
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

export const farmsSlice = createSlice({
  name: 'Farms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmsPublicDataAsync.pending, (state) => {
        state.loading.public = true;
      })
      .addCase(fetchFarmsPublicDataAsync.fulfilled, (state, action) => {
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
      .addCase(fetchFarmUserDataAsync.pending, (state) => {
        state.loading.user = true;
      })
      .addCase(fetchFarmUserDataAsync.fulfilled, (state, action) => {
        const { arrayOfUserDataObjects } = action.payload;
        arrayOfUserDataObjects.forEach((userDataEl: any) => {
          const { index } = userDataEl;
          state.data[index] = { ...state.data[index], userData: userDataEl };
        });
        state.loading.user = false;
      });
  },
});

export default farmsSlice.reducer;
