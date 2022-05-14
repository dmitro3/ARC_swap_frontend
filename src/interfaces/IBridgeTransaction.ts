interface IBridgeTransaction {
  transactionId: string;
  fromChainId: number;
  fromTokenAddress?: string;
  fromAmount: string;
  toChainId: number;
  toTokenAddress?: string;
  toAmount: string;
  preparedAt: number;
  status: string;
  expiry?: number;
  fulfilledTxHash?: string;
  action: any;
}

export default IBridgeTransaction;
