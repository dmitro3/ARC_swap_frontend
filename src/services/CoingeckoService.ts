import axios, { AxiosError, AxiosInstance } from 'axios';
import ICoingeckoToken from '../interfaces/ICoingeckoToken';
import { IToken } from '../interfaces/IToken';

class CoingeckoService {
  static api: AxiosInstance = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3/',
    withCredentials: false,
  });

  static async tokenInfoById(symbol: string): Promise<string> {
    const url = `coins/${symbol}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
    try {
      const result = await this.api.get(url);
      return result?.data?.image?.thumb ?? '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Search for a coin in Coingecko's API using its contract address
   * @param chainId
   * @param contractAddr
   * @returns
   */
  static async search(
    chainId: number,
    contractAddr: string,
    decimals: number,
  ): Promise<IToken | undefined> {
    const chain = this.bindChain(chainId);
    try {
      const result = await this.api.get(
        `/coins/${chain}/contract/${contractAddr}`,
      );
      if (result.data) {
        const token: ICoingeckoToken = result.data;
        return {
          address: token.contract_address,
          decimals,
          logoURI: token.image.thumb ?? '',
          name: token.name,
          symbol: token.symbol.toUpperCase(),
          chainId,
        } as IToken;
      }
      return undefined;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(`CoingeckoService::search ${err.message}`);
    }
  }

  /**
   * Fetch BTC usdt
   */
  public static async fetchTickerBtcUsd(): Promise<number> {
    try {
      const result = await this.api.get(
        '/simple/price?ids=bitcoin&vs_currencies=usd',
      );
      return result.data.bitcoin.usd as number;
    } catch (error) {
      throw new Error('Could fetch BTC/USD price.');
    }
  }

  /**
   * Fetch DEPO usdt
   */
  public static async fetchTickerDepoUsd(): Promise<number> {
    try {
      const result = await this.api.get(
        '/simple/price?ids=depo&vs_currencies=usd',
      );
      return result.data.depo.usd;
      // return result.data.bitcoin.usd as number;
    } catch (error) {
      throw new Error('Could fetch BTC/USD price.');
    }
  }

  /**
   * Fetch DEPO/ETH
   */
  public static async fetchTickerDepoEth(): Promise<number> {
    try {
      const result = await this.api.get(
        '/simple/price?ids=depo&vs_currencies=eth',
      );
      return result.data.depo.eth;
    } catch (error) {
      throw new Error('Could fetch BTC/USD price.');
    }
  }

  /**
   * Bind chain id with its chain name compatible with coingecko.
   * @param chainId
   * @returns
   */
  private static bindChain(
    chainId: number,
  ): 'binance-smart-chain' | 'polygon-pos' | 'ethereum' {
    if (chainId === 56) return 'binance-smart-chain';
    if (chainId === 137) return 'polygon-pos';
    return 'ethereum';
  }
}

export default CoingeckoService;
