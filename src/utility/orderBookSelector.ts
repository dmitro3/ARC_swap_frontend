import { OrderBookSelectorResponse } from '../interfaces/IOrderBook';

const orderBookRowLimit = 15;

function transformForPresentation(
  data: any,
  multiplier: any,
  precision = { base: 8, amount: 8, price: 8 },
  exchangeName: string,
  selectorValue: number,
) {
  const maxAmount = Math.max(...data.map((item: any) => item[1]));
  const items = data.map((item: any) => {
    const [integerPrice, amount, total] = item;
    const price = integerPrice / multiplier;

    return {
      amount: amount.toFixed(precision.amount),
      price: price.toFixed(selectorValue),
      total: total.toFixed(precision.base),
      volume: Math.round((amount / maxAmount) * 100),
      exchangeName,
    };
  });

  return items;
}

export default function orderBookSelector(
  orderBookData: any,
  selectorValue = 0,
): OrderBookSelectorResponse {
  const { orderBook, exchangeName, precision } = orderBookData;
  const { bids: rawBids, asks: rawAsks } = orderBook;

  // eslint-disable-next-line no-restricted-properties
  const multiplier = Math.pow(
    10,
    selectorValue === 0 ? precision.price : selectorValue,
  );

  const [bids, asks] = [rawBids, rawAsks]
    .map((list) => {
      const priceTotalMap = list.reduce((prev: any, row: any) => {
        const key = Math.floor(row[0] * multiplier);
        const prevItem = prev[prev.length - 1];
        if (prevItem && prevItem[0] === key) {
          prevItem[1] += row[1];
          prevItem[2] += row[1] * row[0];
        } else {
          prev.push([key, row[1], row[1] * row[0]]);
        }
        return prev;
      }, []);

      return list === rawBids
        ? priceTotalMap.slice(0, orderBookRowLimit)
        : priceTotalMap.slice(priceTotalMap.length - orderBookRowLimit);
    })
    .map((data) =>
      transformForPresentation(
        data,
        multiplier,
        precision,
        exchangeName,
        selectorValue,
      ),
    );

  return { asks, bids };
}
