/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { IABI } from '../interfaces/IABI';
import { IToken } from '../interfaces/IToken';
import { EtherscanService } from './EtherscanService';
import standardAbi from '../utility/abi/standard-abi.eth';
import { __debounce } from '../utility/debounce';

export default class Web3ClientService {
  client: Web3;

  Contract;

  ethAddr?: string;

  static abi: IABI = {};

  constructor(providerUrl: string, ethAddr?: string) {
    this.client = new Web3(new Web3.providers.HttpProvider(providerUrl));
    this.Contract = this.client.eth.Contract;
    this.ethAddr = ethAddr;
  }

  async getABI(token: IToken) {
    if (!Web3ClientService.abi[token.symbol]) {
      const abi = await EtherscanService.getABI(token.address);
      Web3ClientService.abi[token.symbol] = abi;
    }
    return Web3ClientService.abi[token.symbol];
  }

  async getBalanceEth() {
    let balance = '0';
    if (this.ethAddr) {
      balance = await this.client.eth.getBalance(this.ethAddr);
    }
    const parsedBalance = new BigNumber(+balance / 10 ** 18).toFixed(8);
    return parsedBalance;
  }

  async getBalance(token: IToken): Promise<string | null | number> {
    try {
      if (token.symbol.match(/ETH|wETH/gi)) {
        return await this.getBalanceEth();
      }
      const abi = await this.getABI(token);
      if (abi && typeof abi === 'object') {
        const balance = await new this.Contract(abi, token.address).methods
          .balanceOf(this.ethAddr)
          .call();
        const { decimals } = token;
        const parsedBalance = this.parseBalance(balance, decimals);
        return +parsedBalance;
      }
      return 0;
    } catch (error) {
      return null;
    }
  }

  async getChainId() {
    const response = await this.client.eth.net.getId();
    return response;
  }

  async getGasPriceOnWeb3(): Promise<string> {
    let gasPrice = '0';
    await this.client.eth.getGasPrice((err, gas) => {
      if (!err) {
        gasPrice = this.client.utils.fromWei(gas, 'gwei');
      }
    });

    return gasPrice;
  }

  /**
   * Get balance using batch.
   *
   * This method provides batch requesting to perform lots of balance requests at once.
   *
   * @param tokens list of tokens
   * @param nativeCurrency the native currency symbol
   * @returns an object indexed by the currency symbol `( balance.ETH, balance.UNI, etc. )`
   */
  batchGetBalance(tokens: IToken[], nativeCurrency = 'ETH'): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (this.ethAddr) {
        const batch = new this.client.BatchRequest();
        const balance = {} as any;
        try {
          for (const token of tokens) {
            if (token.symbol !== nativeCurrency) {
              const contract = new this.Contract(standardAbi, token.address);
              const call = contract.methods
                .balanceOf(this.ethAddr)
                .call.request(
                  { from: this.ethAddr },
                  (err: any, result: any) => {
                    if (typeof result === 'string') {
                      const bn = this.client.utils.toBN(result).toString();
                      const parsedBalance = this.parseBalance(
                        bn,
                        token.decimals,
                      );
                      balance[token.address] = parsedBalance;
                    } else {
                      const parsedBalance = this.parseBalance(
                        '0',
                        token.decimals,
                      );
                      balance[token.address] = parsedBalance;
                    }
                    __debounce(
                      () => {
                        resolve(balance);
                      },
                      250,
                      'batchGetBalanceResolver',
                    );
                  },
                );
              batch.add(call);
            }
          }
          batch.execute();
        } catch (error) {
          reject(error);
        }
      } else {
        reject(
          new Error(
            "Web3ClientService::batchGetBalance: Can't perform operation without user eth address.",
          ),
        );
      }
    });
  }

  private parseBalance(
    value: string,
    tokenDecimals: number,
    significantDigits = 8,
  ): String {
    const strBalance = new BigNumber(+value / 10 ** tokenDecimals).toFixed(
      tokenDecimals,
    );
    const balanceParts = strBalance.split('.');
    const decimalPart = balanceParts[1]
      ? balanceParts[1].substr(0, significantDigits)
      : '00000000';
    const parsedBalance = [balanceParts[0], decimalPart].join('.');
    return parsedBalance;
  }
}
