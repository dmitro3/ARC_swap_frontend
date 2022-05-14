export const chainConfig: Record<
  number,
  { providers: string[]; subgraph?: string; transactionManagerAddress?: string }
> = {
  '1': {
    providers: [
      'https://mainnet.infura.io/v3/e67a2556dede4ff2b521a375a1905f8b',
    ],
  },
  '56': {
    providers: [
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
  '137': {
    providers: [
      'https://polygon-rpc.com/',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'wss://ws-mainnet.matic.network',
      'https://rpc-mainnet.matic.network',
    ],
  },
};

// arrays of "swap pools"
export type SwapConfig = {
  index: number;
  name: string;
  assets: { [chainId: number]: string };
};
export const swapConfig: SwapConfig[] = [
  {
    index: 0,
    name: 'ETH',
    assets: {
      '1': '0x0000000000000000000000000000000000000000',
      '56': '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      '137': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
  },
  {
    index: 1,
    name: 'USDT',
    assets: {
      '1': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '56': '0x55d398326f99059fF775485246999027B3197955',
      '137': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
  },
  {
    index: 2,
    name: 'USDC',
    assets: {
      '1': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '56': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      '137': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
  },
];
