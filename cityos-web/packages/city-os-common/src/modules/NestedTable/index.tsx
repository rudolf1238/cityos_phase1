import { makeStyles } from '@material-ui/core/styles';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { SortOrder } from '../../libs/schema';
import NestedTableProvider, {
  Column,
  CustomClasses,
  NestedTableContextValue,
  RowData,
} from './NestedTableProvider';
import useCommonTranslation from '../../hooks/useCommonTranslation';

import CircleCheckbox from '../Checkbox';
import NestedTableRow from './NestedTableRow';

const useStyles = makeStyles((theme) => ({
  columnRow: {
    '& > $denseColumnCell:last-child': {
      paddingRight: theme.spacing(2.5),
    },
  },

  sortColumn: {
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  sortIcon: {
    marginLeft: theme.spacing(1),
    height: theme.spacing(2.5),
    verticalAlign: 'middle',
    color: theme.palette.info.main,
  },

  checkbox: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },

  noData: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(4, 0),
    textAlign: 'center',
  },

  denseColumnCell: {
    padding: theme.spacing(2, 0, 2, 2.5),
  },
}));

interface ColumnNameCellProps<T extends RowData> {
  col: Column<T>;
  dense?: boolean;
}

const ColumnNameCell = <T extends RowData>({
  col,
  dense,
}: ColumnNameCellProps<T>): ReactElement | null => {
  const classes = useStyles();
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASCENDING);

  const handleClick = useCallback(() => {
    const newType = sortOrder === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING;
    setSortOrder(newType);
    if (col.sort) {
      col.sort(newType);
    }
  }, [col, sortOrder]);

  useEffect(() => {
    if (col?.sortOrder && col.sortOrder !== sortOrder) {
      setSortOrder(col.sortOrder);
    }
  }, [col?.sortOrder, sortOrder]);

  return col.sort ? (
    <TableCell
      component="div"
      className={clsx(classes.sortColumn, { [classes.denseColumnCell]: dense })}
      onClick={handleClick}
    >
      {col.title}
      {sortOrder === SortOrder.ASCENDING ? (
        <ArrowDropUpIcon className={classes.sortIcon} />
      ) : (
        <ArrowDropDownIcon className={classes.sortIcon} />
      )}
    </TableCell>
  ) : (
    <TableCell component="div" className={dense ? classes.denseColumnCell : undefined}>
      {col.title}
    </TableCell>
  );
};

interface NestedTableProps<T extends RowData> {
  columns: Column<T>[];
  data: T[];
  disabledSelection?: boolean;
  selectedRows?: T[];
  isAllRowsSelected?: boolean;
  stickyHeader?: boolean;
  keepSelectColumn?: boolean;
  disableNoDataMessage?: boolean;
  noDataMessage?: string;
  classes?: CustomClasses;
  dense?: boolean;
  onSelect?: (selectedRows: T[]) => void;
  onSelectAll?: () => void;
}

const NestedTable = <T extends RowData>({
  columns,
  data,
  disabledSelection = false,
  selectedRows: initialSelectedRows,
  isAllRowsSelected = false,
  stickyHeader = false,
  keepSelectColumn = false,
  disableNoDataMessage = false,
  noDataMessage,
  classes: customClasses,
  dense,
  onSelect,
  onSelectAll,
}: NestedTableProps<T>): ReactElement | null => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [isInit, setIsInit] = useState(true);

  const handleSetSelectedRows = useCallback<typeof setSelectedRows>(
    (state) => {
      setSelectedRows((value) => {
        const newValue = typeof state === 'function' ? state(value) : state;
        if (onSelect && !Object.is(value, newValue)) {
          window.setTimeout(() => onSelect(newValue));
        }
        return newValue;
      });
    },
    [onSelect],
  );

  const clearSelectedRows = useCallback(() => {
    handleSetSelectedRows((value) => (value.length > 0 ? [] : value));
  }, [handleSetSelectedRows]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectAll) return;
    onSelectAll();
  }, [onSelectAll]);

  useEffect(() => {
    setIsInit(false);
  }, []);

  useEffect(() => {
    if (!disabledSelection && initialSelectedRows) {
      setSelectedRows(initialSelectedRows);
    }
  }, [disabledSelection, initialSelectedRows]);

  useEffect(() => {
    if (disabledSelection) {
      clearSelectedRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledSelection]);

  const contextValue = useMemo<NestedTableContextValue<T>>(
    () => ({
      columns,
      selectedRows,
      setSelectedRows: handleSetSelectedRows,
      disabledSelection,
      hasChildren: data.some((child) => child.children),
      isInit,
      customClasses,
      keepSelectColumn,
    }),
    [
      columns,
      customClasses,
      data,
      disabledSelection,
      handleSetSelectedRows,
      isInit,
      selectedRows,
      keepSelectColumn,
    ],
  );

  return (
    <TableContainer className={customClasses?.container}>
      <Table component="div" stickyHeader={stickyHeader} className={customClasses?.table}>
        <TableHead component="div">
          <TableRow component="div" className={clsx(classes.columnRow, customClasses?.row)}>
            {(keepSelectColumn || selectedRows.length > 0) && (
              <TableCell component="div">
                {onSelectAll && (
                  <CircleCheckbox
                    className={classes.checkbox}
                    checked={isAllRowsSelected}
                    onChange={handleSelectAll}
                  />
                )}
              </TableCell>
            )}
            {contextValue.hasChildren && <TableCell component="div" />}
            {columns.map((col, i) => (
              <ColumnNameCell col={col} dense={dense} key={i.toString()} />
            ))}
          </TableRow>
        </TableHead>
        <TableBody component="div">
          <NestedTableProvider value={contextValue}>
            {data.map((row, i) => (
              <NestedTableRow rowData={row} open key={row.key || i.toString()} dense={dense} />
            ))}
          </NestedTableProvider>
        </TableBody>
      </Table>
      {data.length === 0 && !disableNoDataMessage && (
        <div className={classes.noData}>{noDataMessage || t('No Data')}</div>
      )}
    </TableContainer>
  );
};

export default NestedTable;
