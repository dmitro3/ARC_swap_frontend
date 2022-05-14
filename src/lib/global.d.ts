/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  ethereum: {
    on: (event: string, handler: (result: any) => void) => void;
    removeListener: (event: string, handler: (result: any) => void) => void;
    request: (args: any) => Promise<any>;
    chainId: string;
    selectedAddress: string;
    [key: string]: any;
  };
  web3: any;
  gtag?: (...args) => void;
}

declare module 'ganache-cli';
