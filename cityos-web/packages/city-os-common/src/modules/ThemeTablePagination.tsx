import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import TablePagination, { TablePaginationProps } from '@material-ui/core/TablePagination';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  pagination: {
    transform: 'translate3d(0, 0, 0)',
    borderWidth: '0 1px 1px',
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  },
}));

type DivTablePaginationProps = TablePaginationProps<'div'>;

const ThemeTablePagination: VoidFunctionComponent<DivTablePaginationProps> = ({
  classes: customClasses,
  ...props
}: DivTablePaginationProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common']);

  return (
    <TablePagination
      component="div"
      rowsPerPageOptions={[5, 10, 15]}
      classes={{ ...customClasses, root: clsx(classes.pagination, customClasses?.root) }}
      labelRowsPerPage={t('common:Rows per page_')}
      labelDisplayedRows={({ from, to, count }) =>
        t('common:{{from}}-{{to}} of {{count}}', {
          from,
          to,
          count,
        })
      }
      {...props}
    />
  );
};

export default memo(ThemeTablePagination);
