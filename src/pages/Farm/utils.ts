import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import depoMasterChefABI from 'utility/abi/DepoMasterChef.json';
import depoJungleABI from 'utility/abi/DepoJungle.json';
import arcMasterChefABI from 'utility/abi/ArcMasterChef.json';
import arcJungleABI from 'utility/abi/ArcJungle.json';
import {
  getArcMasterChefAddress,
  getDepoMasterChefAddress,
} from 'utility/addressHelpers';

export const getContract = (provider: any, abi: any, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(abi as AbiItem[], address);

  return contract;
};

export const getMasterChefContract = (
  provider: any,
  type: string,
  version: number,
  chainId: number,
) => {
  const abi = type === 'ARC' ? arcMasterChefABI : depoMasterChefABI;
  const address =
    type === 'ARC'
      ? getArcMasterChefAddress(chainId)
      : getDepoMasterChefAddress(chainId, version);

  return getContract(provider, abi, address);
};

export const getJungleContract = (
  provider: any,
  type: string,
  address: string,
) => {
  const abi = type === 'ARC' ? arcJungleABI : depoJungleABI;

  return getContract(provider, abi, address);
};

export default {
  getMasterChefContract,
  getJungleContract,
  getContract,
};
