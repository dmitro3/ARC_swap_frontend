/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQuoteProtocol } from './IProtocol';
import { IToken } from './IToken';

export interface I1InchSwap {
  fromToken: IToken;
  toToken: IToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: unknown;
  estimatedGas: number;
  tx: {
    data: string;
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    value: string;
  };
  gas: string;
  [key: string]: any;
}

export interface I1InchSwapParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: number;
  protocols?: IQuoteProtocol[][];
  [key: string]: any;
}

export interface I1InchApprovalParams {
  amount?: string;
  tokenAddress: string;
  infinity?: boolean;
}

export interface I1InchApprovalReponse {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}
