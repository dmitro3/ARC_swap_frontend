import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import farmsConfig from '../../config/constants/jungleFarms';
import jungleABI from '../../utility/abi/ArcJungle.json';
import standardAbiEth from '../../utility/abi/standard-abi.eth';
import { getAddress } from '../../utility/addressHelpers';
import multicall from '../../utility/multicall';
import { DepoAPISevice } from '../../services/DepoAPIService';

const BLOCK_PER_DAY = 6500;
const BLOCK_PER_YEAR = 365 * BLOCK_PER_DAY;

const fetchJungleFarms = async (web3Provider: string, chainId: number) => {
  const data = await Promise.all(
    farmsConfig.map(async (farmConfig) => {
      const address = getAddress(farmConfig.contractAddress, chainId);
      const [rewardPerBlock, stakedTokenTransferFee] = await multicall(
        jungleABI,
        [
          { address, name: 'rewardPerBlock' },
          { address, name: 'stakedTokenTransferFee' },
        ],
        web3Provider,
        chainId,
      );
      const api: AxiosInstance = axios.create({
        baseURL: 'https://api.coingecko.com/api/v3/',
        withCredentials: false,
      });
      const url1 = `coins/${farmConfig.lockedTokenId}`;
      const url2 = `coins/${farmConfig.rewardTokenId}`;

      let lokedTokenPrice = 1;
      try {
        const result1 = await api.get(url1);
        lokedTokenPrice = result1?.data?.market_data?.current_price.usd ?? '';
      } catch {
        lokedTokenPrice = 1;
      }

      let rewardTokenPrice = 1;
      try {
        const result2 = await api.get(url2);
        rewardTokenPrice = result2?.data?.market_data?.current_price.usd ?? '';
      } catch {
        rewardTokenPrice = 0.05;
      }

      const web3 = new Web3(web3Provider);
      const tokenContract = new web3.eth.Contract(
        standardAbiEth as AbiItem[],
        getAddress(farmConfig.lockedAddress, chainId),
      );
      const lockedTokenBal = await tokenContract.methods
        .balanceOf(getAddress(farmConfig.contractAddress, chainId))
        .call();
      const total = lockedTokenBal * lokedTokenPrice;
      const apy = new BigNumber(BLOCK_PER_YEAR)
        .multipliedBy(rewardPerBlock)
        .dividedBy(
          new BigNumber(10).pow(new BigNumber(farmConfig.rewardDecimal)),
        )
        .multipliedBy(new BigNumber(rewardTokenPrice))
        .dividedBy(lockedTokenBal)
        .dividedBy(new BigNumber(lokedTokenPrice))
        .multipliedBy(
          new BigNumber(10).pow(new BigNumber(farmConfig.lockedDecimal)),
        )
        .multipliedBy(new BigNumber(100));

      const poolTokenPrice = await DepoAPISevice.getPriceUSDTWithAddress(
        farmConfig.lpSymbol,
        farmConfig.lockedAddress[chainId].toLowerCase(),
      );

      return {
        ...farmConfig,
        allocPoint: 1,
        apy,
        stakedTokenTransferFee: stakedTokenTransferFee / 100,
        totalLiquidity: total,
        poolTokenPrice,
      };
    }),
  );
  return data;
};

export default fetchJungleFarms;
