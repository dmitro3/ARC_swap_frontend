/* eslint-disable */
import MetaMaskOnboarding from '@metamask/onboarding';

class MetamaskHandler {
  /**
   * @var onboarding the singleton onboarding object
   */
  static onboarding = new MetaMaskOnboarding();

  /**
   * Starts `eth_requestAccounts` event in order to try to sign in.
   *
   * If metamask is not installed it will throw an error.
   *
   * The Metamask Onboarding process will take care of metamask
   * installation and wallet connecting to the app.
   *
   * @returns the user's metamask account id (wallet id)
   */
  async init(): Promise<string[]> {
    try {
      if (this.isInstalled()) {
        const account: string[] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        return account;
      }
      throw new Error('MetamaskHandler::init: Metamask is not Installed.');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Starts the Metamask onboarding process. This will
   * guide the user to install the correct version of
   * metamask and create an account in order to fill
   * the necessary prerequisites to access the app.
   */
  startOnboarding() {
    if (!MetamaskHandler.onboarding) {
      MetamaskHandler.onboarding = new MetaMaskOnboarding();
      MetamaskHandler.onboarding.startOnboarding();
    }
  }

  /**
   * Stops the onboarding process
   */
  stopOnboarding() {
    if (MetamaskHandler.onboarding) {
      MetamaskHandler.onboarding.stopOnboarding();
    }
  }

  /**
   * Checks if Metamask is installed
   * @returns
   */
  isInstalled(): boolean {
    return MetaMaskOnboarding.isMetaMaskInstalled();
  }

  /**
   * Listen to account change events. If the user changes or disconnects
   * an account, this will fire an event that will be cought to perform
   * a procedure such as reloading page or refreshing accounts.
   * @param handler function to perform when the account changes
   */
  static listenAccountChange(handler: (accounts: string[]) => void) {
    if (window.ethereum) {
      this.removeListener('accountsChanged');
      window.ethereum.on('accountsChanged', handler);
    }
  }

  /**
   * Removes a MetaMask listener
   * @param name
   */
  static removeListener(name: 'accountsChanged' | 'networkChanged') {
    if (window.ethereum) {
      window.ethereum.removeListener(name, () => {});
    }
  }

  /**
   * Listen to network change events. If the user changes its network,
   * this will fire an event that will be cought to perform
   * a procedure such as reloading the page or de-sign user from the app.
   * @param handler function to perform when the network changes
   */
  static listenNetworkChange(handler: (network: number) => void) {
    if (window.ethereum) {
      this.removeListener('networkChanged');
      window.ethereum.on('networkChanged', handler);
    }
  }

  /**
   * Reload window when network or accounts are changed
   */
  static async reloadOnChange(
    opts: { network?: boolean; account?: boolean } = {
      network: true,
      account: true,
    },
  ): Promise<void> {
    if (opts.account)
      this.listenAccountChange(() => {
        window.location.reload();
      });
    if (opts.network)
      this.listenNetworkChange(() => {
        window.location.reload();
      });
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, 250),
    );
  }
}

export default MetamaskHandler;
