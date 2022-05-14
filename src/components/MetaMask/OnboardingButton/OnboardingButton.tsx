/* eslint-disable */
import React, { useContext, useState } from 'react';
import { Button } from 'antd';
import MetamaskHandler from './controller/metamask-onboarding';
import Notification from '../../Notification/Notification';
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from '../../../contexts/AuthProvider';
import { DepoAPISevice } from '../../../services/DepoAPIService';
import { IUser } from '../../../interfaces/IUser';
import MetaMaskSvg from '../../../assets/MetaMask_Fox 1.svg';
import { __debounce } from '../../../utility/debounce';
import { shortenAddress } from '../../../utility/addressHelpers';

/**
 * Default component to provide support to metamask onboarding procedure.
 *
 * Use this button to show the wallet connection status to the user.
 *
 * - If the button shows  `Connect Wallet`, this means that the wallet is not connected.
 * - If the button shows `Click here to install MetaMask` this means that Metamask is not installed
 * and the onboarding process will begin.
 * - If the button shows `Connected` this means that the user has connected his wallet
 *
 * Once the button is clicked, it will start its function.
 *
 * ### Example
 *
 * ```tsx
 *  import React, { useState } from 'react';
 *  import OnboardingButton from '~/MetaMask/OnboardingButton`;
 *
 *  const SomePage: React.FC = () => {
 *    const [isLoading, setIsLoading] = useState<boolean>(false);
 *
 *    const handleConnection = (accounts: string[]) => {
 *      // do something
 *    };
 *
 *    return (
 *      <div className="my-class">
 *        <OnboardingButton
 *           size="sm"
 *           onConnect={handleConnection}
 *           setLoadingState={setIsLoading}
 *        />
 *      </div>
 *    );
 *  }
 *
 * ```
 *
 * @param {Function} onConnect callback function to execute if connection is successful
 * @param {Function} setLoadingState setState function to set loading state. It should be a useState reference
 * @param {'sm'|'md'|'lg'} size the size of the button. sm to small, md to medium and lg to large. The button is a block button.
 * @returns
 */
const OnboardingButton: React.FC<{
  onConnect?: (accounts: string[]) => void;
  setLoadingState?: (state: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onConnect, setLoadingState, size = 'small' }) => {
  const ONBOARD_TEXT = 'Click here to install MetaMask!';
  const CONNECT_TEXT = 'Login';
  const CONNECTED_TEXT = 'Connected';
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const Metamask = new MetamaskHandler();

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

  const shortWalletAddr = () => {
    if (accounts.length) {
      return shortenAddress(accounts[0]);
    }
    return '';
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
    // MetamaskHandler.removeListener('accountsChanged');
  };

  const validateSignature = async (
    account: string,
  ): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      if (window.ethereum) {
        __debounce(
          async () => {
            const signParams = await DepoAPISevice.getSigningMessage(account);
            try {
              const signHash = await window.ethereum.request({
                method: 'personal_sign',
                params: [signParams, account],
                from: account,
              });
              resolve(signHash);
            } catch (error) {
              const err = error as Error;
              Notification({
                type: 'error',
                message: err.message,
              });
              resolve(undefined);
            }
          },
          300,
          'getSigningMessage',
        );
      }
    });
  };

  const handleConnect = async (accounts: string[]) => {
    try {
      if (setLoadingState) setLoadingState(true);
      setLoading(true);
      const address = accounts[0].toLowerCase();
      const signHash = await validateSignature(address);
      if (signHash) {
        const result = await DepoAPISevice.authenticate(address, signHash);
        if (result && !result.response) {
          setAccounts(accounts);
          ctx.setUser(result);
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
      if (setLoadingState) setLoadingState(false);
      setLoading(false);
    }
  };

  const startMetamask = async () => {
    try {
      const accounts = await Metamask.init();
      const authorized = await DepoAPISevice.verifyAuthorization();

      if (!authorized) {
        handleConnect(accounts);
        if (onConnect) {
          onConnect(accounts);
        }
      } else {
        /**
         * Listens to account changes in order to redo authentication
         */
        MetamaskHandler.listenAccountChange((accounts) => {
          logout();
          handleConnect(accounts);
        });
        dispatchAuthentication(true);
      }
    } catch (error) {
      dispatchAuthentication(false);

      const err = error as Error;
      if (err.message.includes('not Installed')) {
        Metamask.startOnboarding();
      } else {
        setLoading(false);
      }
    }
  };

  const userHasPersisted = async () => {
    const store = localStorage.getItem('@app:user');
    if (store) {
      const user: IUser = JSON.parse(store);
      ctx.setUser(user);
      if (!!user.settings?.defaultWallet) {
        setAccounts([user.settings.defaultWallet]);
        startMetamask();
      }
    } else {
      dispatchAuthentication(false);
      // MetamaskHandler.removeListener('accountsChanged');
      localStorage.removeItem('@app:jwt');
    }
  };

  React.useEffect(() => {
    if (Metamask.isInstalled()) {
      if (accounts.length > 0) {
        setButtonText(shortWalletAddr());
        setDisabled(true);
        Metamask.stopOnboarding();
      } else {
        dispatchAuthentication(false);

        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  // Starts onboarding regardly of user's interactions.
  React.useEffect(() => {
    userHasPersisted();
  }, []);

  React.useEffect(() => {
    setDisabled(ctx.isAuthenticated ?? false);
    setButtonText(ctx.isAuthenticated ? shortWalletAddr() : CONNECT_TEXT);
  }, [ctx.isAuthenticated]);

  const onClick = () => {
    if (buttonText !== CONNECTED_TEXT) {
      startMetamask();
    }
  };

  return (
    <Button
      className={`btn-depo btn-${size} btn-metamask-onboarding rounded m-0`}
      disabled={isDisabled || loading}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <LoadingOutlined className="mr-2" />
        ) : (
          buttonText === CONNECT_TEXT && (
            <img
              src={MetaMaskSvg}
              height={20}
              alt="Metamask"
              className="pr-2"
            />
          )
        )}
        {buttonText}
      </div>
    </Button>
  );
};

export default OnboardingButton;
