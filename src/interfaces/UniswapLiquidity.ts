export interface IAddLiquidityParams {
  token0Amount: string;
  token1Amount: string;
  token0MinAmount: string;
  token1MinAmount: string;
  walletId: string;
  deadline: number;
  [key: string]: any;
}

export interface IRemoveLiquidityParams {
  liquidity: string;
  token0MinAmount: string;
  token1MinAmount: string;
  walletId: string;
  deadline: number;
  [key: string]: any;
}

export interface ILiquidityRequest {
  /**
   * Call and send an uniswap sdk mounted request
   */
  send: (
    /**
     * Passed parameters
     */
    opts: {
      /**
       * The address a transaction will be fired from
       */
      from: string;
      /**
       * Optional parameter, transaction count
       */
      nonce?: number;
      /**
       * A custom parameter
       */
      [key: string]: any;
    },
    /**
     * Callback function to execute when the transaction is executed
     */
    callback?: (
      /**
       * If the transaction resulted in an error
       */
      error: any,
      /**
       * the transaction hash resulted from the transaction.
       */
      txn: string,
    ) => void,
  ) => void;
  /**
   * Call and send an uniswap sdk mounted request
   */
  call: (
    /**
     * Passed parameters
     */
    opts: {
      /**
       * The address a transaction will be fired from
       */
      from: string;
      /**
       * Optional parameter, transaction count
       */
      nonce?: number;
      /**
       * A custom parameter
       */
      [key: string]: any;
    },
    /**
     * Callback function to execute when the transaction is executed
     */
    callback: (
      /**
       * If the transaction resulted in an error
       */
      error: any,
      /**
       * the transaction hash resulted from the transaction.
       */
      txn: string,
    ) => void,
  ) => void;
}
