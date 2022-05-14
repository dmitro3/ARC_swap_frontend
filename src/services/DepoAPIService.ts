/* eslint-disable */
import Axios, { AxiosError, AxiosInstance } from 'axios';
import { ILiquidityProvision } from '../interfaces/ILiquidityProvision';
import { IOrder } from '../interfaces/IOrder';
import { IUser } from '../interfaces/IUser';
import { SupportedAPIPools } from '../interfaces/NetworkPools';
import { SubgraphPair } from '../interfaces/Subgraphs';
import { SubgraphPools } from '../interfaces/Subgraphs';

/**
 * This is the default service to communicate with DePo Platform webservice.
 *
 * API routing is based in `.env` file by `REACT_APP_DEPO_WEBSERVICE` constant.
 *
 * @static `authenticate` :: `IUser | IResponse`
 * @static `updateUser` :: `any | null | IResponse`
 * @static `getUser` :: `IUser | IResponse`
 *
 * ```ts
 * import { DepoAPIService } from '@/services/DepoAPIService';
 * import { IUser } from '@/interfaces/IUser';
 *
 * async function authenticate(walletId: string): Promise<IUser> {
 *  const authenticate = await DepoAPIService.authenticate(walletId);
 *
 *  if('error' in authenticate) {
 *      console.error(autenticate.error);
 *      return false;
 *  }
 *  return authenticate;
 * }
 * ```
 *
 * @author [Pollum](pollum.io)
 * @since v0.1.0
 */
export class DepoAPISevice {
  /**
   * @var api Axios instance for the current api
   * In order to use the variables set in Vercel, uncomment the line below baseURL
   */
  private static api: AxiosInstance = Axios.create({
    baseURL:
      process.env.REACT_APP_DEPO_WEBSERVICE ?? 'https://staging.api.arc.market',
  });

  /**
   * Authenticate the user into the platform using its wallet id.
   *
   * If the wallet id is not found, the server will create an instance
   * for the current wallet.
   *
   * @param walletId Ethereum wallet id
   * @returns
   */
  static async authenticate(
    walletId: string,
    signature: string,
  ): Promise<IUser | any> {
    try {
      const result = await this.api.post('ws/v2/user/auth', {
        walletId,
        signature,
      });

      localStorage.setItem('@app:user', JSON.stringify(result.data.user));
      localStorage.setItem('@app:jwt', result.data.jwt);

      const verified = await this.verifyAuthorization(result.data.jwt);
      if (verified) {
        return result.data.user as IUser;
      }
      throw new Error('Invalid signature.');
    } catch (error) {
      return error;
    }
  }

  /**
   * Requests a signature message from the server
   * @param walletId
   * @returns
   */
  static async getSigningMessage(walletId: string) {
    try {
      const result = await this.api.get(`ws/v2/user/${walletId}/auth-message`);
      return result.data.message;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sends a request to the webservice to update user's preferences and data.
   *
   * @param user
   * @param walletId
   * @returns
   */
  static async updateUser(user: IUser, walletId: string): Promise<any | false> {
    try {
      const result = await this.api.put(`ws/v2/user/${walletId}`, user);
      return result.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sends a request to the webservice to get the current user details
   * including `wallets` and `preferences`
   *
   * @param walletId
   * @returns
   */
  static async getUser(walletId: string): Promise<IUser | false> {
    try {
      const result = await this.api.get(`ws/v2/user/${walletId}`);
      return result.data as IUser;
    } catch (error) {
      return false;
    }
  }

  /**
   * Adds a liquidity pool to the user
   * @param user The current user instance
   * @param pool the new pool
   * @returns
   */
  static async addLiquidityPool(
    user: IUser,
    pool: SubgraphPair,
    protocol: keyof SupportedAPIPools,
    chainId: number,
  ) {
    const provisionData: ILiquidityProvision = {
      poolContractAddress: pool.id,
      protocol,
      token0: pool.token0,
      token1: pool.token1,
      chainId,
    };
    if (!user.liquidityProvisions)
      user.liquidityProvisions = [] as ILiquidityProvision[];
    if (
      user.settings?.defaultWallet &&
      !user.liquidityProvisions.find(
        (provision: any) =>
          provision.poolContractAddress.toLowerCase() === pool.id &&
          chainId === provision.chainId,
      )
    ) {
      try {
        user.liquidityProvisions.push(provisionData);
        const result = await this.updateUser(
          { liquidityProvisions: [...user.liquidityProvisions] },
          user.settings?.defaultWallet,
        );
        if (result) {
          localStorage.setItem('@app:user', JSON.stringify(user));
          return user;
        }
        throw new Error("Couldn't update user.");
      } catch (error) {
        const err = error as Error;
        throw new Error(err.message);
      }
    } else {
      throw new Error('Liquidity pool already exists.');
    }
  }

  /**
   * Sends a request to the webservice to remove an enchange key from the database.
   *
   * @param walletId
   * @param exchangeId
   * @param apiKey
   */
  static async removeApiKey(
    walletId: string,
    exchangeId: string,
    apiKey: string,
  ): Promise<any | false> {
    try {
      const result = await this.api.delete(
        `ws/v2/user/${walletId}/${exchangeId}/${apiKey}`,
      );
      return result.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sends a request to the webservice to get order book from ccxt.
   *
   * @param exchangeName
   * @param symbol
   */
  static async getOrderBook(
    exchangeName: string,
    symbol: string,
  ): Promise<any | null> {
    try {
      const result = await this.api.get(
        `ws/v2/marketDetails/${exchangeName.replace('.', '')}/${symbol}`,
      );
      return result.data.response;
      // as IOrderBook;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to get order book from all exchanges.
   *
   * @param symbol
   * @param marketType
   */
  static async getAllOrderBook(
    symbol: string,
    marketType: string,
  ): Promise<any | null> {
    try {
      const response = await this.api.get(
        `ws/v2/marketDetails/orderBook/${marketType}/${symbol}`,
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
     * Sends a request to the webservice to get orders ( open , history ).
            /**
     * Sends a request to the webservice to get market from ccxt.
     *
     * @param exchangeName
     * @param marketType
     * @param symbol
     */

  static async getUserOrders(
    walletId: string,
    marketType: string,
    symbol: string,
  ): Promise<any | null> {
    try {
      const result = await this.api.get(
        `ws/v2/ordersBook/${walletId}/${marketType}/${symbol}`,
      );
      // const result = await axios.get(`http://0.0.0.0:3001/ws/v2/ordersBook/${walletId}/${symbol}`);
      return result.data.response;
      // as IOrderBook;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to get CEX Balance.
   *
   * @param walletId
   * @param marketType
   */

  static async getUserCEXBalance(
    walletId: string,
    marketType: string,
  ): Promise<any | null> {
    try {
      await this.verifyAuthorization();
      const result = await this.api.get(
        `ws/v2/user/cexBalance/${walletId}/${marketType}`,
      );
      return result.data.response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to get all user open orders.
   *
   * @param walletId
   */

  static async getAllUserOpenOrders(walletId: string): Promise<any | null> {
    try {
      const result = await this.api.get(`ws/v2/user/cexOpenOrders/${walletId}`);
      return result.data.response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to get market by symbol (quote)
   *
   * @param exchangeName
   * @param symbol
   */
  static async getMarketBySymbol(
    exchangeName: string,
    symbol: string,
  ): Promise<any | null> {
    try {
      const result = await this.api.get(
        `ws/v2/market/${exchangeName.replace('.', '')}/${symbol}`,
      );
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to get all markets by symbol (quote)
   *
   * @param symbol
   * @param marketType
   */

  static async getAllMarketsBySymbol(
    symbol: string,
    marketType: string,
  ): Promise<any | null> {
    try {
      const result = await this.api.get(
        `ws/v2/market/allmarkets/${symbol}/${marketType}`,
      );
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Sends a request to the webservice to create an order market from ccxt.
   *
   * @param exchangeName
   * @param marketType
   * @param order
   * @returns
   */

  static async sendOrder(
    exchangeName: string,
    marketType: string,
    order: IOrder,
  ): Promise<any | null> {
    try {
      const result = await this.api.post(
        `ws/v2/order/${exchangeName.replace('.', '')}`,
        {
          marketType,
          order,
        },
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Sends a request to the webservice to cancel an order market from ccxt.
   *
   * @param exchangeName
   * @param orderId
   * @returns
   */

  static async cancelOrder(
    walletId: string,
    exchangeName: string,
    orderId: string,
    symbol: string,
  ): Promise<any | null> {
    try {
      const result = await this.api.post(
        `ws/v2/order/cancel/${walletId}/${exchangeName.replace(
          '.',
          '',
        )}/${orderId}/${symbol}`,
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Sends a request to the webservice to create an order market from ccxt.
   *
   * @param type
   * @param exchangeName
   * @param order
   * @returns
   */

  static async getMarketOverviewData(
    type: string,
    exchangeName: string,
    quote: string,
  ): Promise<any | null> {
    try {
      const result =
        type === 'spot'
          ? await this.api.get(
              `/ws/v2/mktOverview/spot/${exchangeName.replace(
                '.',
                '',
              )}/${quote}`,
            )
          : await this.api.get(
              `/ws/v2/mktOverview/future/${exchangeName.replace(
                '.',
                '',
              )}/${quote}`,
            );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Sends a request to the webservice to create an order market from ccxt.
   *
   * @param type
   * @param symbol
   * @returns
   */

  static async getSymbolAllExchanges(
    type: string,
    symbol: string,
  ): Promise<any | null> {
    try {
      const formatedSymbol = symbol.replace('/', '-');
      // const result = type === 'spot' ?  await this.api.get(
      //   `/ws/v2/mktOverview/overview/spot/${formatedSymbol}`,
      // ) : await this.api.get(
      //   `/ws/v2/mktOverview/overview/future/${formatedSymbol}`,
      // )
      const result = await this.api.get(
        `/ws/v2/mktOverview/overview/${type}/${formatedSymbol}`,
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Gets the price of the symbol in USDT
   * @param symbol
   */
  static async getPriceUSDT(symbol: string) {
    try {
      const result = await this.api.get(
        `ws/v2/tokenPrice/${symbol.toUpperCase()}`,
      );
      return result.data.price;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.response?.data.status);
    }
  }

  /**
   * Gets the price of the symbol with address in USDT
   * @param symbol
   */
  static async getPriceUSDTWithAddress(symbol: string, address: string) {
    try {
      const result = await this.api.get(
        `ws/v2/tokenPrice/${symbol.toUpperCase()}/${address.toLowerCase()}`,
      );
      return result.data.price;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.response?.data.status);
    }
  }

  /**
   * Fetch an array of prices in USDT
   * @param array Array of symbols
   */
  static async getPricesUSDT(quotes: string[], addresses: string[]) {
    try {
      const result = await this.api.post(`ws/v2/tokenPrice`, {
        quotes,
        addresses,
      });
      return result.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.response?.data.status);
    }
  }

  /**
   * Gets the price of the trade in the exchanges
   * @param marketType
   * @param symbolToCompare
   * @param type
   * @param userPriceUnit
   * @param userSize
   */
  static async getExchangeTradeCompare(
    marketType: string,
    symbolToCompare: string,
    type: string, // limit or market
    userPriceUnit: string,
    userSize: string,
  ) {
    try {
      const result = await this.api.post('/ws/v2/marketDetails/compare', {
        marketType,
        symbol: symbolToCompare,
        type,
        userPriceUnit,
        userSize,
      });
      return result.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(err.response?.data.status);
    }
  }
  /**
   * Checks in the server if the authorization token is valid
   * and set default authorization headers.
   *
   * @param jwt the jwt token
   * @returns
   */
  static async verifyAuthorization(jwt?: string): Promise<boolean> {
    let authorization: string | undefined;
    if (jwt) {
      authorization = jwt;
    } else {
      const hasStoredJwt = localStorage.getItem('@app:jwt');
      if (hasStoredJwt) {
        authorization = hasStoredJwt;
      }
    }
    if (authorization) {
      try {
        await this.api.get(`ws/v2/user/auth`, {
          headers: {
            authorization: `Bearer ${authorization}`,
          },
        });
        this.api.defaults.headers.authorization = `Bearer ${authorization}`;
        return true;
      } catch (error) {
        this.logout();
      }
    }
    return false;
  }

  static async getLiquidityPools(
    chainId: number,
    protocol: keyof SupportedAPIPools,
  ): Promise<SubgraphPools> {
    try {
      const result = await this.api(`/ws/v2/pool/${chainId}/${protocol}`);
      return result.data.pools as SubgraphPools;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(
        err.response?.data.status ??
          'Something bad happened during this request.',
      );
    }
  }

  static async fetchGateioCandlesticks(currencyPair: string): Promise<any> {
    try {
      const result = await this.api(
        `/ws/v2/mktOverview/candlesticks/gateio/${currencyPair}`,
      );
      return result.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new Error(
        err.response?.data.status ??
          'Something bad happened during this request.',
      );
    }
  }

  static logout() {
    localStorage.removeItem('@app:jwt');
    localStorage.removeItem('@app:user');
  }

  static async wertConvertUSDToETH(amount: number) {
    try {
      const { data } = await Axios.post(
        'https://widget.wert.io/api/v3/partners/convert',
        { from: 'ETH', to: 'USD', amount },
        { headers: { 'X-Partner-ID': '01FR5T0F10N01MTZXQJVKAZEXR' } },
      );
      if (data.status === 'ok') {
        return data.body;
      }
      return null;
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  static async signWertData(params: any) {
    const { data } = await this.api.post('ws/v2/sign', params);
    return data;
  }
}
