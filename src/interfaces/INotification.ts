import { IconType } from 'antd/lib/notification';

export interface INotification {
  type: IconType;
  title?: string;
  message: string;
  txnLink?: string;
}
