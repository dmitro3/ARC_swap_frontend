import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import contracts from 'config/constants/contracts';
import farmsConfig from 'config/constants/farms';
import depoMasterChefABI from 'utility/abi/DepoMasterChef.json';
import ArcMasterChefABI from 'utility/abi/ArcMasterChef.json';
import standardAbiEth from 'utility/abi/standard-abi.eth';
import UniswapV2LpABI from 'utility/abi/uniswapv2-lp-abi';

import {
  getDepoMasterChefAddress,
  getArcMasterChefAddress,
} from 'utility/addressHelpers';
import { DepoAPISevice } from '../../services/DepoAPIService';
import multicall from '../../utility/multicall';

const BLOCK_PER_DAY = 6500;
const BLOCK_PER_YEAR = 365 * BLOCK_PER_DAY;

const fetchFarms = async (web3Provider: string, chainId: number) => {
  const data = await Promise.all(
    farmsConfig.map(async (farmConfig) => {
      const { type, version } = farmConfig;
      const abi = type === 'ARC' ? ArcMasterChefABI : depoMasterChefABI;
      const address =
        type === 'ARC'
          ? getArcMasterChefAddress(chainId)
          : getDepoMasterChefAddress(chainId, version);
      const perBlockName = type === 'ARC' ? 'arcPerBlock' : 'depoPerBlock';
      const [info, totalAllocPoint, perBlock] = await multicall(
        abi,
        [
          {
            address,
            name: 'poolInfo',
            params: [farmConfig.pid],
          },
          { address, name: 'totalAllocPoint' },
          { address, name: perBlockName },
        ],
        web3Provider,
        chainId,
      );
      const web3 = new Web3(web3Provider);
      const api: AxiosInstance = axios.create({
        baseURL: 'https://api.coingecko.com/api/v3/',
        withCredentials: false,
      });
      const url = 'coins/ethereum';
      let ethPrice = 1;
      try {
        const result = await api.get(url);
        ethPrice = result?.data?.market_data?.current_price.usd ?? '';
      } catch (error) {
        ethPrice = 1;
      }
      let lpWorth = 0;
      let total = 0;
      let apy;
      const tokenContract = new web3.eth.Contract(
        standardAbiEth as AbiItem[],
        farmConfig.tokenAddresses[chainId],
      );
      if (
        farmConfig.lpAddress[chainId] === (contracts as any).arcToken[chainId]
      ) {
        const quoteContract = new web3.eth.Contract(
          standardAbiEth as AbiItem[],
          farmsConfig[4].quoteTokenAddresses[chainId],
        );
        const tokenBalance = await tokenContract.methods
          .balanceOf(farmsConfig[4].lpAddress[chainId])
          .call();
        const quoteBalance = await quoteContract.methods
          .balanceOf(farmsConfig[4].lpAddress[chainId])
          .call();
        const lockedTokenBal = await tokenContract.methods
          .balanceOf(address)
          .call();

        lpWorth = (quoteBalance / tokenBalance) * (ethPrice ?? 1);
        total = lockedTokenBal * lpWorth;
        apy = new BigNumber(BLOCK_PER_YEAR)
          .multipliedBy(perBlock)
          .multipliedBy(new BigNumber(info.allocPoint._hex))
          .dividedBy(new BigNumber(totalAllocPoint[0]._hex))
          .dividedBy(lockedTokenBal)
          .multipliedBy(new BigNumber(100));
      } else {
        const quoteContract = new web3.eth.Contract(
          standardAbiEth as AbiItem[],
          farmConfig.quoteTokenAddresses[chainId],
        );
        const lpContract = new web3.eth.Contract(
          UniswapV2LpABI.abi as AbiItem[],
          farmConfig.lpAddress[chainId],
        );
        const lpTotalSupply = await lpContract.methods.totalSupply().call();
        const totalDepo = await lpContract.methods.balanceOf(address).call();
        const tokenBalance = await tokenContract.methods
          .balanceOf(farmConfig.lpAddress[chainId])
          .call();
        const quoteBalance = await quoteContract.methods
          .balanceOf(farmConfig.lpAddress[chainId])
          .call();
        const lockedTokenBal = await lpContract.methods
          .balanceOf(address)
          .call();
        const tokenPrice = (quoteBalance / tokenBalance) * (ethPrice ?? 1);

        lpWorth =
          ((2 * quoteBalance) / lpTotalSupply) *
          (farmConfig.quoteTokenPrice ?? 1);
        total = lpWorth * totalDepo;
        apy = new BigNumber(BLOCK_PER_YEAR)
          .multipliedBy(perBlock)
          .multipliedBy(new BigNumber(info.allocPoint._hex))
          .dividedBy(new BigNumber(totalAllocPoint[0]._hex))
          .multipliedBy(new BigNumber(tokenPrice))
          .dividedBy(lockedTokenBal)
          .dividedBy(new BigNumber(lpWorth))
          .multipliedBy(new BigNumber(100));
      }

      const allocPoint = new BigNumber(info.allocPoint._hex);
      const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint));
      const poolTokenPrice = await DepoAPISevice.getPriceUSDTWithAddress(
        farmConfig.lpSymbol,
        farmConfig.lpAddress[chainId].toLowerCase(),
      );
      return {
        ...farmConfig,
        poolWeight: poolWeight.toNumber(),
        multiplier: `${allocPoint.toString()}X`,
        allocPoint: parseFloat(allocPoint.toString()),
        depositFeeBP: info.depositFeeBP,
        harvestInterval: parseInt(info.harvestInterval, 10),
        lpWorth,
        apy,
        perBlock: new BigNumber(perBlock).toNumber(),
        totalLiquidity: total,
        poolTokenPrice,
      };
    }),
  );
  return data;
};

export default fetchFarms;
