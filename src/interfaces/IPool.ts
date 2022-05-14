import { IToken } from './IToken';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPoolToken extends IToken {
  reserve: number;
  hide: boolean;
  hideFromExplore: boolean;
  [key: string]: any;
}

export interface IPool {
  address: string;
  decimals: number;
  value: string;
  label: string;
  symbol: string;
  contractAddress: string;
  exchangeAddress: string;
  tokenAddress: string;
  tokens: IPoolToken[];
  appId: string;
  protocolDisplay: string;
  liquidity: number;
  volume: number;
  volumeChangePercentage: number;
  volliq: number;
  supply: number;
  pricePerToken: number;
  price0: number;
  price1: number;
  isBlocked: boolean;
  hideFromExplore: boolean;
  fee: number;
  feeVolume: number;
  dailyROI: number;
  weeklyROI: number;
  yearlyROI: number;
  key?: number;
}
