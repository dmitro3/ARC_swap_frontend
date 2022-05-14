export interface IExtraApiKeyFields {
  fieldName: string;
  value: any;
}

export interface IAPIKey {
  id: string;
  apiKey: string;
  apiSecret?: string;
  extraFields?: IExtraApiKeyFields[];
}

export interface IOrder {
  amount: string;
  exchangeName: string;
  orderType: string; // 'MARKET' | 'LIMIT';
  offerType: string; // 'BUY' | 'SELL' ;
  price: number;
  symbolPair: string;
  user: {
    exchanges?: Array<IAPIKey>;
  };
}
