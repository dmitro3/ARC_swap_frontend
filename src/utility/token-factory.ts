import { PoolToken } from '../interfaces/Subgraphs';

export default function tokenFactory(contractAddr: string): PoolToken {
  return {
    id: contractAddr,
    decimals: '18',
    name: 'LPToken',
    symbol: 'LPToken',
    totalLiquidity: '',
    totalSupply: '',
    tradeVolumeUSD: '',
  };
}
