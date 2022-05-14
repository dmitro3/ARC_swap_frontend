/* eslint-disable */
import env from '../../config/global-env';
import IChain from '../../interfaces/IChain';

export default [
  {
    blockExplorerUrls: ['https://etherscan.io'],
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://mainnet.infura.io/v3/e67a2556dede4ff2b521a375a1905f8b',
      'https://api.mycryptoapi.com/eth',
      'https://cloudflare-eth.com',
    ],
  },
  {
    blockExplorerUrls: ['https://bscscan.com'],
    chainId: '0x38',
    chainName: 'BNB Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'wss://bsc-ws-node.nariox.org',
    ],
  },
  {
    blockExplorerUrls: ['https://polygonscan.com'],
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'wss://ws-mainnet.matic.network',
      'https://rpc-mainnet.matic.network',
    ],
  },
  {
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io/'],
  },
  ...(process.env.NODE_ENV === 'development'
    ? [
        {
          blockExplorerUrls: ['https://rinkeby.etherscan.io'],
          chainId: '0x4',
          chainName: 'Rinkeby Testnet',
          nativeCurrency: {
            name: 'Rinkeby Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [
            'https://rinkeby.infura.io/v3/e67a2556dede4ff2b521a375a1905f8b',
          ],
        },
        {
          blockExplorerUrls: [],
          chainId: '0x539',
          chainName: 'Local Network',
          nativeCurrency: { name: 'Ethereum', symbol: 'GETH', decimals: 18 },
          rpcUrls: ['http://192.198.123.101:7545'],
        },
      ]
    : []),
] as IChain[];
