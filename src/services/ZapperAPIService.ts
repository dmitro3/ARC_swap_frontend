/* eslint-disable  */
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import env from '../config/global-env';
import { IPool, IPoolToken } from '../interfaces/IPool';
import { IToken } from '../interfaces/IToken';
import { SupportedAPINetworks, SupportedAPIPools } from '../interfaces/NetworkPools';

/**
 * This is the default class to communicate with the [SupportedAPI](https://api.zapper.fi/).
 *
 * @method {IPool[]} getPoolsStats(poolName, contractAddr, tokenListToFilter)
 * @deprecated v0.2.0
 */
export class SupportedAPIService {
  network: keyof SupportedAPINetworks = 'ethereum';
  api: AxiosInstance;

  constructor(network: keyof SupportedAPINetworks | number) {
    this.setNetwork(network);
    this.api = axios.create({
      baseURL: env.API.ZAPPER.URL,
      params: {
        api_key: env.API.ZAPPER.APIKEY,
        network: this.network,
      },
      paramsSerializer: (params) => qs.stringify(params),
    });
  }

  /**
   * Updates the network or chainId
   *
   * #### Currently supported:
   *  - 1 ethereum
   *  - 56 binance-smart-chain
   *  - 137 polygon
   *
   * @param network the network name or a chainid
   */
  setNetwork(network: keyof SupportedAPINetworks | number) {
    if (typeof network === 'number') {
      this.network = this.matchNetworkByChainId(network);
    } else {
      this.network = network;
    }
  }

  /**
   * The the supported pools from Zapper API
   *
   * If a set of tokens is given, then only will be returned pools that contains the tokens that
   * are included in the tokens list.
   *
   * @param tokens which token pools to return
   */
  async getPoolsStats(
    poolName: keyof SupportedAPIPools,
    tokens?: IToken[],
  ): Promise<IPool[]> {
    try {
      const result = await this.api.get(`/pool-stats/${poolName}`);
      if (tokens) {
        return this.filterPools(tokens, result.data);
      }
      return result.data as IPool[];
    } catch (error) {
      return [] as IPool[];
    }
  }

  private filterPools(filters: IToken[], data: IPool[]): IPool[] {
    return data.filter((item: IPool) => {
      let validPair: boolean[] = [];
      item.tokens.forEach((_item: IPoolToken) => {
        validPair.push(
          !!filters.find((token) => _item.symbol === token.symbol),
        );
      });
      return validPair.every((item) => item === true);
    });
  }

  private matchNetworkByChainId(chainId: number): keyof SupportedAPINetworks {
    switch (chainId) {
      case 1:
        return 'ethereum';
      case 56:
        return 'binance-smart-chain';
      case 137:
        return 'polygon';
      default:
        return 'ethereum';
    }
  }
}
