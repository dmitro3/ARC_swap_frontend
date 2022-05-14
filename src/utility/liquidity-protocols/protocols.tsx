import { INetworkLiquidityProtocol } from '../../interfaces/NetworkLiquidityProtocol';

export default [
  // {
  //   name: 'Pancake',
  //   parsedName: 'pancakeswap',
  //   networks: [
  //     {
  //       chainId: '0x38',
  //       factoryAddr: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  //       routerAddr: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  //     },
  //   ],
  //   logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png',
  // },
  {
    name: 'Uniswap V2',
    parsedName: 'uniswap-v2',
    networks: [
      {
        chainId: '0x1',
        factoryAddr: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        routerAddr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      },
      {
        chainId: '0x4',
        factoryAddr: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        routerAddr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      },
      {
        chainId: '0x539',
        factoryAddr: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        routerAddr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      },
    ],
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png',
  },
  {
    name: 'Sushi Swap',
    parsedName: 'sushiswap',
    networks: [
      {
        chainId: '0x1',
        factoryAddr: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        routerAddr: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
      },
      {
        chainId: '0x38',
        factoryAddr: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        routerAddr: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      },
      {
        chainId: '0x89',
        factoryAddr: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
        routerAddr: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      },
      {
        chainId: '0x539',
        factoryAddr: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        routerAddr: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
      },
    ],
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6758.png',
  },
] as INetworkLiquidityProtocol[];
