import { useContext, useState } from 'react';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import Notification from '../../../components/Notification/Notification';
import { AuthContext } from '../../../contexts/AuthProvider';
import { I1InchQuote } from '../../../interfaces/I1InchQuote';
import { I1InchSwap, I1InchSwapParams } from '../../../interfaces/I1InchSwap';
import { IProtocol } from '../../../interfaces/IProtocol';
import ISwapController from '../../../interfaces/ISwapController';
import { IToken } from '../../../interfaces/IToken';
import { OneInchService } from '../../../services/OneInchService';
import Web3ClientService from '../../../services/Web3ClientService';
import DepoLogo from '../../../assets/logoResponsive.svg';
import parseQueryString from '../../../utility/query-string';

function useSwap(): ISwapController {
  const [selectedTokens, setSelectedTokens] = useState<{
    from: IToken;
    to?: IToken;
  }>({
    from: {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      logoURI:
        'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    },
  });

  const {
    protocols,
    user,
    web3Provider,
    defaultCurrency,
    defaultCurrencyAddr,
    balances,
    tokens,
    provider,
  } = useContext(AuthContext);

  const [currentProtocol, setCurrentProtocol] = useState<IProtocol>({
    title: 'Best trade',
    id: '',
    img: DepoLogo,
  });

  const [isTokenSelectVisible, setIsTokenSelectVisible] = useState(false);
  const [isProtocolSelectVisible, setIsProtocolSelectVisible] = useState(false);
  const [currentSelecting, setCurrentSelecting] = useState<'from' | 'to'>(
    'from',
  );
  const [fromTokenAmount, setFromTokenAmount] = useState<string>('');
  const [toTokenAmount, setToTokenAmount] = useState<string>('0');
  const [bestTrade, setBestTrade] = useState<I1InchQuote>();
  const [alternativeTrade, setAlternativeTrade] = useState<I1InchQuote | null>(
    null,
  );
  const [swapData, setSwapData] = useState<I1InchSwap>();
  const [estimatedGas, setEstimatedGas] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [balanceInput, setBalanceInput] = useState(0);
  const [amountPerTargetToken, setAmountPerTargetToken] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<any>('0');
  const [slippage, setSlippage] = useState<number>(1);
  const [fulfillModalVisible, setFulfillModalVisible] = useState(false);

  const handleQueryString = () => {
    const queryObj = parseQueryString();
    if (queryObj['inputToken']) {
      const queriedToken = tokens.find(
        (token) => token.symbol === queryObj.inputToken,
      );
      if (queriedToken) {
        setSelectedTokens({
          ...selectedTokens,
          from: queriedToken,
        });
      }
    }

    if (queryObj['inputValue']) {
      setFromTokenAmount(queryObj.inputValue);
    }
  };

  /**
   * Force best trade method to check for swap ops
   */
  const getBestTrade = async (): Promise<void> => {
    try {
      if (selectedTokens.to) {
        setToTokenAmount('0');
        setLoading(true);
        const result = await OneInchService.getQuote({
          amount: +fromTokenAmount,
          fromToken: selectedTokens.from,
          toToken: selectedTokens.to,
          protocol: undefined,
        });
        setAlternativeTrade(result);
      }
    } catch (error) {
      const err = error as Error;
      Notification({
        type: 'error',
        title: 'Error',
        message: err.message ?? 'Unable to get quotation!',
      });
      setAlternativeTrade(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Use the best trade option
   */
  const takeAlternativeTrade = (): void => {
    if (alternativeTrade && selectedTokens.to) {
      setToTokenAmount(
        String(
          +alternativeTrade.toTokenAmount /
            10 ** (selectedTokens.to.decimals - 1),
        ),
      );
      setCurrentProtocol({ title: 'Best trade', img: DepoLogo, id: '' });
    }
  };

  /**
   * Fetches the quotation at 1Inch api
   * @param isRetry if is a retrial/refetch
   */
  const getQuote = async (isRetry = false): Promise<void> => {
    const minimumAmount = 1 / 10 ** selectedTokens.from.decimals;
    if (+fromTokenAmount >= minimumAmount) {
      try {
        if (selectedTokens.to) {
          setAlternativeTrade(null);
          setLoading(true);
          const currentFromTokenAmount = fromTokenAmount;
          const result = await OneInchService.getQuote({
            amount: +currentFromTokenAmount,
            fromToken: selectedTokens.from,
            toToken: selectedTokens.to,
            protocol: currentProtocol?.id,
          });
          setEstimatedGas(result.estimatedGas);
          const amount = new BigNumber(result.toTokenAmount)
            .dividedBy(new BigNumber(`1e${selectedTokens.to.decimals}`))
            .toString();
          setToTokenAmount(amount);
          setBestTrade(result);
          // Set the input value when result is done to avoid zero/1 values
          setFromTokenAmount(currentFromTokenAmount);
        }
      } catch (error) {
        // As the API has some troubles with 500 errors
        // sometimes the error is only a random error
        // so we redo the quotation to check if it really
        // was an error.
        if (!isRetry) {
          getQuote(true);
        } else {
          // If we have an error, it could be because there's no trade for the
          // selected protocol, so we try the best trade
          getBestTrade();
        }
      } finally {
        setLoading(false);
      }
    } else {
      Notification({
        type: 'error',
        message: 'The input token amount is too low.',
      });
    }
  };

  const handleTokenSelect = async (token: IToken): Promise<void> => {
    setSelectedTokens({
      ...selectedTokens,
      [currentSelecting]: token,
    });
  };

  const getProtocolImage = (protocol: IProtocol) => {
    if (protocol?.name) {
      if (currentProtocol) {
        return currentProtocol.img;
      }
      const item = protocols.find(
        (_item: IProtocol) => _item.id === protocol.name,
      );
      if (item) return item.img;
    }
    return '';
  };

  const hasBalance = (): boolean => {
    if (swapData) {
      const fee = OneInchService.getFee(
        swapData.tx.gas,
        swapData.tx.gasPrice,
        18,
      );
      if (selectedTokens.from.symbol !== defaultCurrency) {
        return (
          !(+fromTokenAmount > balanceInput) &&
          +fee < balances[defaultCurrencyAddr]
        );
      }
      return !(+fromTokenAmount > balanceInput - +fee);
    }
    if (
      (+fromTokenAmount > +balanceInput * 0.99 &&
        selectedTokens.from.symbol === defaultCurrency) ||
      +fromTokenAmount > +balanceInput
    )
      return false;
    return true;
  };

  const requestSwapData = async () => {
    if (user && bestTrade && user.settings?.defaultWallet) {
      const amount = bestTrade.fromTokenAmount;
      const obj: I1InchSwapParams = {
        amount,
        fromAddress: user.settings.defaultWallet,
        fromTokenAddress: bestTrade.fromToken.address,
        toTokenAddress: bestTrade.toToken.address,
        protocols: bestTrade.protocol,
        slippage,
      };
      try {
        const swap = await OneInchService.getSwap(obj);
        setSwapData(swap);
      } catch (error) {
        const err = error as Error;
        let message = '';
        if (err.message.includes('allowance')) throw error;
        if (err.message.includes('miner fee')) message = err.message;
        else if (err.message.includes('cannot estimate'))
          message = 'Cannot estimate. Input token amount is too low.';
        else if (err.message.includes('balance'))
          message = 'Insufficient balance + fee';
        else
          message = `Insufficient funds for gas, ${err.message
            .replace('have', ' , Have : ')
            .replace('want', ' , Required : ')
            .slice(98)}`;

        Notification({
          type: 'error',
          message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getSwapData = async (swapClicked = false): Promise<boolean> => {
    if (bestTrade) {
      if (user?.settings?.defaultWallet && (window.ethereum || provider)) {
        try {
          setLoading(true);
          await requestSwapData();
        } catch (noAllowanceError) {
          const allowanceError = noAllowanceError as Error;
          if (allowanceError.message.match(/allowance/gi)) {
            try {
              if (
                !OneInchService.isNative(bestTrade.fromToken.address) &&
                swapClicked
              ) {
                const allowance = await OneInchService.approveCalldataV4({
                  tokenAddress: bestTrade.fromToken.address,
                  infinity: true,
                });
                const web3 = new Web3((window.ethereum as any) || provider);
                const gasLimit = await web3.eth.estimateGas({
                  ...allowance,
                  from: user.settings.defaultWallet,
                });
                await web3.eth
                  .sendTransaction({
                    ...allowance,
                    gas: gasLimit,
                    from: user.settings.defaultWallet,
                  })
                  .once('confirmation', () => {
                    requestSwapData();
                  });
              } else requestSwapData();
            } catch (error) {
              const err = error as any;
              if (err.code) {
                Notification({
                  type: 'error',
                  title: 'Error',
                  message: 'Cancelled by the user.',
                });
              } else if (err.message.includes('balance')) {
                Notification({
                  type: 'error',
                  title: 'Error',
                  message:
                    'Insufficient balance + gas price to complete transaction.',
                });
              }
              return false;
            }
          }
        }
      } else {
        Notification({
          type: 'error',
          title: 'Error',
          message: 'Please connect a wallet to proceed.',
        });
        return false;
      }
    }
    return true;
  };

  /**
   * Switch token0 with token1
   */
  const switchTokens = (): void => {
    if (selectedTokens.to)
      setSelectedTokens({
        from: selectedTokens.to,
        to: selectedTokens.from,
      });
    else
      Notification({
        type: 'warning',
        message: 'You need to select a target token before switching.',
      });
  };

  /**
   * Fetches the gas price in the network
   */
  const loadGasPriceWeb3 = async (): Promise<void> => {
    if (web3Provider) {
      const web3 = new Web3ClientService(web3Provider);
      const price = await web3.getGasPriceOnWeb3();
      setGasPrice(parseInt(price, 10).toString());
    }
  };

  return {
    selectedTokens,
    setSelectedTokens,
    currentProtocol,
    setCurrentProtocol,
    isTokenSelectVisible,
    setIsTokenSelectVisible,
    isProtocolSelectVisible,
    setIsProtocolSelectVisible,
    currentSelecting,
    setCurrentSelecting,
    fromTokenAmount,
    setFromTokenAmount,
    toTokenAmount,
    setToTokenAmount,
    bestTrade,
    setBestTrade,
    alternativeTrade,
    setAlternativeTrade,
    swapData,
    setSwapData,
    estimatedGas,
    setEstimatedGas,
    loading,
    setLoading,
    balanceInput,
    setBalanceInput,
    amountPerTargetToken,
    setAmountPerTargetToken,
    gasPrice,
    setGasPrice,
    slippage,
    setSlippage,
    fulfillModalVisible,
    setFulfillModalVisible,
    getBestTrade,
    takeAlternativeTrade,
    getQuote,
    handleTokenSelect,
    getProtocolImage,
    hasBalance,
    getSwapData,
    switchTokens,
    loadGasPriceWeb3,
    handleQueryString,
  };
}
export default useSwap;
