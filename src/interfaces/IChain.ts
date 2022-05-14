interface IChain {
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /**
   * @var chainId hexId '0x' + Number(n).toString(16) <=> parseInt(hexId, 'hex');
   */
  chainId: string;
  blockExplorerUrls: string[];
}

export default IChain;
