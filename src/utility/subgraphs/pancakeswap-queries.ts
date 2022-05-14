import { QueryObj } from '../../interfaces/Subgraphs';

const poolAttributes = `
    id,
    token0Price,
    token1Price,
    reserve0,
    reserve1,
    reserveUSD,
    liquidityProviderCount,
    volumeToken0,
    volumeToken1,
    volumeUSD
    `;

const pairAttributes = `
    token0 {
        id,
        symbol,
        name,
        decimals,
        totalSupply,
    },
    token1 {
        id,
        symbol,
        name,
        decimals,
        totalSupply,
        tradeVolume,
    },
    hourData{
      volumeUSD
    }`;
const PancakeQueries: QueryObj = {
  pools: (page = 0): string => `
    query {
        pairs (${page > 0 ? `skip: "${page * 100}",` : ''} where: {
            reserveUSD_gt: "1000000",
            volumeUSD_gt: "50000"

        }) {
            ${poolAttributes},
            ${pairAttributes}
        },
        factories: uniswapFactories {
            pairCount
        }
    }`,

  pool: (contractAddress: string): string => `
        query {
            pair(id: "${contractAddress}") {
                ${poolAttributes},
                ${pairAttributes}
            }
        }`,

  pair: (contractAddress: string): string => `
        query {
            pair(id: "${contractAddress}") {
                ${pairAttributes}
            }
        }
    `,

  example: (someValue?: unknown): string => `
        query {
            pairs(someProp: "${someValue}") {
                id
            }
        }
  `,
};

export default PancakeQueries;
