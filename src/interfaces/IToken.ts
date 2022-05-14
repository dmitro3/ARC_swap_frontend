export interface IToken {
  chainId?: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  imported?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface ITokenList {
  tokens: Array<IToken>;
}
