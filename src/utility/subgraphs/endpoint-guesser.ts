import { QueryObj } from '../../interfaces/Subgraphs';
import {
  SupportedAPINetworks,
  SupportedAPIPools,
} from '../../interfaces/NetworkPools';
import UniswapQueries from './uniswap-queries';
import PancakeQueries from './pancakeswap-queries';
import SushiswapQueries from './sushiswap-queries';

/**
 * Matches the chainId with its network name.
 * @param chainId
 * @returns
 */
function matchNetworkByChainId(chainId: number): keyof SupportedAPINetworks {
  switch (chainId) {
    case 1:
      return 'ethereum';
    case 56:
      return 'binance-smart-chain';
    case 137:
      return 'polygon';
    case 10:
      return 'optimism';
    default:
      return 'ethereum';
  }
}

/**
 * Guesses the Subgraph endpoint and query builder based on the params.
 * @param protocol the exchange protocol
 * @param network the current network name
 */
export default function endpointGuesser(
  protocol: keyof SupportedAPIPools = 'uniswap-v2',
  chainId: number,
): {
  endpoint: string;
  QueryBuilder: QueryObj;
  guess: string;
} {
  let endpoint: string;
  let QueryBuilder: QueryObj;
  let guess: string;

  const network = matchNetworkByChainId(chainId);

  if (protocol === 'sushiswap') {
    switch (network) {
      case 'polygon':
        endpoint =
          'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange';
        break;
      case 'binance-smart-chain':
        endpoint =
          'https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange';
        break;
      default:
        endpoint = 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange';
    }
    QueryBuilder = SushiswapQueries;
    guess = 'Sushiswap';
  } else if (protocol === 'pancakeswap' && network === 'binance-smart-chain') {
    endpoint = 'https://thegraph.com/hosted-service/subgraph/pancakeswap/pairs';
    QueryBuilder = PancakeQueries;
    guess = 'Pancake';
  } else if (network === 'ethereum') {
    endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
    QueryBuilder = UniswapQueries;
    guess = 'Uniswap';
  } else if (network === 'polygon') {
    endpoint =
      'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange';
    QueryBuilder = SushiswapQueries;
    guess = 'Sushiswap';
  } else {
    throw new Error('SubgraphEndpointGuesser: Invalid protocol and network');
  }

  return {
    endpoint,
    QueryBuilder,
    guess,
  };
}
