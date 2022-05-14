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
        tradeVolumeUSD: volumeUSD,
        totalLiquidity: liquidity,
    },
    token1 {
        id,
        symbol,
        name,
        decimals,
        totalSupply,
        tradeVolumeUSD: volumeUSD,
        totalLiquidity: liquidity,
    },
    `;
const SushiswapQueries: QueryObj = {
  pools: (page = 0): string => `
    query {
        pairs (${page > 0 ? `skip: "${page * 100}",` : ''}
            where: {
                reserveUSD_gt: "10000",
                volumeUSD_gt: "10000"
            },
            orderBy: volumeUSD,
            orderDirection: desc
        ) {
            ${poolAttributes},
            ${pairAttributes}
        },
        factories {
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
                ${pairAttributes},
                hourData {
                    volumeUSD
                }
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

export default SushiswapQueries;
