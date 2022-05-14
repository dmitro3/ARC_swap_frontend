/* eslint-disable */
import Axios, { AxiosError } from 'axios';
import BigNumber from 'bignumber.js';
import env from '../config/global-env';
import { I1InchOperation } from '../interfaces/I1InchOperation';
import { I1InchQuote, I1InchQuoteParams } from '../interfaces/I1InchQuote';
import {
  I1InchApprovalParams,
  I1InchApprovalReponse,
  I1InchSwap,
  I1InchSwapParams,
} from '../interfaces/I1InchSwap';
import { IProtocol } from '../interfaces/IProtocol';
import { IToken, ITokenList } from '../interfaces/IToken';

/**
 * Service for 1Inch API communication.
 *
 * This static class is used to operate over 1Inch Exchange API aiming
 * swap, quote, token listing and protocols operations.
 *
 * @param {string} apiUrl
 *
 * @static fetchProtocols :: `IProtocolList`
 * @static fetchTokens :: `ITokenList`
 * @static getQuote :: `I1InchQuote`
 * @static getUrl :: `String`
 *
 * ```ts
 * import { OneInchService } from '@/services/OneInchService';
 *
 * async function getTokens() {
 *  return await OneInchService.getTokens();
 * }
 * ```
 *
 * @author [Pollum](pollum.io)
 * @since v0.1.0
 */
export class OneInchService {
  /**
   * @var {number} chainId the current network id.
   */
  static chainId = env.CHAIN_ID;
  /**
   * @var {string} apiUrl Current URL for 1Inch API
   */
  static apiUrl = 'https://api.1inch.exchange/v4.0/';

  static commonTokens = [
    'ETH',
    'UNI',
    'DAI',
    'USDT',
    'USDC',
    'BUSD',
    'SUSHI',
    '1INCH',
    'BAT',
    'MATIC',
    'BNB',
  ];

  static unusedDexProtocols = [
    'chai',
    'clipper',
    'cofix',
    'convergence x',
    'creamswap lending',
    'curve v2 eth crv',
    'curve v2 eth cvx',
    'curve v2 eurs',
    'curve v2 eurt',
    'curve v2 xaut',
    'dfx finance',
    'dodo',
    'swapr',
    'indexed finance',
    'mooniswap',
    'oasis',
    'liqpool x',
    'powerindex',
    'saddle finance',
    'smoothy finance',
    'value liquid',
    'xsigma',
  ];

  /**
   * Fetches the protocol list from 1Inch API.
   *
   * @see [Protocols](https://docs.1inch.io/api/protocols)
   * @returns
   */
  static async fetchProtocols(): Promise<Array<IProtocol>> {
    const url = this.getUrl('protocols');
    try {
      const result = await Axios.get(url);
      if (Array.isArray(result.data?.protocols)) {
        const sorted = result.data?.protocols.sort(
          (a: IProtocol, b: IProtocol) => (a.id > b.id ? 1 : -1),
        ) as Array<IProtocol>;
        return sorted;
      }
      return [];
    } catch (error) {
      // throw new Error(err.message);
      console.error(error);
      return [] as Array<IProtocol>;
    }
  }

  /**
   * Fetches the token list from 1Inch API.
   *
   * @see [Tokens](https://docs.1inch.io/api/tokens)
   * @returns
   */
  static async fetchTokens(): Promise<Array<IToken>> {
    try {
      const url = this.getUrl('tokens');
      const result = await Axios.get(url);
      if (result.data.tokens) {
        const tokens = Object.keys(result.data.tokens).map(
          (item) => result.data.tokens[item],
        );
        const sorted = tokens.sort((a: IToken, b: IToken) =>
          !this.commonTokens.find((item) => item === a.symbol) ? 1 : -1,
        );
        return sorted as Array<IToken>;
      }
      return [];
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.message);
    }
  }

  /**
   * Get a quotation from 1Inch Exchange using the chosen params.
   *
   * @see [Quote/Swap](https://docs.1inch.io/api/quote-swap)
   * @param opts {I1InchQuoteParams} params for quotation
   * @returns
   */
  static async getQuote(opts: I1InchQuoteParams): Promise<I1InchQuote> {
    try {
      const url = this.mountQuoteUrl(opts);
      const result = await Axios.get(url);
      const quote: I1InchQuote = {
        ...result.data,
        protocol: result.data.protocols[0]?.map((item: any) => item) ?? [],
      };
      delete quote.protocols;
      return quote;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.response?.data.description ?? err.message);
    }
  }

  /**
   * Gets the swap data to fulfill swap. The swap data will change quotation from time to time
   * so it is important to warn user and refetch if the time is too long between call and action.
   *
   * @param opts
   * @returns
   */
  static async getSwap(opts: I1InchSwapParams): Promise<I1InchSwap> {
    try {
      const url = this.mountSwapUrl(opts);
      const result = await Axios.get(url);
      const swap: I1InchSwap = result.data;
      return swap;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(
        err.response?.data?.message ??
          err.response?.data?.description ??
          "Sorry, we've got an unknown error, please try again.",
      );
    }
  }

  /**
   * Get call data for approving and spending wallet's assets in order to perform
   * swap.
   *
   * @param {I1InchApprovalParams} opts approval parameters
   */
  static async approveCalldata(
    opts: I1InchApprovalParams,
  ): Promise<I1InchApprovalReponse> {
    if (!this.isNative(opts.tokenAddress)) {
      try {
        let params = `tokenAddress=${opts.tokenAddress}&`;
        if (opts.amount && !opts.infinity) params += `amount=${opts.amount}`;
        else if (opts.infinity) params += `infinity=true`;

        const url = this.apiUrl + this.chainId + `/approve/calldata?${params}`;
        const result = await Axios.get(url);
        delete result.data.gasPrice;
        return result.data as I1InchApprovalReponse;
      } catch (error) {
        const err = error as AxiosError;
        throw new Error(err.response?.data?.message);
      }
    } else {
      throw new Error('No approval needed to native token.');
    }
  }

  /**
   * Get call data for approving and spending wallet's assets in order to perform
   * swap.
   *
   * @param {I1InchApprovalV4Params} opts approval parameters
   */
  static async approveCalldataV4(
    opts: I1InchApprovalParams,
  ): Promise<I1InchApprovalReponse> {
    if (!this.isNative(opts.tokenAddress)) {
      try {
        const { data } = await Axios.get(
          this.apiUrl +
            this.chainId +
            `/approve/transaction?tokenAddress=${opts.tokenAddress}`,
        );
        return data as I1InchApprovalReponse;
      } catch (error) {
        const err = error as AxiosError;
        throw new Error(err.response?.data?.message);
      }
    } else {
      throw new Error('No approval needed to native token.');
    }
  }

  /**
   * Mounts the API url based on the chosen operation
   *
   * @param op endpoint operation reference
   * @param params url params if needed
   * @returns
   */
  static getUrl(op: keyof I1InchOperation, params?: I1InchQuoteParams): string {
    switch (op) {
      case 'protocols':
        return `${this.apiUrl}${this.chainId}/liquidity-sources/`;
      case 'quote':
        if (params) return this.mountQuoteUrl(params);
        throw new TypeError(
          `${
            this.name
          }::Expected "params" to be typeof "I1InchQuoteParams", received "${typeof params}" instead.`,
        );
      case 'swap':
        return `${this.apiUrl}${this.chainId}/swap`;
      case 'tokens':
        return `${this.apiUrl}${this.chainId}/tokens`;
    }
  }

  /**
   * Mounts the quotation url with its parameters.
   *
   * @param params
   * @returns
   */
  private static mountQuoteUrl(params: I1InchQuoteParams): string {
    const amount = new BigNumber(
      new BigNumber(params.amount).times(
        new BigNumber(`1e${params.fromToken.decimals}`),
      ),
    )
      .toFixed(0)
      .split('.')[0];
    // (
    //   10 ** Number(params.fromToken.decimals) *
    //   params.amount
    // ).toFixed(0);
    let query = `quote?fromTokenAddress=${params.fromToken.address}`;
    query += `&toTokenAddress=${params.toToken.address}`;
    query += `&amount=${amount}`;
    query += params.protocol ? `&protocols=${params.protocol}` : '';

    return `${this.apiUrl}${this.chainId}/${query}`;
  }

  /**
   * Mounts the swap url with its parameters.
   *
   * @param params
   * @returns
   */
  private static mountSwapUrl(params: I1InchSwapParams) {
    let protocols: string[][] = [];
    if (params.protocols && params.protocols.length) {
      protocols = params.protocols.map((protocol) =>
        protocol.map((route) => route.name),
      );
    }
    let query = `swap?fromTokenAddress=${params.fromTokenAddress}`;
    query += `&toTokenAddress=${params.toTokenAddress}`;
    query += `&amount=${params.amount}`;
    query += `&fromAddress=${params.fromAddress}`;
    query += `&slippage=${params.slippage}`;
    protocols.length ? (query += `&protocols=${protocols.join(',')}`) : null;

    return `${this.apiUrl}${this.chainId}/${query}`;
  }

  /**
   * Returns if the addr belongs to the native network token
   * @param addr token address
   * @returns
   */
  static isNative(addr: string) {
    return addr === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }

  /**
   * Convert transaction fee from wei to eth
   * @param gas Gas used
   * @param gasPrice Gas price
   * @param decimals Token decimal places
   * @returns
   */
  static getFee(
    gas: string | number,
    gasPrice: string,
    decimals: number,
  ): string {
    return new BigNumber(gas)
      .times(new BigNumber(gasPrice))
      .dividedBy(new BigNumber(10).pow(new BigNumber(decimals)))
      .toFixed(8);
  }
}
