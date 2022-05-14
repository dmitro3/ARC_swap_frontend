import { PoolToken } from './Subgraphs';
import { SupportedAPIPools } from './NetworkPools';

export interface ILiquidityProvision {
  poolContractAddress: string;
  protocol: keyof SupportedAPIPools;
  chainId: number;
  token0: PoolToken;
  token1: PoolToken;
}
