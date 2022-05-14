export interface MarketDetailsProps {
  selectedExchange?: {
    exchangeName: string;
  };
  selectedMarket?: {
    symbol: string;
  };
  selectedMarketLimits?: Object;
  user: any;
  orders: {
    meta: {
      openOrdersPage?: string;
      closedOrdersPage?: string;
    };
  };
  openOrders: Array<any>;
  cancelOrder(): void;
  selectOrdersPage(): void;
  maxOrderPages: {
    open: number;
    closed: number;
  };
  closedOrders: Array<any>;
  match: {
    isExact: boolean;
    params: {
      exchangeName: string;
      marketName: string;
    };
  };
  fetchMarketData: any;
}
