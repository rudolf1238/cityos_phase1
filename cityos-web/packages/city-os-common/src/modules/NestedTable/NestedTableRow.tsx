import { makeStyles } from '@material-ui/core/styles';
import React, { MouseEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { RowData, useNestedTable } from './NestedTableProvider';
import useCommonTranslation from '../../hooks/useCommonTranslation';

import AdvancedCollapse from '../AdvancedCollapse';
import CircleCheckbox from '../Checkbox';

const useStyles = makeStyles((theme) => ({
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },

    '& > $denseCell:last-child': {
      paddingRight: theme.spacing(2.5),
    },
  },

  selectedRows: {
    backgroundColor: `${theme.palette.action.selected} !important`,
  },

  tableCell: {
    borderBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  tableCellAction: {
    width: 1,
  },

  tableCellContent: {
    boxSizing: 'content-box',
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    minHeight: 32,
    color: theme.palette.grey[700],
  },

  checkbox: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },

  textNoWrap: {
    whiteSpace: 'nowrap',
  },

  keepSelectColumn: {
    width: 45,
    textAlign: 'center',
  },

  denseCell: {
    padding: theme.spacing(0, 0, 0, 2.5),
  },
}));

interface NestedTableRowProps<T extends RowData> {
  rowData: T;
  open: boolean;
  dense?: boolean;
}

const NestedTableRow = <T extends RowData>({
  rowData,
  open,
  dense,
}: NestedTableRowProps<T>): ReactElement | null => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();
  const [openChildren, setOpenChildren] = useState(false);
  const {
    columns,
    selectedRows,
    setSelectedRows,
    disabledSelection,
    hasChildren,
    isInit,
    customClasses,
    keepSelectColumn,
  } = useNestedTable<T>();

  const isSelected = useMemo(() => selectedRows.some((item) => item.key === rowData.key), [
    rowData.key,
    selectedRows,
  ]);

  useEffect(() => {
    if (isSelected && !open) {
      setSelectedRows((value) => value.filter((item) => item.key !== rowData.key));
    }
  }, [isSelected, open, rowData.key, setSelectedRows]);

  const handleClick = useCallback(() => {
    if (!disabledSelection) {
      setSelectedRows((value) =>
        isSelected ? value.filter((item) => item.key !== rowData.key) : [...value, rowData],
      );
    }
  }, [disabledSelection, isSelected, rowData, setSelectedRows]);

  const handleSwitch = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setOpenChildren(!openChildren);
    },
    [openChildren],
  );

  return (
    <>
      <TableRow
        component={open ? 'div' : 'span'}
        role={open ? 'row' : 'none'}
        className={clsx(classes.tableRow, customClasses?.row)}
        selected={open && isSelected}
        classes={{ selected: classes.selectedRows }}
        onClick={handleClick}
      >
        {(keepSelectColumn || selectedRows.length > 0) && (
          <TableCell
            component="div"
            className={clsx(classes.tableCell, classes.tableCellAction, {
              [classes.denseCell]: dense,
            })}
          >
            <AdvancedCollapse
              in={open}
              disableInitialState={isInit || !open}
              classes={{
                wrapper: clsx(
                  classes.tableCellContent,
                  keepSelectColumn && classes.keepSelectColumn,
                ),
              }}
            >
              {open && isSelected && <CircleCheckbox className={classes.checkbox} checked />}
            </AdvancedCollapse>
          </TableCell>
        )}
        {hasChildren && (
          <TableCell
            component="div"
            className={clsx(classes.tableCell, classes.tableCellAction, {
              [classes.denseCell]: dense,
            })}
          >
            <AdvancedCollapse
              in={open}
              disableInitialState={isInit}
              classes={{
                wrapper: classes.tableCellContent,
              }}
            >
              {open && rowData.children && (
                <IconButton
                  aria-label={openChildren ? t('Collapse') : t('Expand')}
                  size="small"
                  onClick={handleSwitch}
                >
                  {openChildren ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              )}
            </AdvancedCollapse>
          </TableCell>
        )}
        {columns.map(({ field, textWrap, render }, i) => (
          <TableCell
            component="div"
            className={clsx(classes.tableCell, {
              [classes.textNoWrap]: textWrap === 'nowrap',
              [classes.denseCell]: dense,
            })}
            key={i.toString()}
          >
            <AdvancedCollapse
              in={open}
              disableInitialState={isInit}
              classes={{
                wrapper: classes.tableCellContent,
              }}
            >
              {typeof render === 'function' ? render(rowData) : _get(rowData, field || '')}
            </AdvancedCollapse>
          </TableCell>
        ))}
      </TableRow>
      {rowData.children &&
        rowData.children.map((row, i) => (
          <NestedTableRow rowData={row} open={open && openChildren} key={row.key || i.toString()} />
        ))}
    </>
  );
};

export default NestedTableRow;
