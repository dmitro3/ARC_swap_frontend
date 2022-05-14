/* eslint-disable */
import Axios from "axios";

/**
 * This is the default service to comminicate with Etherscan API.
 * 
 * @see [Etherscan](https://etherscan.io/apis)
 * 
 * @static `getABI` :: any
 * 
 * ```ts
 * import { EtherscanService } from '@/services/EtherscanService';
 * 
 * async function getTokenAbi() {
 *      const contractAddress: string = "0xeeeeeeeeeeeeeeeeeeeeeee";
 *      const ABI = await EtherscanService.getABI(contractAddress);
 *      if(ABI){
 *          // do something     
 *      }else{
 *          console.log("ABI not found for this address.");
 *      }
 * }
 * 
 * ```
 * 
 * @author [Pollum](pollum.io)
 * @since v0.1.0
 */
export class EtherscanService {
    static api = Axios.create({ baseURL: "https://api.etherscan.io/api" })

    /**
     * Fetch a contract ABI from Etherscan API
     * @param contractAddress 
     */
    static async getABI(contractAddress: string) {
        try {
            const url = `?module=contract&action=getabi&address=${contractAddress}`;
            const abi = await this.api.get(url);
            if (typeof abi.data.result === 'string') {
                return JSON.parse(abi.data.result);
            }
            return abi.data.result;
        } catch (error) {
            return null;
        }
    }
}
