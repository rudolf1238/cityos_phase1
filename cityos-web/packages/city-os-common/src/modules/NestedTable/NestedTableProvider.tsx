import React, {
  Dispatch,
  Key,
  ProviderProps,
  ReactElement,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { SortOrder } from '../../libs/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RowData extends Record<string, any> {
  key?: Key;
  children?: RowData[];
}

export interface Column<T extends RowData> {
  title: string;
  field?: string;
  textWrap?: 'wrap' | 'nowrap';
  sortOrder?: SortOrder;
  sort?: (type: SortOrder) => void;
  render?: (rowData: T) => ReactNode;
}

export interface CustomClasses {
  container?: string;
  table?: string;
  row?: string;
}

export interface NestedTableContextValue<T extends RowData> {
  columns: Column<T>[];
  selectedRows: T[];
  setSelectedRows: Dispatch<SetStateAction<T[]>>;
  disabledSelection: boolean;
  hasChildren: boolean;
  isInit: boolean;
  customClasses?: CustomClasses;
  keepSelectColumn?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NestedTableContext = createContext<NestedTableContextValue<any>>({
  columns: [],
  selectedRows: [],
  setSelectedRows: () => {},
  disabledSelection: false,
  hasChildren: false,
  isInit: true,
});

function NestedTableProvider<T extends RowData>({
  value,
  children,
}: ProviderProps<NestedTableContextValue<T>>): ReactElement | null {
  return <NestedTableContext.Provider value={value}>{children}</NestedTableContext.Provider>;
}

export default NestedTableProvider;

export function useNestedTable<T extends RowData>(): NestedTableContextValue<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useContext(NestedTableContext);
}
