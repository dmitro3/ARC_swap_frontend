export interface MarketOverviewProps {
  marketCap: Object | any;
  selectedExchange?: Object | any;
  sortedMarkets?: Object;
  quote?: string;
  quotes: Array<string>;
  history: Object;
  selectTopCoinsQuote(quote: string): void;
  selectTopMarketsPage(quote: string, value: number): void;
  markets?: {
    list: Object;
    meta: {
      timestamp: string;
    };
  };
  exchangeGecko: Object[] | any;
  user?: any;
  selections: Object;
  topCoins: Array<Object>;
  selectTopMarketsSorting: any;
}
