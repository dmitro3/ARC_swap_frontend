import IChain from '../../interfaces/IChain';
import chainlist from './chainlist';

/**
 * Provides methods to deal with Ethereum chain properties and network switching/creation
 *
 * @var find provides methods to find a chain in the default chain list such as `byName` and `byId`
 * @var search provides methos to search chains in the default chain list such as `byName` and `byAny`
 *
 * @method find.byName(chainName: string)
 * @method find.byId(chainId: number)
 * @method search.byName(chainName: string)
 * @method search.byAny(searchStr: string)
 * @method changeNetwork(network: IChain)
 * @method createNetwork(network: IChain)
 * @
 *
 * ### Usage
 * ```ts
 * import ChainHelper from '~/util/ChainHelper';
 *
 * const PolygonOpts = ChainHelper.find.byName('Polygon') // Object | null
 * const RinkebyOpts = ChainHelper.find.byId(4) // Object | null
 * const PolygonNetworks = ChainHelper.search.byName('Polygon') // Array
 * const NetworksThatMatchETH = ChainHelper.search.byAny('ETH') // Array
 *
 * async function changeNetworkToRinkeby() {
 *  try{
 *    await ChainHelper.changeNetwork(RinkebyOpts);
 *  }catch(error){
 *    // handle
 *  }
 * }
 *
 * async function createPolygonNetwork() {
 *  try{
 *    await ChainHelper.createNetwork(PolygonNetworks[0]);
 *  }catch(error){
 *    // handle
 *  }
 * }
 *
 * changeNetworkToRinkeby();
 * createPolygonNetwork();
 * ```
 *
 * @author [Pollum](pollum.io)
 * @since 0.2.1;
 * @version 1.0.0
 */
class ChainHelper {
  /**
   * Set of methods to find a chain
   *
   * @method byId(chainId) find a chain by its id
   * @method byName(chainName) find a chain by its name
   * @var {Object} find
   */
  static find = {
    /**
     * Returns the chain configuration object based in its ID.
     * @param chainId the chain id. 1 for Mainner, 4 to Rinkeby, etc.
     */
    byId(chainId: number): IChain | undefined {
      return chainlist.find(
        (item) => item.chainId === `0x${chainId.toString(16)}`,
      );
    },

    /**
     * Returns the chain configuration object based in its name.
     * @param chainName the chain name
     */
    byName(chainName: string): IChain | undefined {
      return chainlist.find((item) => item.chainName === chainName);
    },
  };

  /**
   * Set of methods to filter or search chains
   *
   * @method byName(str) filter chains by chain names
   * @method byAny(str) filter chain using various fields
   * @var {Object} search
   */
  static search = {
    /**
     * Searches the chain list in order to get one or more matching chains using
     * a search string (`str`) to find by name
     *
     * @param str the search string
     * @returns a set of chains or an empty array
     */
    byName(str: string): IChain[] {
      const rgx = new RegExp(str, 'gim');
      return chainlist.filter((item) => item.chainName.match(rgx));
    },

    /**
     * Searches the chain list in orde to get one or more matching chains using
     * a search string to search for every relevant field, they are:
     *  - Chain Name
     *  - ChainId
     *  - Symbol
     *  - Currency name
     *
     * Note that this process can be quite overaloading depending on the search string.
     *
     * @param str the search string
     * @return a set of chains or an empty array
     */
    byAny(str: string): IChain[] {
      const rgx = new RegExp(str, 'gim');
      return chainlist.filter(
        (item) =>
          item.chainName.match(rgx) ||
          item.nativeCurrency.symbol.match(rgx) ||
          item.nativeCurrency.name.match(rgx) ||
          `${item.chainId}` === str,
      );
    },
  };

  /**
   * Changes or create the target network
   *
   * @see [Chainlist](https://chainlist.org) to get a list of supported networks
   *
   * @param {*} network the Ethereum network to change
   *
   * @returns {Promise<void>}
   */
  static async changeNetwork(network: IChain): Promise<void> {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Try to switch networks
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
      }
    } catch (error) {
      // If an error occour, then try to add the network
      const err = error as Error;
      if (err.message.includes('Unrecognized')) {
        await ChainHelper.createNetwork(network);
      } else {
        throw new Error(err.message);
      }
    }
  }

  /**
   * Requests Metamask to add the selected network to the list of networks.
   *
   * @param {*} network
   *
   * @returns {Promise<void>}
   */
  static async createNetwork(network: IChain): Promise<void> {
    if (window.ethereum && window.ethereum.isMetaMask) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [network],
      });
    } else {
      throw new Error('Metamask not found.');
    }
  }

  /**
   * Return the full chain list
   */
  static getChainlist(): IChain[] {
    return chainlist;
  }

  static getBridgeChains(): IChain[] {
    return chainlist.slice(0, 3);
  }
}

export default ChainHelper;
