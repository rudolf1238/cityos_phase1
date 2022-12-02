import { ApolloQueryResult, useMutation, useQuery } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

import { SortOrder } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import CollapsibleTable, { Column } from 'city-os-common/modules/CollapsibleTable';
import Header from 'city-os-common/modules/Header';
import LineQRCodeDialog from 'city-os-common/modules/MainLayout/ProfileMenu/LineQRCodeDialog';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import {
  EDIT_MY_SUBSCRIPTION,
  EditMySubscriptionPayload,
  EditMySubscriptionResponse,
} from '../../api/editMySubscription';
import { EffectiveAt, PartialRuleSubscription, SubscriptionSortField } from '../../libs/type';
import {
  SEARCH_MY_SUBSCRIPTIONS,
  SearchMySubscriptionsPayload,
  SearchMySubscriptionsResponse,
} from '../../api/searchMySubscriptions';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import DetailPanel from '../DetailPanel';
import I18nAutomationProvider from '../I18nAutomationProvider';
import WeekDayChips from '../WeekDayChips';

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    width: 0,
    textAlign: 'center',
  },

  table: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  tableColumn: {
    whiteSpace: 'nowrap',
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  idCell: {
    width: 96,
    wordWrap: 'break-word',
  },

  nameCell: {
    width: 180,
    wordWrap: 'break-word',
  },

  groupCell: {
    width: 120,
    wordWrap: 'break-word',
  },

  dateCell: {
    width: 120,
  },

  weekCell: {
    paddingRight: theme.spacing(1),
  },

  timeCell: {
    width: 120,
  },

  connectButton: {
    borderRadius: theme.shape.borderRadius * 0.5,
    padding: theme.spacing(1, 0.5),
  },

  subscribeCell: {
    margin: 'auto',
  },

  switchLoading: {
    width: 24,
    height: 24,
  },
}));

interface SubscribeSwitchProps {
  ruleId: string;
  byLine: boolean;
  byMail: boolean;
  type: 'byLine' | 'byMail';
  refetchSearchSubscriptions: (
    variables?: Partial<SearchMySubscriptionsPayload> | undefined,
  ) => Promise<ApolloQueryResult<SearchMySubscriptionsResponse>>;
}

const SubscribeSwitch: VoidFunctionComponent<SubscribeSwitchProps> = ({
  ruleId,
  byLine,
  byMail,
  type,
  refetchSearchSubscriptions,
}: SubscribeSwitchProps) => {
  const { t } = useAutomationTranslation('common');
  const { dispatch } = useStore();
  const classes = useStyles();
  const timer = useRef<number>();
  const [isBuffering, setIsBuffering] = useState(false);
  const [checked, setChecked] = useState(type === 'byLine' ? byLine : byMail);

  const [editMySubscription, { loading }] = useMutation<
    EditMySubscriptionResponse,
    EditMySubscriptionPayload
  >(EDIT_MY_SUBSCRIPTION);

  const handleChange = useCallback(async () => {
    if (loading) return;

    setIsBuffering(true);
    timer.current = window.setTimeout(() => {
      setIsBuffering(false);
    }, 1000);
    const initChecked = checked;
    setChecked(!initChecked);

    await editMySubscription({
      variables: {
        ruleId,
        byLine: type === 'byLine' ? !byLine : byLine,
        byMail: type === 'byMail' ? !byMail : byMail,
      },
      onCompleted: () => {
        window.clearTimeout(timer.current);
        setIsBuffering(false);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('The value has been set successfully_'),
          },
        });
        void refetchSearchSubscriptions();
      },
      onError: () => {
        window.clearTimeout(timer.current);
        setIsBuffering(false);
        setChecked(initChecked);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Failed to set value_ Please try again_'),
          },
        });
      },
    });
  }, [
    loading,
    checked,
    ruleId,
    type,
    byLine,
    byMail,
    t,
    dispatch,
    editMySubscription,
    refetchSearchSubscriptions,
  ]);

  useEffect(() => {
    setChecked(type === 'byLine' ? byLine : byMail);
  }, [byLine, byMail, type]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className={classes.subscribeCell}>
      {!isBuffering && loading ? (
        <CircularProgress size="small" className={classes.switchLoading} />
      ) : (
        <Switch color="primary" checked={checked} onChange={handleChange} />
      )}
    </div>
  );
};

interface RowData
  extends Omit<PartialRuleSubscription, 'rule'>,
    Omit<PartialRuleSubscription['rule'], 'effectiveAt'>,
    EffectiveAt,
    Record<'ruleId', string> {}

const columnToSortField: Record<keyof RowData, SubscriptionSortField | undefined> = {
  id: undefined,
  ruleId: SubscriptionSortField.ID,
  name: SubscriptionSortField.NAME,
  group: SubscriptionSortField.GROUP,
  effectiveDate: SubscriptionSortField.EFFECTIVE_DATE,
  effectiveWeekday: undefined,
  effectiveTime: SubscriptionSortField.EFFECTIVE_TIME,
  timezone: undefined,
  logic: undefined,
  if: undefined,
  then: undefined,
  byLine: undefined,
  byMail: undefined,
};

interface Query {
  /** search value */
  q?: string;
}

const SubscriptionSettingsPage: VoidFunctionComponent = () => {
  const { t } = useAutomationTranslation(['mainLayout', 'automation', 'variables']);
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>('/subscription-settings');

  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [sortField, setSortField] = useState<SubscriptionSortField>();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState('');
  const [openLineQRCode, setOpenLineQRCode] = useState(false);
  const [pageVariables, setPageVariables] = useState<{ before?: string; after?: string }>({
    before: undefined,
    after: undefined,
  });

  const {
    userProfile: { permissionGroup, profile },
  } = useStore();

  const keyword = isString(router.query.q) ? router.query.q : undefined;

  const { data: searchSubscriptionsData, refetch: refetchSearchSubscriptions, loading } = useQuery<
    SearchMySubscriptionsResponse,
    SearchMySubscriptionsPayload
  >(SEARCH_MY_SUBSCRIPTIONS, {
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
  });

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
      if (!searchSubscriptionsData) return;
      const { endCursor, beforeCursor } = searchSubscriptionsData.searchMySubscriptions.pageInfo;
      const before = newPage < page && beforeCursor ? beforeCursor : undefined;
      const after = newPage > page && endCursor ? endCursor : undefined;
      setPage(before || after ? newPage : 0);
      setPageVariables({ before, after });
    },
    [page, searchSubscriptionsData],
  );

  const handleOpenLineQRCode = useCallback(() => {
    setOpenLineQRCode(true);
  }, []);

  const handleCloseLineQRCode = useCallback(() => {
    setOpenLineQRCode(false);
  }, []);

  const detailPanel = useCallback((rowData: RowData) => <DetailPanel rule={rowData} />, []);

  const onSortChange = useCallback((field: keyof RowData, order: SortOrder) => {
    setSortField(columnToSortField[field]);
    setSortOrder(order);
    setPage(0);
    setPageVariables({ before: undefined, after: undefined });
  }, []);

  const columns = useMemo<Column<RowData>[]>(
    () => [
      {
        title: t('automation:Rule ID'),
        field: 'ruleId',
        sortOrder: sortField === SubscriptionSortField.ID ? sortOrder : SortOrder.DESCENDING,
        render: ({ ruleId }: RowData) => <div className={classes.idCell}>{ruleId}</div>,
      },
      {
        title: t('automation:Rule Name'),
        field: 'name',
        sortOrder: sortField === SubscriptionSortField.NAME ? sortOrder : SortOrder.DESCENDING,
        render: ({ name }: RowData) => <div className={classes.nameCell}>{name}</div>,
      },
      {
        title: t('common:Division'),
        field: 'group',
        sortOrder: sortField === SubscriptionSortField.GROUP ? sortOrder : SortOrder.DESCENDING,
        render: ({ group }: RowData) => <div className={classes.groupCell}>{group.name}</div>,
      },
      {
        title: t('automation:Effective Date'),
        field: 'effectiveDate',
        sortOrder:
          sortField === SubscriptionSortField.EFFECTIVE_DATE ? sortOrder : SortOrder.DESCENDING,
        render: ({ effectiveDate }: RowData) => (
          <div className={classes.dateCell}>
            {effectiveDate &&
              `${formatDate(
                { month: effectiveDate.startMonth - 1, date: effectiveDate.startDay },
                `${t('variables:dateFormat.common.monthDay')}`,
              )}~${formatDate(
                { month: effectiveDate.endMonth - 1, date: effectiveDate.endDay },
                `${t('variables:dateFormat.common.monthDay')}`,
              )}`}
          </div>
        ),
      },
      {
        title: t('automation:Days of The Week'),
        field: 'effectiveWeekday',
        render: ({ effectiveWeekday }: RowData) => (
          <WeekDayChips effectiveWeekday={effectiveWeekday} className={classes.weekCell} />
        ),
      },
      {
        title: t('automation:Effective Time'),
        field: 'effectiveTime',
        sortOrder:
          sortField === SubscriptionSortField.EFFECTIVE_TIME ? sortOrder : SortOrder.DESCENDING,
        render: ({ effectiveTime }: RowData) => (
          <div className={classes.timeCell}>
            {effectiveTime &&
              `${formatDate(
                { hours: effectiveTime.fromHour, minutes: effectiveTime.fromMinute },
                `${t('variables:dateFormat.common.hourMinute')}`,
              )}~${formatDate(
                { hours: effectiveTime.toHour, minutes: effectiveTime.toMinute },
                `${t('variables:dateFormat.common.hourMinute')}`,
              )}`}
          </div>
        ),
      },
      {
        title: t('automation:Subscribe by LINE'),
        field: 'byLine',
        textWrap: 'nowrap',
        render: ({ ruleId, byLine, byMail }: RowData) =>
          profile?.isLINEConnected ? (
            <SubscribeSwitch
              ruleId={ruleId}
              byLine={byLine}
              byMail={byMail}
              type="byLine"
              refetchSearchSubscriptions={refetchSearchSubscriptions}
            />
          ) : (
            <Button
              variant="contained"
              color="primary"
              className={classes.connectButton}
              onClick={handleOpenLineQRCode}
            >
              <Typography variant="overline">{t('automation:CONNECT LINE')}</Typography>
            </Button>
          ),
      },
      {
        title: t('automation:Subscribe by Email'),
        field: 'byMail',
        textWrap: 'nowrap',
        render: ({ ruleId, byMail, byLine }: RowData) => (
          <SubscribeSwitch
            ruleId={ruleId}
            byLine={byLine}
            byMail={byMail}
            type="byMail"
            refetchSearchSubscriptions={refetchSearchSubscriptions}
          />
        ),
      },
    ],
    [
      sortField,
      sortOrder,
      classes,
      profile?.isLINEConnected,
      t,
      handleOpenLineQRCode,
      refetchSearchSubscriptions,
    ],
  );

  const tableData = useMemo<RowData[]>(
    () =>
      searchSubscriptionsData?.searchMySubscriptions.edges.map(
        ({
          cursor,
          node: {
            byLine,
            byMail,
            rule: { id: ruleId, effectiveAt, ...otherRules },
          },
        }) => ({
          id: cursor,
          ruleId,
          byLine,
          byMail,
          ...effectiveAt,
          ...otherRules,
        }),
      ) || [],
    [searchSubscriptionsData?.searchMySubscriptions.edges],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <I18nAutomationProvider>
      <MainLayout>
        <PageContainer>
          <Header title={t('mainLayout:Subscription Settings')} />
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
              <CollapsibleTable
                data={tableData}
                columns={columns}
                classes={{
                  container: classes.table,
                  column: classes.tableColumn,
                }}
                disableNoDataMessage={!searchSubscriptionsData}
                dense
                autoExpandingSingleRow={!loading}
                detailPanel={detailPanel}
                onSortChange={onSortChange}
              />
              {!searchSubscriptionsData && <CircularProgress className={classes.loading} />}
              {searchSubscriptionsData &&
                searchSubscriptionsData.searchMySubscriptions.totalCount > 0 && (
                  <ThemeTablePagination
                    count={searchSubscriptionsData.searchMySubscriptions.totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                )}
            </Grid>
          </Grid>
        </PageContainer>
        <LineQRCodeDialog open={openLineQRCode} onClose={handleCloseLineQRCode} />
      </MainLayout>
    </I18nAutomationProvider>
  );
};

export default memo(SubscriptionSettingsPage);
