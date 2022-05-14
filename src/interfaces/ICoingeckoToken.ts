interface ICoingeckoToken {
  symbol: string;
  name: string;
  image: {
    thumb?: string;
    small?: string;
    large?: string;
  };
  // eslint-disable-next-line camelcase
  contract_address: string;
}

export default ICoingeckoToken;
