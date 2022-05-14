import { ethers } from 'ethers';
import ethereumLogoUrl from 'assets/tokens/eth.png';

export const getTokenLogoUrl = (address?: string): string => {
  if (address === ethers.constants.AddressZero) {
    return ethereumLogoUrl;
  }
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
};

export default { getTokenLogoUrl };
