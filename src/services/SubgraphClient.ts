import AxiosGQL from './AxiosGQL';
import { QueryObj, SubgraphPair, SubgraphPools } from '../interfaces/Subgraphs';
import { SupportedAPIPools } from '../interfaces/NetworkPools';
import endpointGuesser from '../utility/subgraphs/endpoint-guesser';

class SubgraphClient extends AxiosGQL {
  private QueryBuilder: QueryObj;

  private protocol: string;

  constructor(
    protocol: keyof SupportedAPIPools = 'uniswap-v2',
    chainId: number,
  ) {
    const guesser = endpointGuesser(protocol, chainId);
    super(guesser.endpoint);
    this.QueryBuilder = guesser.QueryBuilder;
    this.protocol = protocol;
  }

  getPools(page = 0): Promise<SubgraphPools> {
    return this.executeQuery(this.QueryBuilder.pools(page));
  }

  async getPair(contractAddress: string): Promise<SubgraphPair> {
    const result = await this.executeQuery(
      this.QueryBuilder.pair(contractAddress),
    );
    if (result) {
      return result.pair;
    }
    throw new Error('Pair not found.');
  }

  async getDailyVolume(contractAddress: string): Promise<string[]> {
    const result = await this.executeQuery(
      this.QueryBuilder.pair(contractAddress),
    );

    let dailyVolume: string[] = [];
    if (this.protocol === 'sushiswap' && Array.isArray(result.pair?.hourData)) {
      dailyVolume = result.pair.hourData.map(
        (volume: any) => Number(volume.volumeUSD).toFixed(1) ?? 0,
      );
    } else if (
      this.protocol === 'uniswap-v2' &&
      Array.isArray(result.pairDayDatas)
    ) {
      dailyVolume = result.pairDayDatas.map(
        (volume: any) => Number(volume.dailyVolumeUSD).toFixed(1) ?? 0,
      );
    }
    return dailyVolume;
  }

  getProtocol(): string {
    return this.protocol;
  }
}

export default SubgraphClient;
