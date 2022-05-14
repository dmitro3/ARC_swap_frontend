export const getCurrencyLogoURL = (coin: string): string | null => {
  switch (coin) {
    case 'ETH':
      return 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png';
    default:
      return null;
  }
};

export const getMarketLogoUrl = (market: string): string | null => {
  switch (market) {
    case 'Opensea':
      return 'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg';
    default:
      return null;
  }
};

export const formatAddress = (address: string): string =>
  `${address.substring(0, 6)}...`;

export default { getCurrencyLogoURL, getMarketLogoUrl, formatAddress };
