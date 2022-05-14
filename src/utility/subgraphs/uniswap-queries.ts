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
        tradeVolumeUSD,
        totalLiquidity,
    },
    token1 {
        id,
        symbol,
        name,
        decimals,
        totalSupply,
        tradeVolumeUSD
        totalLiquidity,
    }`;

const UniswapQueries: QueryObj = {
  pools: (page = 0): string => `
    query {
        pairs (${page > 0 ? `skip: "${page * 100}",` : ''}
            where: {
                reserveUSD_gt: "1000000",
                volumeUSD_gt: "50000"
            },
            orderBy: volumeUSD,
            orderDirection: desc
        ) {
            ${poolAttributes},
            ${pairAttributes},

        },
        factories: uniswapFactories {
            pairCount
        },
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
                ${poolAttributes}
                ${pairAttributes}
            },
            pairDayDatas(first: 100, orderBy: date, orderDirection: desc,
              where: {
                pairAddress: "${contractAddress}",
              }
            ) {
                dailyVolumeUSD
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

export default UniswapQueries;
