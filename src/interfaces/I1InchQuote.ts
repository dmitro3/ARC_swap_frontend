import { IQuoteProtocol } from './IProtocol';
import { IToken } from './IToken';

export interface I1InchQuote {
  fromToken: IToken;
  toToken: IToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocol: IQuoteProtocol[][];
  estimatedGas: number;
  [key: string]: any;
}

export interface I1InchQuoteParams {
  fromToken: IToken;
  toToken: IToken;
  amount: number;
  protocol?: string;
}
