export interface IOrderBook {
  exchangeName: string;
  orderBook: {
    asks: [];
    bids: [];
    nonce: number;
    symbol: string;
  };
  precision: {
    amount: number;
    base: number;
    price: number;
    quote: number;
  };
}

export interface OrderBookProps {
  exchangeSelected: string;
  symbolSelected: string;
  marketType: string;
}

export interface OrderBookSelectorResponse {
  asks: [
    {
      amount: string;
      price: string;
      total: string;
      volume: number;
      exchangeName: string;
    },
  ];
  bids: [
    {
      amount: string;
      price: string;
      total: string;
      volume: number;
      exchangeName: string;
    },
  ];
}
