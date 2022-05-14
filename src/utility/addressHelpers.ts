import addresses from '../config/constants/contracts';

export const getAddress = (address: any, chainId: number): string =>
  address[chainId];

export const getDepoMasterChefAddress = (chainId: number, version: number) =>
  getAddress(
    version === 1 ? addresses.masterChef : addresses.masterChefV2,
    chainId,
  );

export const getArcMasterChefAddress = (chainId: number) =>
  getAddress(addresses.arcMasterChef, chainId);

export const getMulticallAddress = (chainId: number) =>
  getAddress(addresses.multiCall, chainId);

export const shortenAddress = (address: string): string =>
  `${address.substr(0, 6)}...${address.substr(
    address.length - 4,
    address.length,
  )}`;
