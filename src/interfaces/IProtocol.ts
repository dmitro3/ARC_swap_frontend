export interface IProtocol {
  id: string;
  title: string;
  img: string;
  [key: string]: string;
}

export interface IProtocolList {
  protocols: Array<IProtocol>;
}

export interface IProtocolString {
  protocols: Array<string>;
}

export interface IQuoteProtocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  [key: string]: string | number;
}
