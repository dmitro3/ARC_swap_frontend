export interface PlaceOrderProps {
  symbolSelected: string;
  marketType: string;
  handleCompareExchanges(
    symbolToCompare: string,
    type: string,
    userPriceUnit: string,
    userSize: string,
  ): any;
  cancelOrdersLoading: any;
  handleNewOrder(order: any, exchangeSelected: string, type: string): any;
}
