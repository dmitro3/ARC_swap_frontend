export type MultiCallResponse<T> = T | null;
export interface Address {
  1: string;
  4: string;
}
// eslint-disable-next-line no-shadow
export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'BINANCE' = 'Binance', // Pools using native BNB behave differently than pools using a token
  'AUTO' = 'Auto',
}
// eslint-disable-next-line no-shadow
export enum QuoteToken {
  'BNB' = 'BNB',

  'CAKE' = 'CAKE',

  'SYRUP' = 'SYRUP',

  'BUSD' = 'BUSD',

  'TWT' = 'TWT',

  'UST' = 'UST',

  'USDC' = 'USDC',

  'USDT' = 'USDT',
}
export interface FarmConfig {
  pid: number;
  pidv1?: number;
  lpSymbol: string;
  lpAddresses: Address;
  tokenSymbol: string;
  tokenAddresses: Address;
  quoteTokenSymbol: QuoteToken;
  quoteTokenAdresses: Address;
  multiplier?: string;
  isTokenOnly?: boolean;
  isCommunity?: boolean;
  isDualFarm?: boolean;
  risk: number;
  dual?: {
    rewardPerBlock: number;
    earnLabel: string;
    endBlock: number;
  };
  title: string;
  tokenPrice?: number;
  tokenDecimal?: number;
}
