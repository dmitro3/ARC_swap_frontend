import { SupportedAPIPools } from './NetworkPools';

export interface ILiquidityNetwork {
  chainId: string;
  factoryAddr: string;
  routerAddr: string;
}

export interface INetworkLiquidityProtocol {
  name: string;
  parsedName: keyof SupportedAPIPools;
  networks: ILiquidityNetwork[];
  logoURI: string;
}
