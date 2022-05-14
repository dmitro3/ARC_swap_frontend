import { ILiquidityNetwork } from '../interfaces/NetworkLiquidityProtocol';
import SupportedNetworks from '../interfaces/SupportedNetworks';
import { SupportedAPIPools } from '../interfaces/NetworkPools';
import protocols from '../utility/liquidity-protocols/protocols';

const env = {
  CHAIN_ID: 1 as keyof SupportedNetworks,
  CURRENT_WEB3_PROVIDER:
    'https://mainnet.infura.io/v3/e67a2556dede4ff2b521a375a1905f8b',
  INFURA: {
    URL: process.env['REACT_APP_INFURA_URL'],
    KEY: process.env['REACT_APP_INFURA_KEY'],
  },
  /**
   * Find the router and factory contracts for a given protocol.
   *
   * The protocol must be zapper compatible and should be listed in the
   * protocols list.
   *
   * @param chainId
   * @param protocol
   * @returns
   */
  CONTRACTS(
    chainId: keyof SupportedNetworks,
    protocol: keyof SupportedAPIPools,
  ): ILiquidityNetwork {
    const hasProtocol = protocols.find(
      (item) =>
        item.parsedName === protocol &&
        item.networks.find(
          (network) => +parseInt(network.chainId, 16) === chainId,
        ),
    );
    if (hasProtocol) {
      const network = hasProtocol.networks.find(
        (item) => +parseInt(item.chainId, 16) === chainId,
      );
      if (network) {
        return network;
      }
    }

    throw new Error(
      `Protocol ${protocol} not supported for network id ${chainId}`,
    );
  },

  API: {
    DEPO: process.env['REACT_APP_API_DEPO'],
    ETHERSCAN: process.env['REACT_APP_API_ETHERSCAN'],
    COINGECKO: process.env['REACT_APP_API_COINGECKO'],
    ZAPPER: {
      URL: process.env['REACT_APP_API_ZAPPER_URL'],
      APIKEY: process.env['REACT_APP_API_ZAPPER_APIKEY'],
    },
  },
  COINGECKO: process.env.REACT_APP_COINGECKO_API,
};
export default env;
