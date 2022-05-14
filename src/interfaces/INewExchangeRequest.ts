export interface INewExchangeRequest {
  exchangeId: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  subAccount?: string;
  subAccountValue?: string;
}
