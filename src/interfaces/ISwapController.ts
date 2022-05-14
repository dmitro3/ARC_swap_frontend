import { Dispatch, SetStateAction } from 'react';
import { I1InchQuote } from './I1InchQuote';
import { I1InchSwap } from './I1InchSwap';
import { IProtocol } from './IProtocol';
import { IToken } from './IToken';

interface ISwapController {
  selectedTokens: {
    from: IToken;
    to?: IToken;
  };
  setSelectedTokens: Dispatch<
    SetStateAction<{
      from: IToken;
      to?: IToken;
    }>
  >;
  currentProtocol: IProtocol;
  setCurrentProtocol: Dispatch<SetStateAction<IProtocol>>;
  isTokenSelectVisible: boolean;
  setIsTokenSelectVisible: Dispatch<SetStateAction<boolean>>;
  isProtocolSelectVisible: boolean;
  setIsProtocolSelectVisible: Dispatch<SetStateAction<boolean>>;
  currentSelecting: string;
  setCurrentSelecting: Dispatch<SetStateAction<'from' | 'to'>>;
  fromTokenAmount: string;
  setFromTokenAmount: Dispatch<SetStateAction<string>>;
  toTokenAmount: string;
  setToTokenAmount: Dispatch<SetStateAction<string>>;
  bestTrade?: I1InchQuote;
  setBestTrade: Dispatch<SetStateAction<I1InchQuote | undefined>>;
  alternativeTrade: I1InchQuote | null;
  setAlternativeTrade: Dispatch<SetStateAction<I1InchQuote | null>>;
  swapData?: I1InchSwap;
  setSwapData: Dispatch<SetStateAction<I1InchSwap | undefined>>;
  estimatedGas: number;
  setEstimatedGas: Dispatch<SetStateAction<number>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  balanceInput: number;
  setBalanceInput: Dispatch<SetStateAction<number>>;
  amountPerTargetToken: string;
  setAmountPerTargetToken: Dispatch<SetStateAction<string>>;
  gasPrice: string;
  setGasPrice: Dispatch<SetStateAction<number>>;
  slippage: number;
  setSlippage: Dispatch<SetStateAction<number>>;
  fulfillModalVisible: boolean;
  setFulfillModalVisible: Dispatch<SetStateAction<boolean>>;
  getBestTrade: () => void;
  takeAlternativeTrade: () => void;
  getQuote: () => void;
  handleTokenSelect: (token: IToken) => Promise<void>;
  getProtocolImage: (protocol: IProtocol) => string;
  hasBalance: () => boolean;
  getSwapData: (swapClicked?: boolean) => Promise<boolean>;
  switchTokens: () => void;
  loadGasPriceWeb3: () => void;
  handleQueryString: () => void;
}

export default ISwapController;
