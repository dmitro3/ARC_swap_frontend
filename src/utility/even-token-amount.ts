import BigNumber from 'bignumber.js';

/**
 * Calculates a distribution of two tokens that worths the same amount of dollars.
 *
 * @param price0 price of token0 USD
 * @param amountToken1 amount of token 1
 * @returns object containig both tokens evenly distributed
 */
function getEvenTokenAmount(
  price0: number,
  amountToken1: string,
  decimals?: string,
): string {
  const outputAmount = new BigNumber(amountToken1).dividedBy(price0);
  return outputAmount.toFixed(+(decimals ?? 18));
}

export default getEvenTokenAmount;
