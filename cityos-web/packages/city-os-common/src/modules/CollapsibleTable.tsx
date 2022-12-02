import { makeStyles } from '@material-ui/core/styles';
import React, {
  MouseEvent,
  ReactElement,
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import clsx from 'clsx';
import get from 'lodash/get';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { SortOrder } from '../libs/schema';
import useCommonTranslation from '../hooks/useCommonTranslation';

import ThemeIconButton from './ThemeIconButton';

const useStyles = makeStyles((theme) => ({
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

  oddRow: {
    backgroundColor: theme.palette.background.oddRow,
  },

  collapseRow: {
    backgroundColor: theme.palette.action.selected,
  },

  detailPanel: {
    borderTop: `1px solid ${theme.palette.grey[50]}`,
    borderBottom: `1px solid ${theme.palette.grey[50]}`,
  },

  detailPanelCell: {
    borderWidth: 0,
    padding: 0,
  },

  tableCell: {
    borderBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  tableCellWrapper: {
    boxSizing: 'content-box',
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    minHeight: theme.spacing(4),
    color: theme.palette.grey[700],
  },

  collapseIcon: {
    padding: 0,
    width: 28,
    height: 28,
  },

  textNoWrap: {
    whiteSpace: 'nowrap',
  },

  noData: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(4, 0),
    textAlign: 'center',
  },

  wrapperInner: {
    display: 'table',
    tableLayout: 'fixed',
  },

  denseColumnCell: {
    padding: theme.spacing(2, 0, 2, 2.5),
  },

  denseTableCell: {
    padding: theme.spacing(0, 0, 0, 2.5),
  },

  denseCollapseCell: {
    padding: theme.spacing(0, 0, 0, 1),
  },

  tableRow: {
    [`& > $denseTableCell:last-child,
    & > $denseColumnCell:last-child`]: {
      paddingRight: theme.spacing(2.5),
    },
  },
}));

export type RowData = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface Column<T extends RowData> {
  title: string;
  field?: string;
  textWrap?: 'wrap' | 'nowrap';
  sortOrder?: SortOrder;
  render?: (rowData: T, isCollapse: boolean) => ReactNode;
}

interface CollapsibleRowProps<T extends RowData> {
  index: number;
  rowData: T;
  columns: Column<T>[];
  dense?: boolean;
  isExpanded: boolean;
  onToggle: (rowId: string) => void;
  detailPanel?: (rowData: T) => ReactNode;
}

const CollapsibleRow = <T extends RowData>({
  index,
  rowData,
  columns,
  dense,
  isExpanded,
  onToggle,
  detailPanel,
}: CollapsibleRowProps<T>): ReactElement => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();

  const handleToggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onToggle(rowData.id);
    },
    [onToggle, rowData.id],
  );

  return (
    <>
      <TableRow
        role="row"
        className={clsx(classes.tableRow, {
          [classes.oddRow]: !isExpanded && index % 2 === 0,
          [classes.collapseRow]: isExpanded,
        })}
      >
        {detailPanel && (
          <TableCell className={clsx(classes.tableCell, { [classes.denseCollapseCell]: dense })}>
            <div className={classes.tableCellWrapper}>
              <ThemeIconButton
                aria-label={isExpanded ? t('Collapse') : t('Expand')}
                variant="miner"
                className={classes.collapseIcon}
                onClick={handleToggle}
              >
                {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </ThemeIconButton>
            </div>
          </TableCell>
        )}
        {columns.map(({ field, textWrap, render }, i) => (
          <TableCell
            key={i.toString()}
            className={clsx(classes.tableCell, {
              [classes.textNoWrap]: textWrap === 'nowrap',
              [classes.denseTableCell]: dense,
            })}
          >
            <div className={classes.tableCellWrapper}>
              {typeof render === 'function'
                ? render(rowData, !isExpanded)
                : get(rowData, field || '')}
            </div>
          </TableCell>
        ))}
      </TableRow>
      {detailPanel && (
        <TableRow className={clsx(classes.collapseRow, { [classes.detailPanel]: isExpanded })}>
          <TableCell colSpan={columns.length + 1} className={classes.detailPanelCell}>
            <Collapse
              in={isExpanded}
              timeout="auto"
              unmountOnExit
              classes={{ wrapperInner: classes.wrapperInner }}
            >
              {detailPanel(rowData)}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

interface ColumnNameCellProps<T extends RowData> {
  col: Column<T>;
  dense?: boolean;
  onSortChange?: (field: keyof T, sortOrder: SortOrder) => void;
}

const ColumnNameCell = <T extends RowData>({
  col: { title, field, sortOrder },
  dense,
  onSortChange,
}: ColumnNameCellProps<T>): ReactElement | null => {
  const classes = useStyles();

  const handleClick = useCallback(() => {
    if (!sortOrder || !field || !onSortChange) return;
    const newSortOrder =
      sortOrder === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING;
    onSortChange(field, newSortOrder);
  }, [field, sortOrder, onSortChange]);

  return sortOrder ? (
    <TableCell
      className={clsx(classes.sortColumn, { [classes.denseColumnCell]: dense })}
      onClick={handleClick}
    >
      {title}
      {sortOrder === SortOrder.ASCENDING ? (
        <ArrowDropUpIcon className={classes.sortIcon} />
      ) : (
        <ArrowDropDownIcon className={classes.sortIcon} />
      )}
    </TableCell>
  ) : (
    <TableCell className={dense ? classes.denseColumnCell : undefined}>{title}</TableCell>
  );
};

interface CustomClasses {
  container?: string;
  column?: string;
}

interface CollapsibleTableProps<T extends RowData> {
  columns: Column<T>[];
  data: T[];
  detailPanel?: (rowData: T) => ReactNode;
  onSortChange?: (field: keyof T, sortOrder: SortOrder) => void;
  disableNoDataMessage?: boolean;
  noDataMessage?: string;
  dense?: boolean;
  autoExpandingSingleRow?: boolean;
  classes?: CustomClasses;
}

const CollapsibleTable = <T extends RowData>({
  columns,
  data,
  detailPanel,
  onSortChange,
  disableNoDataMessage = false,
  noDataMessage,
  dense,
  autoExpandingSingleRow = false,
  classes: customClasses,
}: CollapsibleTableProps<T>): ReactElement => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');

  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isToggled, setIsToggled] = useState(false);

  const handleToggleRow = useCallback((rowId: string) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : prev.concat(rowId),
    );
    setIsToggled(true);
  }, []);

  useEffect(() => {
    if (!autoExpandingSingleRow || isToggled) return;
    setExpandedRows(data.length === 1 ? [data[0].id] : []);
  }, [autoExpandingSingleRow, data, isToggled]);

  return (
    <TableContainer className={customClasses?.container}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow className={classes.tableRow}>
            {detailPanel && <TableCell className={dense ? classes.denseColumnCell : undefined} />}
            {columns.map((col, i) => (
              <ColumnNameCell
                col={col}
                dense={dense}
                key={i.toString()}
                onSortChange={onSortChange}
              />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <CollapsibleRow
              index={i}
              rowData={row}
              key={row.id}
              columns={columns}
              dense={dense}
              isExpanded={expandedRows.includes(row.id)}
              onToggle={handleToggleRow}
              detailPanel={detailPanel}
            />
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && !disableNoDataMessage && (
        <div className={classes.noData}>{noDataMessage || t('No Data')}</div>
      )}
    </TableContainer>
  );
};

export default memo(CollapsibleTable) as typeof CollapsibleTable;
