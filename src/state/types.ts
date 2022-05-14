import BigNumber from 'bignumber.js';

import { FarmConfig } from '../utility/types';

export interface FarmLoading {
  public: boolean;
  user: boolean;
}

export interface Farm extends FarmConfig {
  version: number;
  active: boolean;
  type: string;
  tokenAmount?: BigNumber;
  lpTotalInQuoteToken?: BigNumber;
  lpTotalSupply?: BigNumber;
  lpBalance?: BigNumber;
  tokenPriceVsQuote?: BigNumber;
  poolWeight?: number;
  depositFeeBP?: number;
  croxPerBlock?: number;
  poolAddress?: any;
  userData?: {
    allowance: BigNumber;
    tokenBalance: BigNumber;
    stakedBalance: BigNumber;
    prevStakedBalance: BigNumber;
    earnings: BigNumber;
    nextHarvestUntil: number;
  };
}

export interface FarmsState {
  data: Farm[];
  loading: FarmLoading;
}

export interface State {
  farms: FarmsState;
  jungleFarms: FarmsState;
}
