/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint import/no-unresolved: 2 */
import {
  Fetcher,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Token,
  Pair,
} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import env from '../config/global-env';
import {
  IAddLiquidityParams,
  ILiquidityRequest,
  IRemoveLiquidityParams,
} from '../interfaces/UniswapLiquidity';
import UniswapV2Router2 from '../utility/abi/uniswapv2-router2';
import ERC20 from '../utility/abi/standard-abi.eth';
import SupportedNetworks from '../interfaces/SupportedNetworks';
import { SupportedAPIPools } from '../interfaces/NetworkPools';
import { PoolToken } from '../interfaces/Subgraphs';
import { IPoolDetails } from '../interfaces/IPoolDetails';

class UniswapV2Service {
  /**
   * The network chain id
   */
  static chainId: keyof SupportedNetworks = env.CHAIN_ID;

  /**
   * The web3 instance
   */
  private static web3: Web3 = new Web3(
    (window.ethereum as any) ?? env.CURRENT_WEB3_PROVIDER,
  );

  /**
   * The base provider for Uniswap
   */
  // private static baseProvider: BaseProvider;

  /**
   * Fetches the token data for the chain
   *
   * @param chainId current chain id
   * @param tokenAdrress the desired token
   * @returns token data for sdk's procedures.
   */
  static async fetchTokenData(tokenAdrress: string): Promise<Token> {
    const token = await Fetcher.fetchTokenData(this.chainId, tokenAdrress);
    return token;
  }

  /**
   * Fetches the pair data in uniswap (also sushiswap and other forks)
   *
   * @param token0 The token0 instance of Token or address
   * @param token1 The token1 instance of Token or address
   * @returns The pair data
   */
  static async fetchPairData(
    token0: Token | string,
    token1: Token | string,
  ): Promise<Pair> {
    /**
     * @var token0Instance the token 0 instance
     */
    const token0Instance: Token = await this.tokenFactory(token0);
    /**
     * @var token0Instance the token 1 instance
     */
    const token1Instance: Token = await this.tokenFactory(token1);

    if (token0Instance && token1Instance) {
      const pair = await Fetcher.fetchPairData(token0Instance, token1Instance);
      return pair;
    }

    throw new Error(
      'UniswapV2Service::fetchPairData: Error while fetching pair data',
    );
  }

  /**
   * Creates a `Route` to perform trades and queries into the uniswap exchange.
   *
   * @param pair the fetched pair
   * @returns the route object
   */
  static getRoute(pair: Pair): Route {
    return new Route([pair], pair.token0);
  }

  /**
   * Creates the trading object in order to perform the trade
   * @param route
   * @param inputTokenAmount
   * @returns
   */
  private static mountTrade(route: Route, inputTokenAmount: number): Trade {
    const tokenAmount = new TokenAmount(
      route.pairs[0].token0,
      Web3.utils.toWei(inputTokenAmount.toString()),
    );
    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);
    return trade;
  }

  /**
   *
   * @param token0 Input token
   * @param token1 Output token
   * @param inputTokenAmount Amount of input token
   * @returns
   */
  static async getTrade(
    token0: Token | string,
    token1: Token | string,
    inputTokenAmount: number,
  ): Promise<Trade> {
    const token0Instance = await this.tokenFactory(token0);
    const token1Instance = await this.tokenFactory(token1);

    const tokens = this.sortInOrderOfETH(token0Instance, token1Instance);
    const pair = await this.fetchPairData(tokens.token0, tokens.token1);

    const route = this.getRoute(pair);
    const trade = this.mountTrade(route, inputTokenAmount);

    return trade;
  }

  /**
   * Sort the pair of tokens in order to always put the ETH token in the first position
   * to avoid overcheck. It still need a check to verify if token0 is ETH, but if it is,
   * will always be token0.
   *
   * @param token0
   * @param token1
   * @returns
   */
  private static sortInOrderOfETH(
    token0: Token,
    token1: Token,
  ): { token0: Token; token1: Token } {
    if (this.isNative(token1.address)) {
      return { token0: token1, token1: token0 };
    }
    return { token0, token1 };
  }

  /**
   * Executes a liquidity procedure using the uniswap sdk.
   *
   * If `liquidity` is set, then it will try to remove liquidity
   * with an amount of `liquidity` tokens, otherwise, it will try
   * to add liquidity to a pool.
   *
   * @param token0
   * @param token1
   * @param walletId the current user's wallet id
   * @param token0Amount amount of token0 to input
   * @param token1Amount amount of token1 to input
   * @param opts time to leave and slippage opts
   * @param protocol the pool protocol (uniswap, sushiswap)
   * @param liquidity amount of liquidity tokens to remove
   * @returns a promise to be executed. The promise is complied with the web3 send interface.
   */
  static execute(
    token0: PoolToken,
    token1: PoolToken,
    nativeCurrency: string,
    walletId: string,
    token0Amount: BigNumber,
    token1Amount: BigNumber,
    protocol: keyof SupportedAPIPools = 'uniswap-v2',
    liquidity?: BigNumber,
    opts: {
      /**
       * Time to leave: the maximum time to execute the transaction or pullback
       */
      ttl: number;
      /**
       * Percent of the total value that the user accepts to receive less (T - (slippage * T))
       */
      slippage: 0.5 | 1 | 3 | 5 | 10;
    } = {
      ttl: 1200,
      slippage: 1,
    },
  ): any {
    /**
     * Time in seconds before the transaction give up
     */
    const deadline = Math.floor(Date.now() / 1000) + opts.ttl;

    /**
     * The contract router address
     */
    const contractData = env.CONTRACTS(this.chainId, protocol);

    /**
     * Minimum amount of tokens to receive based in the slippage percent for token0
     */
    const token0MinAmount = this.applySlippage(opts.slippage, token0Amount);

    /**
     * Minimum amount of tokens to receive based in the slippage percent for token1
     */
    const token1MinAmount = this.applySlippage(opts.slippage, token1Amount);

    /**
     * The Uniswap Router V2 contract instance
     */
    const uniswap = new this.web3.eth.Contract(
      UniswapV2Router2.abi as AbiItem[],
      contractData.routerAddr,
    );

    /**
     * the parsed liquidity parameters
     */
    const params = liquidity
      ? ({
          liquidity: liquidity.toFixed(0),
          token0MinAmount,
          token1MinAmount,
          walletId,
          deadline,
        } as IRemoveLiquidityParams)
      : ({
          token0Amount: token0Amount.toFixed(0),
          token1Amount: token1Amount.toFixed(0),
          token0MinAmount,
          token1MinAmount,
          walletId,
          deadline,
        } as IAddLiquidityParams);

    /**
     * The mounted contract request
     */
    const request = this.requestFactory(
      token0,
      token1,
      nativeCurrency,
      uniswap,
      params,
    );

    return request;
  }

  /**
   * Fetches the allowance for the given pair address tokens.
   * @param walletAddr user's wallet address
   * @param protocol the protocol to be used
   * @param token the token to check for allowance
   */
  static async fetchAllowance(
    walletAddr: string,
    protocol: keyof SupportedAPIPools,
    token: PoolToken,
  ): Promise<any> {
    try {
      /**
       * the contract addresses for router and factory
       */
      const contractData = env.CONTRACTS(this.chainId, protocol);
      if (contractData) {
        const contract = this.ERC20Factory(token.id);
        /**
         * The current value allowed to the current contract address to spend.
         */
        const allowance = await contract.methods
          .allowance(walletAddr, contractData.routerAddr)
          .call();
        return allowance;
      }
      throw new Error(
        `UniswapV2Service::fetchAllowance: Protocol ${protocol} not suported by the network.`,
      );
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message);
    }
  }

  /**
   * Fetches the balance of an ERC20 token
   * @param walletAddr
   * @param contractAddr
   * @param protocol
   * @returns
   */
  static async fetchLPTokenBalance(
    walletAddr: string,
    contractAddr: string,
    decimals?: string,
  ): Promise<string> {
    try {
      const contract = this.ERC20Factory(contractAddr);
      const balance = await contract.methods.balanceOf(walletAddr).call();
      if (decimals) {
        return new BigNumber(balance)
          .dividedBy(new BigNumber(10).pow(decimals))
          .toString();
      }
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message);
    }
  }

  /**
   * Fetches the LP Token total Supply
   * @param contractAddr
   * @returns
   */
  static async fetchLPTotalSupply(contractAddr: string): Promise<string> {
    try {
      const contract = this.ERC20Factory(contractAddr);
      const totalSupply = await contract.methods.totalSupply().call();
      return this.web3.utils.fromWei(totalSupply, 'ether');
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message);
    }
  }

  /**
   * Fetch the wallet addr pool details.
   *
   * Returns all the details related to the current wallet Id and the current pool id,
   * @param token0
   * @param token1
   * @param poolContractAddress
   * @param walletId
   * @returns
   */
  static async fetchPoolAssetsDetails(
    token0: PoolToken,
    token1: PoolToken,
    poolContractAddress: string,
    walletId: string,
  ): Promise<IPoolDetails> {
    try {
      /**
       * Amount of token0 held by the pool
       */
      const token0Supply = await UniswapV2Service.fetchLPTokenBalance(
        poolContractAddress,
        token0.id,
        token0.decimals,
      );
      /**
       * Amount of token1 held by the pool
       */
      const token1Supply = await UniswapV2Service.fetchLPTokenBalance(
        poolContractAddress,
        token1.id,
        token1.decimals,
      );
      /**
       * Balance of the LP Token
       */
      const poolTokenBalance = await this.fetchLPTokenBalance(
        walletId,
        poolContractAddress,
      );
      /**
       * Total token supply of a pool
       */
      const poolSupply = await this.fetchLPTotalSupply(poolContractAddress);
      /**
       * The pool share ratio
       */
      const poolShare = new BigNumber(poolTokenBalance).dividedBy(poolSupply);

      /**
       * Token 0 result balance of the pool share ratio times the total supply
       */
      const token0Balance = new BigNumber(token0Supply)
        .times(poolShare)
        .toFixed(8);

      /**
       * Token 1 result balance of the pool share ratio times the total supply
       */
      const token1Balance = new BigNumber(token1Supply)
        .times(poolShare)
        .toFixed(8);

      return {
        token0Supply,
        token1Supply,
        poolShare: poolShare.toFixed(16),
        poolSupply,
        poolTokenBalance,
        token0Balance,
        token1Balance,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message);
    }
  }

  /**
   * Prepares a method call to request for allowance
   *
   * _Note that this method is not executed, only prepared. In orde to call
   * the method, you'll need to call `.send({...})`_
   * @param amount
   * @param token
   * @param protocol
   * @returns
   */
  static approveAllowanceFactory(
    amount: BigNumber,
    token: PoolToken,
    protocol: keyof SupportedAPIPools,
  ): any {
    const uniswapAddrs = env.CONTRACTS(this.chainId, protocol);
    const contract = this.ERC20Factory(token.id);
    const hexAmount = `0x${amount.toString(16)}`;
    return contract.methods.approve(uniswapAddrs.routerAddr, hexAmount);
  }

  private static requestFactory(
    token0: PoolToken,
    token1: PoolToken,
    nativeCurrency: string,
    contract: Contract,
    provision: IAddLiquidityParams | IRemoveLiquidityParams,
  ): ILiquidityRequest {
    const params = Object.keys(provision).map((key) => provision[key]);
    if (!provision.liquidity) {
      if (token0.symbol.toUpperCase() === `${nativeCurrency.toUpperCase()}`) {
        /**
         * The request object generated by the contract method call
         */
        return contract.methods.addLiquidityETH(
          token0.id,
          token1.id,
          ...params,
        );
      }
      /**
       * The request object generated by the contract method call
       */
      return contract.methods.addLiquidity(token0.id, token1.id, ...params);
    }

    if (provision.liquidity) {
      return contract.methods.removeLiquidity(token0.id, token1.id, ...params);
    }

    throw new Error(
      `UniswapV2Service::requestFactory: Wrong params to add or remove liquidity.`,
    );
  }

  /**
   * Checks if the addr belongs to the native network token
   * @param addr token address
   * @returns
   */
  static isNative(addr: string): boolean {
    return addr === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }

  /**
   * Factories a token instance based on its parameters
   *
   * @param token token address or instance
   * @returns
   */
  static async tokenFactory(token: string | Token): Promise<Token> {
    return typeof token === 'string'
      ? Fetcher.fetchTokenData(this.chainId, token)
      : token;
  }

  /**
   * Calculates the value after applying the slippage percent.
   *
   * @param slippage
   * @param amount
   * @returns
   */
  private static applySlippage(
    slippage: 0.5 | 1 | 3 | 5 | 10,
    amount: BigNumber,
  ): string {
    const result = amount
      .times(1 - slippage / 100)
      .toFixed(0)
      .split('.')[0];
    return result;
  }

  /**
   * Sets the chainId and provider url
   *
   * @param chainId
   * @param providerUrl
   */
  static setNetwork(chainId: keyof SupportedNetworks, providerUrl: any): void {
    this.chainId = chainId;
    this.web3 = new Web3(providerUrl);
  }

  private static ERC20Factory(contractAddr: string): Contract {
    return new this.web3.eth.Contract(ERC20 as AbiItem[], contractAddr);
  }
}

export default UniswapV2Service;
