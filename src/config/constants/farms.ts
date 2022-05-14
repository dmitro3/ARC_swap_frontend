import Depo from 'assets/tokens/depo-token.png';
import DepoWeth from 'assets/tokens/depo-weth.png';
import Arc from 'assets/tokens/arc-token.png';
import ArcWeth from 'assets/tokens/arc-weth.png';
import { PoolCategory } from 'utility/types';

const pools: any[] = [
  {
    type: 'DEPO',
    active: false,
    version: 1,
    pid: 0,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'DEPO-WETH',
    lpAddress: {
      1: '0xae8b9d75a75a8b7c5cc5deb51fa916ac49147dad',
      4: '0x4E99615101cCBB83A462dC4DE2bc1362EF1365e5',
    },
    tokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0x8B22F85d0c844Cf793690F6D9DFE9F11Ddb35449',
    },
    quoteTokenAddresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      4: '0xc778417e063141139fce010982780140aa0cd5ab',
    },
    quoteTokenPrice: 4400,
    logoImage: DepoWeth,
    isTokenOnly: false,
    depositFee: '0.3%',
  },
  {
    type: 'DEPO',
    active: false,
    version: 1,
    pid: 1,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'DEPO',
    lpAddress: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0x8B22F85d0c844Cf793690F6D9DFE9F11Ddb35449',
    },
    tokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0x8B22F85d0c844Cf793690F6D9DFE9F11Ddb35449',
    },
    quoteTokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0xc778417e063141139fce010982780140aa0cd5ab',
    },
    logoImage: Depo,
    isTokenOnly: true,
    depositFee: '0.45%',
  },
  {
    type: 'DEPO',
    active: false,
    version: 2,
    pid: 0,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'DEPO-WETH',
    lpAddress: {
      1: '0xae8b9d75a75a8b7c5cc5deb51fa916ac49147dad',
      4: '0x63416D804035196AF540B129797e1Ec929D4b001',
    },
    tokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0xd597953a8bC09cE02B5652F0A8a774807601a7bD',
    },
    quoteTokenAddresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      4: '0xeadf072239a0959e5877beFb580C4A4f1d2331dD',
    },
    quoteTokenPrice: 4400,
    logoImage: DepoWeth,
    isTokenOnly: false,
    depositFee: '0.3%',
  },
  {
    type: 'DEPO',
    active: false,
    version: 2,
    pid: 1,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'DEPO',
    lpAddress: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0xd597953a8bC09cE02B5652F0A8a774807601a7bD',
    },
    tokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0xd597953a8bC09cE02B5652F0A8a774807601a7bD',
    },
    quoteTokenAddresses: {
      1: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
      4: '0xd597953a8bC09cE02B5652F0A8a774807601a7bD',
    },
    logoImage: Depo,
    isTokenOnly: true,
    depositFee: '0.45%',
  },
  // ARC Farms - Active
  {
    type: 'ARC',
    active: true,
    version: 1,
    pid: 0,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'ARC-WETH',
    lpAddress: {
      1: '0x47082a75bc16313ef92cfaca1feb885659c3c9b5',
      4: '0x63416D804035196AF540B129797e1Ec929D4b001',
    },
    tokenAddresses: {
      1: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2',
      4: '',
    },
    quoteTokenAddresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      4: '0xeadf072239a0959e5877beFb580C4A4f1d2331dD',
    },
    quoteTokenPrice: 4400,
    logoImage: ArcWeth,
    isTokenOnly: false,
    depositFee: '0.3%',
  },
  {
    type: 'ARC',
    active: true,
    version: 1,
    pid: 1,
    poolCategory: PoolCategory.CORE,
    sortOrder: 1,
    isFinished: false,
    lpSymbol: 'ARC',
    lpAddress: {
      1: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2',
      4: '',
    },
    tokenAddresses: {
      1: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2',
      4: '',
    },
    quoteTokenAddresses: {
      1: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2',
      4: '',
    },
    logoImage: Arc,
    isTokenOnly: true,
    depositFee: '0.45%',
  },
];
export default pools;
