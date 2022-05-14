/* eslint-disable */
import React, { createContext, useState, useEffect } from 'react';

import { IProtocol } from '../interfaces/IProtocol';
import { IToken } from '../interfaces/IToken';
import { IUser } from '../interfaces/IUser';
import { __debounce } from '../utility/debounce';
import { OneInchService } from '../services/OneInchService';
import Web3ClientService from '../services/Web3ClientService';
import { DepoAPISevice } from '../services/DepoAPIService';
import env from '../config/global-env';
import UniswapV2Service from '../services/UniswapV2Service';
import SupportedNetworks from '../interfaces/SupportedNetworks';
import Notification from '../components/Notification/Notification';
import useRefresh from '../hooks/useRefresh';

interface AuthContextState {
  tokens: IToken[];
  setTokens: Function;
  protocols: IProtocol[];
  setProtocols: Function;
  user?: IUser;
  setUser: Function;
  chainId?: number;
  setChainId: Function;
  provider: any;
  setProvider: Function;
  symbols: any[];
  setSymbols: Function;
  uniqueSymbols: any[];
  setUniqueSymbols: Function;
  walletAvailableValue: number;
  setWalletAvailableValue: Function;
  balances: any;
  setUserBalances: Function;
  getBalanceFor: Function;
  isAuthenticated: boolean | undefined;
  setIsAuthenticated: Function;
  isLoading: boolean;
  setIsLoading: Function;
  cexLoading: boolean;
  setCexIsLoading: Function;
  dexLoading: boolean;
  setDexIsLoading: Function;
  allOpenOrders: any[];
  setAllOpenOrders: Function;
  web3Provider: string | undefined;
  setWeb3Provider: Function;
  getAllBalances: Function;
  defaultCurrency: string;
  setDefaultCurrency: Function;
  defaultCurrencyAddr: string;
  ARCToken: IToken;
  exchangesAvaiableBalance: any;
  getUserCexBalance: any;
  erc20TokensForStaticList: IToken[];
}

export const AuthContext = createContext<AuthContextState>(
  {} as AuthContextState,
);

const AuthProvider: React.FC = ({ children }) => {
  const [protocols, setProtocols] = useState<IProtocol[]>([]);
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [user, setUser] = useState<IUser>({});
  const [chainId, setChainId] = useState<keyof SupportedNetworks>(1);
  const [provider, setProvider] = useState<any>(null);
  const [symbols, setSymbols] = useState<any[]>([]);
  const [uniqueSymbols, setUniqueSymbols] = useState<any[]>([]);
  const [walletAvailableValue, setWalletAvailableValue] = useState<number>(0);
  const [balances, setUserBalances] = useState<any>({});
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [cexLoading, setCexIsLoading] = useState(true);
  const [dexLoading, setDexIsLoading] = useState(true);
  const [allOpenOrders, setAllOpenOrders] = useState<any[]>([]);
  const [exchangesAvaiableBalance, setExchangesAvaiableBalance] = useState<
    any[]
  >([]);
  const [web3Provider, setWeb3Provider] = useState<string | undefined>();
  const [defaultCurrency, setDefaultCurrency] = useState<string>('ETH');
  const [defaultCurrencyAddr] = useState<string>(
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  );

  const { fastRefresh } = useRefresh();

  const ARCToken = {
    address: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2',
    decimals: 18,
    logoURI:
      'https://media.discordapp.net/attachments/945662301262975026/961817737901002782/logo.png',
    name: 'ARC Token',
    symbol: 'ARC',
  };

  const erc20Tokens: any[] = [];

  const erc20TokensForStaticList = [
    {
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      decimals: 8,
      logoURI:
        'https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      logoURI:
        'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      logoURI:
        'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      logoURI:
        'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
      eip2612: true,
    },
    // {
    //   address: '0xa5def515cfd373d17830e7c1de1639cb3530a112',
    //   decimals: 18,
    //   logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/13051.png',
    //   name: 'DePo Token',
    //   symbol: 'DEPO',
    // },
  ];

  const fetchProtocols = async () => {
    try {
      const protocols = await OneInchService.fetchProtocols();
      if (protocols) setProtocols(protocols);
    } catch (error) {
      // toast.error('Unable to get the protocol list');
    }
  };

  const getImportedTokens = () => {
    if (chainId) {
      const stored = localStorage.getItem('@app:imported-tokens');
      if (stored) {
        const tokens: IToken[] = JSON.parse(stored);
        return tokens.filter((token) => token.chainId === chainId);
      }
    }
    return [];
  };

  const fetchTokens = async () => {
    try {
      setTokens([]);
      const tokens = (await OneInchService.fetchTokens()).filter(
        (token) => token.symbol !== 'DEPO',
      );
      if (chainId === 1) {
        tokens.unshift(...erc20Tokens);
        tokens.unshift(ARCToken);
      }
      const hasImportedTokens = getImportedTokens().filter(
        (token) => token.chainId === chainId,
      );
      tokens.unshift(...hasImportedTokens);
      if (tokens) setTokens(tokens);
    } catch (error) {
      // toast.error('Unable to get the token list.');
    }
  };

  const getAllBalances = async () => {
    if (web3Provider) {
      const web3Client = new Web3ClientService(
        web3Provider,
        user.settings?.defaultWallet,
      );
      try {
        const ethBalance = await web3Client.getBalanceEth();
        const result = await web3Client.batchGetBalance(
          tokens,
          defaultCurrency,
        );
        const balances = {
          ...result,
          [defaultCurrencyAddr]: ethBalance,
        };
        setUserBalances(balances);
      } catch (error) {
        Notification({
          type: 'warning',
          message: `Unable to get balances for the current network.`,
        });
      }
    }
  };

  const getBalanceFor = async (symbol: string) => {
    if (balances[symbol]) return balances[symbol];
    return null;
  };

  const getUserAllOpenOrders = async (walletId: string) => {
    try {
      const response = await DepoAPISevice.getAllUserOpenOrders(walletId);
      if (response) {
        setAllOpenOrders(response);

        // set in local storage
        // setItemInLocalStorage('#DePo_All_Open_orders#', response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getUserCexBalance = async (walletId: string) => {
    const marketType = 'spot';
    try {
      const response = await DepoAPISevice.getUserCEXBalance(
        walletId,
        marketType,
      );
      if (
        response &&
        response.symbols &&
        response.uniqueSymbols &&
        response.walletValue
      ) {
        setSymbols(response.symbols);
        setUniqueSymbols(response.uniqueSymbols);
        setWalletAvailableValue(response.walletValue.toFixed(2));

        // Creates an aux total balance object
        const totalBalances: any = {
          binance: 0,
          huobi: 0,
          ftx: 0,
          kucoin: 0,
          'gate.io': 0,
        };

        //   // Navigate through symbols parsing it and filling the balances
        response.symbols.forEach((symbol: any) => {
          const cexName = symbol.exchange.toLowerCase();
          if (cexName) totalBalances[cexName] += symbol.usdValue;
        });

        // console.log(totalBalances)
        //     setExchangesAvaiableBalance(totalBalances);
        setExchangesAvaiableBalance(totalBalances);

        await getUserAllOpenOrders(walletId);

        // set in local storage
        // setItemInLocalStorage('#DePo_Symbols#', response.symbols);
        // setItemInLocalStorage('#DePo_Unique_Symbols#', response.uniqueSymbols);
        // setItemInLocalStorage('#DePo_Total_Wallet#', response.walletValue.toFixed(4));
      } else {
        // This value is invisible
        setWalletAvailableValue(0.00000001);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDexData = () => {
    __debounce(fetchProtocols, 250, 'fetchProtocols');
    __debounce(fetchTokens, 250, 'fetchTokens');
    // __debounce(initTokenWithPredefined, 250, 'initTokenWithPredefined');
  };

  /**
   * When the network is changed, the application MUST reload all of its parameters
   * and fetch all its assets again in order to update the platform's data to the
   * current network.
   */
  useEffect(() => {
    if (chainId && web3Provider) {
      env.CHAIN_ID = chainId.toString().match(/^1337|^4/) ? 1 : chainId;
      env.CURRENT_WEB3_PROVIDER = web3Provider;
      OneInchService.chainId = env.CHAIN_ID;
      UniswapV2Service.setNetwork(chainId, window.ethereum ?? web3Provider);
      fetchDexData();
    }
  }, [web3Provider]);

  useEffect(() => {
    if (user?.settings?.defaultWallet) {
      const result: any = user?.settings?.defaultWallet;
      getUserCexBalance(result);
    }
  }, [isAuthenticated, user.exchanges]);

  useEffect(() => {
    if (tokens.length && user.settings?.defaultWallet && isAuthenticated) {
      __debounce(getAllBalances, 250, 'getAllBalancesForAccount');
    }
  }, [tokens, user, defaultCurrency, isAuthenticated, fastRefresh]);

  useEffect(() => {
    getImportedTokens;
  }, [localStorage]);

  return (
    <AuthContext.Provider
      value={{
        protocols,
        setProtocols,
        tokens,
        setTokens,
        user,
        setUser,
        chainId,
        setChainId,
        provider,
        setProvider,
        symbols,
        setSymbols,
        uniqueSymbols,
        setUniqueSymbols,
        walletAvailableValue,
        setWalletAvailableValue,
        balances,
        setUserBalances,
        isAuthenticated,
        setIsAuthenticated,
        getUserCexBalance,
        getBalanceFor,
        isLoading,
        setIsLoading,
        cexLoading,
        setCexIsLoading,
        dexLoading,
        setDexIsLoading,
        allOpenOrders,
        setAllOpenOrders,
        web3Provider,
        setWeb3Provider,
        getAllBalances,
        defaultCurrency,
        setDefaultCurrency,
        defaultCurrencyAddr,
        ARCToken,
        exchangesAvaiableBalance,
        erc20TokensForStaticList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
