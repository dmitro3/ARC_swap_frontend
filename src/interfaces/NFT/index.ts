export interface ICollection {
  id: number;
  logoURL?: string;
  coverImgUrl?: string;
  name: string;
  market: string;
  currency: string;
  volume: number;
  changeIn24Hours: number;
  floorPrice: number;
  owners: number;
  count: number;
}

export interface IToken {
  id: number;
  name: string;
  image: string;
  collection: ICollection;
  currentBid: number;
  favorites: number;
}

export interface IActivity {
  id: number;
  item: IToken;
  type: string;
  market: string;
  currency: string;
  price: number;
  usdPrice: number;
  qty: number;
  from: string;
  to: string;
  timestamp: number;
}
