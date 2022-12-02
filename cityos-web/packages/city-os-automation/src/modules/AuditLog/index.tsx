import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { SensorType, SortOrder } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import formatDate from 'city-os-common/libs/formatDate';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { AuditLogSortField, RuleAuditLog } from '../../libs/type';
import {
  SEARCH_AUDIT_LOGS,
  SearchAuditLogsPayload,
  SearchAuditLogsResponse,
} from '../../api/searchAuditLogs';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import I18nAutomationProvider from '../I18nAutomationProvider';

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    width: 0,
    textAlign: 'center',
  },

  table: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  timeCell: {
    minWidth: 100,
    wordWrap: 'break-word',
  },

  idCell: {
    minWidth: 100,
    wordWrap: 'break-word',
  },

  nameCell: {
    minWidth: 120,
    wordWrap: 'break-word',
  },

  groupCell: {
    minWidth: 100,
    wordWrap: 'break-word',
  },

  triggeredValueCell: {
    minWidth: 105,
  },

  triggeredExpressionCell: {
    minWidth: 105,
  },

  notifyCell: {
    minWidth: 120,
  },

  modifyCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    minWidth: 120,
  },
}));

type RowData = RuleAuditLog;

interface Query {
  /** search value */
  q?: string;
}

const AuditLogPage: VoidFunctionComponent = () => {
  const { t } = useAutomationTranslation(['mainLayout', 'automation', 'variables']);
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>('/audit-log');

  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [sortField, setSortField] = useState<AuditLogSortField>();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState('');
  const [pageVariables, setPageVariables] = useState<{ before?: string; after?: string }>({
    before: undefined,
    after: undefined,
  });

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const keyword = isString(router.query.q) ? router.query.q : undefined;

  const { data: searchAuditLogsData } = useQuery<SearchAuditLogsResponse, SearchAuditLogsPayload>(
    SEARCH_AUDIT_LOGS,
    {
      skip: !permissionGroup?.group?.id,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        filter: {
          keyword,
          sortField,
          sortOrder,
        },
        ...pageVariables,
        size: rowsPerPage,
      },
    },
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );

  const handleSearch = useCallback(
    (newKeyword: string | null) => {
      if (newKeyword !== null) {
        changeRoute({ q: newKeyword });
        setPage(0);
        setPageVariables({ before: undefined, after: undefined });
      }
    },
    [changeRoute],
  );

  const handleClearSearch = useCallback(() => {
    handleSearch('');
  }, [handleSearch]);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setPageVariables({ before: undefined, after: undefined });
  }, []);

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      if (!searchAuditLogsData) return;
      const { endCursor, beforeCursor } = searchAuditLogsData.searchAuditLogs.pageInfo;
      const before = newPage < page && beforeCursor ? beforeCursor : undefined;
      const after = newPage > page && endCursor ? endCursor : undefined;
      setPage(before || after ? newPage : 0);
      setPageVariables({ before, after });
    },
    [page, searchAuditLogsData],
  );

  const handleSort = useCallback(
    (field: AuditLogSortField) => (order: SortOrder) => {
      setSortField(field);
      setSortOrder(order);
      setPage(0);
      setPageVariables({ before: undefined, after: undefined });
    },
    [],
  );

  const columns = useMemo<Column<RowData>[]>(
    () => [
      {
        title: t('automation:Time'),
        field: 'time',
        sortOrder: sortField === AuditLogSortField.TIME ? sortOrder : SortOrder.DESCENDING,
        sort: handleSort(AuditLogSortField.TIME),
        render: ({ triggeredTime }: RowData) => (
          <div className={classes.timeCell}>
            {formatDate(triggeredTime, t('variables:dateFormat.common.dateTime'))}
          </div>
        ),
      },
      {
        title: t('automation:Rule ID'),
        field: 'id',
        sortOrder: sortField === AuditLogSortField.ID ? sortOrder : SortOrder.DESCENDING,
        sort: handleSort(AuditLogSortField.ID),
        render: ({ rule }: RowData) => <div className={classes.idCell}>{rule.id}</div>,
      },
      {
        title: t('automation:Rule Name'),
        field: 'name',
        sortOrder: sortField === AuditLogSortField.NAME ? sortOrder : SortOrder.DESCENDING,
        sort: handleSort(AuditLogSortField.NAME),
        render: ({ rule }: RowData) => <div className={classes.nameCell}>{rule.name}</div>,
      },
      {
        title: t('common:Division'),
        field: 'group',
        sortOrder: sortField === AuditLogSortField.GROUP ? sortOrder : SortOrder.DESCENDING,
        sort: handleSort(AuditLogSortField.GROUP),
        render: ({ rule }: RowData) => <div className={classes.groupCell}>{rule.group.name}</div>,
      },
      {
        title: t('automation:Triggered Value(s)'),
        field: 'triggeredValue',
        render: ({ triggeredCurrentValue }: RowData) => (
          <div className={classes.triggeredValueCell}>{triggeredCurrentValue}</div>
        ),
      },
      {
        title: t('automation:Triggered Expression(s)'),
        field: 'triggeredExpression',
        render: ({ triggeredExpression }: RowData) => (
          <div className={classes.triggeredExpressionCell}>{triggeredExpression}</div>
        ),
      },
      {
        title: t('automation:Notified User(s)'),
        field: 'notify',
        render: ({ notifyActions }: RowData) => (
          <div className={classes.notifyCell}>
            {notifyActions
              .flatMap(({ users }) => users.map(({ name, email }) => name || email))
              .join('; ')}
          </div>
        ),
      },
      {
        title: t('automation:Modified Sensor(s)'),
        field: 'modify',
        render: ({ deviceActions }: RowData) => (
          <div className={classes.modifyCell}>
            {deviceActions.map((deviceAction, idx) => (
              <div key={idx.toString()}>
                <span>{deviceAction.devices.map(({ name }) => name).join('; ')}</span>
                <br />
                <span>
                  {deviceAction.sensorId}={deviceAction.setValue}
                  {deviceAction.devices
                    .flatMap(({ sensors }) => sensors)
                    .find(
                      (sensor) =>
                        sensor?.sensorId === deviceAction.sensorId &&
                        sensor?.type === SensorType.GAUGE,
                    )?.unit || ''}
                </span>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [sortField, sortOrder, classes, handleSort, t],
  );

  const tableData = useMemo<RowData[]>(
    () => searchAuditLogsData?.searchAuditLogs.edges.map(({ node }) => node) || [],
    [searchAuditLogsData?.searchAuditLogs.edges],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <I18nAutomationProvider>
      <MainLayout>
        <PageContainer>
          <Header title={t('mainLayout:Audit Log')} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BasicSearchField
                value={searchValue}
                label={t('common:Search')}
                placeholder={t('automation:Insert a keyword')}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </Grid>
            <Grid item xs={12} className={classes.tableWrapper}>
              <NestedTable
                dense
                disabledSelection
                data={tableData}
                columns={columns}
                classes={{
                  container: classes.table,
                }}
                disableNoDataMessage={!searchAuditLogsData}
              />
              {!searchAuditLogsData && <CircularProgress className={classes.loading} />}
              {searchAuditLogsData && searchAuditLogsData.searchAuditLogs.totalCount > 0 && (
                <ThemeTablePagination
                  count={searchAuditLogsData.searchAuditLogs.totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </Grid>
          </Grid>
        </PageContainer>
      </MainLayout>
    </I18nAutomationProvider>
  );
};

export default memo(AuditLogPage);
