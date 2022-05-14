import { ReactElement } from 'react';
import { ColumnsType } from 'antd/lib/table';

export type Spot = number;
export type Future = number;

export interface IBalanceSummaryTable {
  name: string;
  value: string | number;
  child?: {
    future: number;
    spot: number;
  };
  [key: string]: any;
}

export interface IBalanceSymbol extends IBalanceSummaryTable {
  type: 'spot' | 'future';
}

export interface IBalanceSummary {
  /**
   * The Balance Title
   */
  title: string;
  /**
   * The table columns
   */
  columns: ColumnsType<any>;
  /**
   * Data to show in the summary. This data will serve to select the child component in the parent component.
   */
  preloadData: IBalanceSummaryTable[];
  /**
   * The element that it should render when a row is clicked
   *
   * Note that the child MUST follow the interface
   * ```ts
   * interface BalanceSummaryChild {
   *   onBack?: () => void;
   *   data?: any[];
   *   title?: string
   * }
   * ```
   */
  onSelectRowRender: React.FC | ReactElement;
  /**
   * The title for the child component that will display after a row is clicked
   */
  childrenTitle: string;
  /**
   * The data to display in the children, after a row is selected.
   * If you don't want to show the children, this value should be `undefined`.
   */
  childrenData?: IBalanceSummaryTable[];
  /**
   * If true, will show a loader in the card.
   */
  isLoading: boolean;
  /**
   * Callback function to when a child is closed.
   */
  onCloseChild: () => void;
  /**
   * Callback function to when a row is selected
   */
  onRowSelect: (record: any) => void;
}

export interface BalanceSummaryChild {
  /**
   * Callback function to when a child is closed
   */
  onBack?: () => void;
  /**
   * The data to display
   */
  data?: { name: string; value: any }[];
  /**
   * The title
   */
  title?: string;
  [key: string]: any;
}
