export default function getTradingPair(market: any) {
  const symbol =
    market && typeof market === 'object' ? market.symbol || '' : market || '';
  const [base, quote] = symbol.split(symbol.indexOf('/') === -1 ? '-' : '/');
  return {
    base,
    quote,
  };
}
