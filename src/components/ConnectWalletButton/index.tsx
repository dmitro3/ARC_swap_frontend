import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';
import React, {
  useCallback,
  useEffect,
  useReducer,
  useContext,
  useState,
} from 'react';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Notification from '../Notification/Notification';
import { AuthContext } from '../../contexts/AuthProvider';
import { IUser } from '../../interfaces/IUser';
import { DepoAPISevice } from '../../services/DepoAPIService';
import { shortenAddress } from '../../utility/addressHelpers';
import ChainHelper from '../../utility/chainlist/ChainHelper';
import { __debounce } from '../../utility/debounce';

const INFURA_ID = 'e67a2556dede4ff2b521a375a1905f8b';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID,
    },
  },
  'custom-walletlink': {
    display: {
      logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
      name: 'Coinbase',
      description: 'Connect to Coinbase Wallet (not Coinbase App)',
    },
    options: {
      appName: 'Coinbase', // Your app name
      networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 1,
    },
    package: WalletLink,
    connector: async (_: any, options: any) => {
      const { appName, networkUrl, chainId } = options;
      const walletLink = new WalletLink({ appName });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions,
});

type StateType = {
  provider?: any;
  web3Provider?: any;
  address: string;
  chainId: number;
};

type ActionType =
  | {
      type: 'SET_WEB3_PROVIDER';
      provider?: StateType['provider'];
      web3Provider?: StateType['web3Provider'];
      address: StateType['address'];
      chainId: StateType['chainId'];
    }
  | {
      type: 'SET_ADDRESS';
      address: StateType['address'];
    }
  | {
      type: 'SET_CHAIN_ID';
      chainId: StateType['chainId'];
    }
  | {
      type: 'RESET_WEB3_PROVIDER';
    };

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: '',
  chainId: -1,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      };
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      };
    case 'RESET_WEB3_PROVIDER':
      return initialState;
    default:
      throw new Error();
  }
}

export const ConnectWalletButton = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const ctx = useContext(AuthContext);
  const dispatchAuthentication = (status: boolean) => {
    __debounce(
      () => {
        ctx.setIsAuthenticated(status);
      },
      1000,
      'dispatchAuthenticationState',
    );
  };

  const { provider, web3Provider, address = '', chainId } = state;

  const authorize = async (address: string, provider: any) => {
    try {
      setLoading(true);
      const web3Provider = new providers.Web3Provider(provider);
      const signParams = await DepoAPISevice.getSigningMessage(address);
      const signHash = await web3Provider.getSigner().signMessage(signParams);
      if (signHash) {
        const result = await DepoAPISevice.authenticate(address, signHash);
        if (result && !result.response) {
          ctx.setUser(result);
          ctx.setProvider(provider);
          dispatchAuthentication(true);
        } else if (result.response?.data?.data?.browserId) {
          dispatchAuthentication(false);
          Notification({
            type: 'error',
            title: 'Error',
            message:
              result.response?.data?.data?.message ??
              'Something bad happened while loging in',
          });
        }
      }
    } catch (error) {
      dispatchAuthentication(false);
      Notification({
        type: 'error',
        title: 'Error',
        message: 'Something bad happened while loging in',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ctx.setUser({});
    ctx.setUserBalances({});
    ctx.setWalletAvailableValue(0);
    ctx.setUniqueSymbols([]);
    ctx.setSymbols([]);
    ctx.setAllOpenOrders([]);
    dispatchAuthentication(false);
    DepoAPISevice.logout();
  };

  const connect = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();
      const network = await web3Provider.getNetwork();

      const authorized = await DepoAPISevice.verifyAuthorization();
      if (!authorized) {
        authorize(address, provider);
      } else {
        ctx.setProvider(provider);
        dispatchAuthentication(true);
      }

      dispatch({
        type: 'SET_WEB3_PROVIDER',
        provider,
        web3Provider,
        address,
        chainId: network.chainId,
      });
    } catch (err) {
      dispatchAuthentication(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider();
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect();
    }
    dispatch({ type: 'RESET_WEB3_PROVIDER' });
  }, [provider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      const store = localStorage.getItem('@app:user');
      if (store) {
        const user: IUser = JSON.parse(store);
        ctx.setUser(user);
      }
      connect();
    } else {
      dispatchAuthentication(false);
      localStorage.removeItem('@app:jwt');
    }
  }, [connect]);

  useEffect(() => {
    const chain = ChainHelper.find.byId(chainId);
    if (chain) {
      ctx.setWeb3Provider(chain.rpcUrls[0]);
    }
  }, [chainId]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = async (accounts: string[]) => {
        logout();
        authorize(accounts[0].toLowerCase(), provider);
        dispatch({ type: 'SET_ADDRESS', address: accounts[0] });
      };

      const handleChainChanged = (_hexChainId: string) => {
        const chain = ChainHelper.find.byId(parseInt(_hexChainId, 16));
        if (chain) {
          ctx.setWeb3Provider(chain.rpcUrls[0]);
        }
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error);
        disconnect();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return web3Provider ? (
    <Button
      className="btn-depo btn-sm btn-metamask-onboarding rounded m-0"
      onClick={disconnect}
    >
      {shortenAddress(address)}
    </Button>
  ) : (
    <Button
      className="btn-depo btn-sm btn-metamask-onboarding rounded m-0"
      onClick={connect}
    >
      {loading && <LoadingOutlined className="mr-2" />} Login
    </Button>
  );
};

export default ConnectWalletButton;
