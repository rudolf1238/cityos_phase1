import { ToolbarComponentProps } from '@material-ui/pickers/Picker/Picker';
import { fade, makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  ComponentType,
  MouseEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import i18n from 'i18next';
import startOfDay from 'date-fns/startOfDay';

import { DatePicker } from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Action, DeviceType, Subject } from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { isFilterType, isNumberString, isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import {
  ADD_TO_ELASTIC_SEARCH,
  AddToElasticSearchPayload,
  AddToElasticSearchResponse,
} from '../api/addToElasticSearch';
import {
  DELETE_FROM_ELASTIC_SEARCH,
  DeleteFromElasticSearchPayload,
  DeleteFromElasticSearchResponse,
} from '../api/deleteFromElasticSearch';
import { ELASTIC_SEARCH_SETTING, ElasticSearchSettingResponse } from '../api/elasticSearchSetting';
import {
  ENABLE_ELASTIC_SEARCH,
  EnableElasticSearchPayload,
  EnableElasticSearchResponse,
} from '../api/enableElasticSearch';
import { ElasticSearchSensor } from '../libs/schema';
import {
  PROCESS_ELASTIC_SEARCH_CHANGED,
  ProcessElasticSearchChangedPayload,
  ProcessElasticSearchChangedResponse,
} from '../api/processElasticSearchChanged';
import useSensorTypeTranslation from '../hooks/useSensorTypeTranslation';
import useWebTranslation from '../hooks/useWebTranslation';

import RefreshIcon from '../assets/icon/refresh.svg';

const useStyles = makeStyles((theme) => ({
  filedWrapper: {
    maxWidth: 280,
  },

  search: {
    width: '100%',
  },

  refreshButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },

  tableWrapper: {
    width: 1280,
    textAlign: 'center',
  },

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  table: {
    tableLayout: 'fixed',
  },

  row: {
    wordBreak: 'break-word',

    '& > div[role="cell"]:last-child': {
      textAlign: 'right',
    },
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  iconButton: {
    padding: 0,
    width: 30,
    height: 30,
  },

  selected: {
    backgroundColor: theme.palette.action.active,
    color: theme.palette.primary.contrastText,
  },

  menuPaper: {
    width: 112,
  },

  delete: {
    color: theme.palette.error.main,

    '&:hover': {
      color: theme.palette.error.main,
    },
  },

  subscribeWrapper: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'max-content',
    minHeight: 48,
  },

  subscribeButton: {
    padding: theme.spacing(1),
    minWidth: 100,
  },

  subscribeButtonOutlined: {
    borderWidth: 1,

    '&:hover': {
      borderWidth: 1,
    },
  },

  progressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: 135,
    color: fade(theme.palette.text.primary, 0.6),
  },

  linearProgress: {
    width: 124,
  },

  dialog: {
    padding: theme.spacing(6, 4, 4),
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
  },

  addRecordContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },

  deleteDialog: {
    width: 600,
    height: 300,
  },

  deleteContent: {
    height: '100%',
  },

  dialogButton: {
    alignSelf: 'center',
  },

  addRecordInputWrapper: {
    padding: theme.spacing(1, 2),
  },

  addRecordInput: {
    width: '100%',

    '& .MuiInputBase-root': {
      backgroundColor: 'transparent',
    },
  },
}));

type RowData = ElasticSearchSensor;

interface MoreMenuProps {
  rowData: RowData;
  onAdd: (rowData: RowData) => void;
  onDelete: (rowData: RowData) => void;
}

const MoreMenu: VoidFunctionComponent<MoreMenuProps> = ({
  rowData,
  onAdd,
  onDelete,
}: MoreMenuProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'elasticSearch']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleOpenMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpenMenu(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const handleAdd = useCallback(() => {
    handleCloseMenu();
    onAdd(rowData);
  }, [rowData, handleCloseMenu, onAdd]);

  const handleDelete = useCallback(() => {
    handleCloseMenu();
    onDelete(rowData);
  }, [rowData, handleCloseMenu, onDelete]);

  return (
    <>
      <ThemeIconButton
        color="primary"
        variant="miner"
        disableRipple
        className={clsx(classes.iconButton, { [classes.selected]: openMenu })}
        onClick={handleOpenMenu}
      >
        <MoreIcon fontSize="small" />
      </ThemeIconButton>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.menuPaper,
        }}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleAdd}>{t('common:Add')}</MenuItem>
        <MenuItem onClick={handleDelete} className={classes.delete}>
          {t('elasticSearch:Delete All')}
        </MenuItem>
      </Menu>
    </>
  );
};

interface SubscribeCellProps {
  rowData: RowData;
  onSubscribe: (rowData: RowData) => Promise<void>;
  onProcessComplete: (
    subscribeData: ProcessElasticSearchChangedResponse['processElasticSearchChanged'],
  ) => void;
}

const SubscribeCell: VoidFunctionComponent<SubscribeCellProps> = ({
  rowData,
  onSubscribe,
  onProcessComplete,
}: SubscribeCellProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['variables', 'elasticSearch']);
  const isMountedRef = useIsMountedRef();
  const [loading, setLoading] = useState(false);

  const { data: subscribeData } = useSubscription<
    ProcessElasticSearchChangedResponse,
    ProcessElasticSearchChangedPayload
  >(PROCESS_ELASTIC_SEARCH_CHANGED, {
    variables: {
      deviceType: rowData.deviceType,
      sensorId: rowData.sensorId,
    },
    onSubscriptionData: (res) => {
      if (res.subscriptionData.data?.processElasticSearchChanged.status === 100) {
        onProcessComplete(res.subscriptionData.data.processElasticSearchChanged);
      }
    },
  });

  const handleSubscribe = useCallback(
    async (row: RowData) => {
      setLoading(true);
      await onSubscribe(row);
      if (isMountedRef.current) {
        setLoading(false);
      }
    },
    [isMountedRef, onSubscribe],
  );

  const status = subscribeData?.processElasticSearchChanged
    ? subscribeData.processElasticSearchChanged.status
    : rowData.status;

  return (
    <div className={classes.subscribeWrapper}>
      <Button
        size="small"
        color="primary"
        variant={rowData.enable ? 'contained' : 'outlined'}
        disabled={status !== 100}
        classes={{
          root: classes.subscribeButton,
          outlinedPrimary: classes.subscribeButtonOutlined,
        }}
        onClick={() => {
          void handleSubscribe(rowData);
        }}
      >
        {loading ? (
          <CircularProgress size={16} color={rowData.enable ? 'inherit' : 'primary'} />
        ) : (
          <Typography variant="overline">
            {rowData.enable
              ? t('elasticSearch:Subscribed').toUpperCase()
              : t('elasticSearch:Subscribe').toUpperCase()}
          </Typography>
        )}
      </Button>
      <div className={classes.progressWrapper}>
        {status !== 100 && (
          <>
            <LinearProgress
              variant="determinate"
              value={status}
              className={classes.linearProgress}
            />
            {subscribeData?.processElasticSearchChanged &&
              subscribeData.processElasticSearchChanged.from &&
              subscribeData.processElasticSearchChanged.to && (
                <Typography variant="caption">
                  {formatDate(
                    new Date(subscribeData.processElasticSearchChanged.from),
                    t('variables:dateFormat.common.dateTime'),
                  )}
                  {' ~'}
                  <br />
                  {formatDate(
                    new Date(subscribeData.processElasticSearchChanged.to),
                    t('variables:dateFormat.common.dateTime'),
                  )}
                </Typography>
              )}
          </>
        )}
      </div>
    </div>
  );
};

const PickerToolbar: ComponentType<ToolbarComponentProps> = ({ date }: ToolbarComponentProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['variables', 'elasticSearch']);

  return (
    <div className={classes.addRecordInputWrapper}>
      <TextField
        value={date ? formatDate(date, t('variables:dateFormat.common.datePicker')) : ''}
        type="text"
        variant="outlined"
        label={t('elasticSearch:Start At') || ''}
        className={classes.addRecordInput}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          readOnly: true,
        }}
      />
    </div>
  );
};

type PartialRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface Query {
  gid?: string;
  type?: DeviceType | 'ALL';
  q?: string;
  n?: number;
  p?: number;
}

const ElasticSearch: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'mainLayout', 'elasticSearch', 'variables']);
  const { tDevice } = useDeviceTranslation();
  const { tSensorType } = useSensorTypeTranslation();
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.ELASTIC_SEARCH]);
  const isMountedRef = useIsMountedRef();

  const [allData, setAllData] = useState<RowData[]>();
  const [searchValue, setSearchValue] = useState('');
  const [addRecordData, setAddRecordData] = useState<RowData>();
  const [addRecordFrom, setAddRecordFrom] = useState<Date>();
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RowData>();

  const type = isFilterType(router.query.type) ? router.query.type : 'ALL';
  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const updatePartialData = useCallback(
    (updatedData: PartialRequired<Partial<ElasticSearchSensor>, 'deviceType' | 'sensorId'>) => {
      setAllData((prev) =>
        prev?.map((prevData) =>
          prevData.deviceType === updatedData.deviceType &&
          prevData.sensorId === updatedData.sensorId
            ? {
                ...prevData,
                ...updatedData,
              }
            : prevData,
        ),
      );
    },
    [],
  );

  const { refetch } = useQuery<ElasticSearchSettingResponse>(ELASTIC_SEARCH_SETTING, {
    notifyOnNetworkStatusChange: true,
    skip: !permissionGroup?.group.id,
    onCompleted: (data) => {
      if (!data.elasticSearchSetting) return;
      setAllData(data.elasticSearchSetting);
    },
    onError: () => {
      setAllData([]);
    },
  });

  const [enableElasticSearch] = useMutation<
    EnableElasticSearchResponse,
    EnableElasticSearchPayload
  >(ENABLE_ELASTIC_SEARCH, {
    onCompleted: ({ enableElasticSearch: { deviceType, sensorId, enable } }) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('common:The information has been saved successfully_'),
        },
      });
      updatePartialData({
        deviceType,
        sensorId,
        enable,
      });
    },
    onError: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to save_ Please try again_'),
        },
      });
    },
  });

  const [addToElasticSearch] = useMutation<AddToElasticSearchResponse, AddToElasticSearchPayload>(
    ADD_TO_ELASTIC_SEARCH,
    {
      onCompleted: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The information has been saved successfully_'),
          },
        });
      },
      onError: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Failed to save_ Please try again_'),
          },
        });
      },
    },
  );

  const [deleteElasticSearch, { loading: deleteLoading }] = useMutation<
    DeleteFromElasticSearchResponse,
    DeleteFromElasticSearchPayload
  >(DELETE_FROM_ELASTIC_SEARCH, {
    onCompleted: ({ deleteFromElasticSearch: { deviceType, sensorId, from, to, enable } }) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('common:This information has been saved successfully_'),
        },
      });
      updatePartialData({
        deviceType,
        sensorId,
        from,
        to,
        enable,
      });
    },
    onError: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to delete_ Please try again_'),
        },
      });
    },
  });

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newType = e.target.value;
      if (isFilterType(newType)) {
        changeRoute({ type: newType, p: 1 });
      }
    },
    [changeRoute],
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );

  const handleSearch = useCallback(
    (newKeyword: string | null) => {
      if (newKeyword !== null) {
        changeRoute({ q: newKeyword, p: 1 });
      }
    },
    [changeRoute],
  );

  const handleClearSearch = useCallback(() => {
    changeRoute({ p: 1 }, ['q']);
    setSearchValue('');
  }, [changeRoute]);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeRoute({
        n: parseInt(event.target.value, 10),
        p: 1,
      });
    },
    [changeRoute],
  );

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      changeRoute({ p: newPage + 1 });
    },
    [changeRoute],
  );

  const handleRefresh = useCallback(() => {
    setAllData(undefined);
    void refetch();
  }, [refetch]);

  const handleOpenAddDialog = useCallback((rowData: RowData) => {
    setAddRecordData(rowData);
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setAddRecordData(undefined);
    setAddRecordFrom(undefined);
  }, []);

  const handleAddDateOnChange = useCallback((newValue) => {
    setAddRecordFrom(newValue);
  }, []);

  const handleAddRecord = useCallback(async () => {
    if (addRecordData && addRecordFrom) {
      await addToElasticSearch({
        variables: {
          elasticSearchInput: {
            deviceType: addRecordData.deviceType,
            sensorId: addRecordData.sensorId,
            from: startOfDay(addRecordFrom).getTime(),
          },
        },
      });
    }
    if (isMountedRef.current) handleCloseAddDialog();
  }, [addRecordData, addRecordFrom, isMountedRef, handleCloseAddDialog, addToElasticSearch]);

  const handleOpenDeleteDialog = useCallback((rowData: RowData) => {
    setDeleteTarget(rowData);
    setOpenDelete(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(
    async (target?: Pick<ElasticSearchSensor, 'deviceType' | 'sensorId'>) => {
      if (target) {
        const { deviceType, sensorId } = target;
        await deleteElasticSearch({
          variables: {
            deviceType,
            sensorId,
          },
        });
      }
      if (isMountedRef.current) {
        setOpenDelete(false);
      }
    },
    [deleteElasticSearch, isMountedRef],
  );

  const filteredData = useMemo<RowData[] | null>(() => {
    const newKeyword = keyword === undefined ? keyword : keyword.toLowerCase().trim();
    return allData
      ? allData
          .filter(
            (sensor) =>
              (type === 'ALL' || sensor.deviceType === type) &&
              (!newKeyword || sensor.sensorId.toLowerCase().includes(newKeyword)),
          )
          .sort(
            (a, b) =>
              a.deviceType.localeCompare(b.deviceType, i18n.language) ||
              a.sensorId.localeCompare(b.sensorId, i18n.language),
          )
      : null;
  }, [allData, keyword, type]);

  const currentPageData = useMemo<RowData[]>(() => {
    const startIdx = (paramPage - 1) * rowsPerPage;
    const endIdx = paramPage * rowsPerPage;
    return filteredData
      ? filteredData.slice(startIdx, endIdx) // get current page data
      : [];
  }, [filteredData, paramPage, rowsPerPage]);

  const renderDeviceType = useCallback((rowData: RowData) => tDevice(rowData.deviceType), [
    tDevice,
  ]);

  const renderSensorType = useCallback((rowData: RowData) => tSensorType(rowData.sensorType), [
    tSensorType,
  ]);

  const renderFrom = useCallback(
    (rowData: RowData): string =>
      rowData.from
        ? formatDate(new Date(rowData.from), t('variables:dateFormat.common.dateTime'))
        : t('common:No Data'),
    [t],
  );

  const renderTo = useCallback(
    (rowData: RowData): string => {
      if (rowData.enable) return t('elasticSearch:Present');
      if (rowData.to)
        return formatDate(new Date(rowData.to), t('variables:dateFormat.common.dateTime'));
      return t('common:No Data');
    },
    [t],
  );
  const handleProcessComplete = useCallback(
    ({ deviceType, sensorId, from, to, enable, status }: ElasticSearchSensor) => {
      // when subscribe data get status 100, the 'from' & 'to' represent the latest table data
      updatePartialData({
        deviceType,
        sensorId,
        from,
        to,
        enable, // 'enable' may turn off if server got error while requesting
        status,
      });
    },
    [updatePartialData],
  );

  const handleSubscribe = useCallback(
    async (rowData: RowData) => {
      const { deviceType, sensorId, enable } = rowData;
      await enableElasticSearch({
        variables: {
          deviceType,
          sensorId,
          enable: !enable,
        },
      });
    },
    [enableElasticSearch],
  );

  const renderSubscribeCell = useCallback(
    (rowData: RowData) => (
      <SubscribeCell
        rowData={rowData}
        onProcessComplete={handleProcessComplete}
        onSubscribe={handleSubscribe}
      />
    ),
    [handleProcessComplete, handleSubscribe],
  );
  const renderMore = useCallback(
    (rowData: RowData) => (
      <MoreMenu
        rowData={rowData}
        onAdd={() => {
          handleOpenAddDialog(rowData);
        }}
        onDelete={handleOpenDeleteDialog}
      />
    ),
    [handleOpenAddDialog, handleOpenDeleteDialog],
  );

  const columns = useMemo<Column<RowData>[]>(
    () => [
      {
        title: t('common:Device Type'),
        field: 'deviceType',
        render: renderDeviceType,
      },
      {
        title: t('common:Sensor ID'),
        field: 'sensorId',
      },
      {
        title: t('elasticSearch:Sensor Name'),
        field: 'sensorName',
      },
      {
        title: t('elasticSearch:Type'),
        field: 'sensorType',
        render: renderSensorType,
      },
      {
        title: t('elasticSearch:Oldest Record'),
        field: 'from',
        render: renderFrom,
      },
      {
        title: t('elasticSearch:Last Record'),
        field: 'to',
        render: renderTo,
      },
      {
        title: t('elasticSearch:Subscribe'),
        field: 'enable',
        render: renderSubscribeCell,
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
      },
    ],
    [t, renderDeviceType, renderSensorType, renderFrom, renderTo, renderSubscribeCell, renderMore],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <MainLayout>
      <Guard subject={Subject.ELASTIC_SEARCH} action={Action.VIEW}>
        <PageContainer>
          <Header title={t('mainLayout:Elastic Search')} />
          <Grid container spacing={2}>
            <Grid item xs={5} lg={3} className={classes.filedWrapper}>
              <TextField
                select
                fullWidth
                SelectProps={{
                  IconComponent: ExpandMoreRoundedIcon,
                  MenuProps: {
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    PaperProps: {
                      variant: 'outlined',
                    },
                  },
                }}
                variant="outlined"
                type="text"
                label={t('common:Device Type')}
                InputLabelProps={{ shrink: true }}
                value={type}
                onChange={handleFilterChange}
              >
                <MenuItem key="ALL" value="ALL">
                  {t('common:All')}
                </MenuItem>
                {(Object.keys(DeviceType) as DeviceType[]).map((deviceType) => (
                  <MenuItem key={deviceType} value={deviceType}>
                    {tDevice(deviceType)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={5} lg={3} className={classes.filedWrapper}>
              <BasicSearchField
                value={searchValue}
                label={t('common:Sensor ID')}
                placeholder={t('common:Search')}
                fullWidth
                className={classes.search}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </Grid>
            <Grid item xs={2} lg={6} className={classes.refreshButton}>
              <ThemeIconButton
                tooltip={t('elasticSearch:Refresh')}
                color="primary"
                variant="contained"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </ThemeIconButton>
            </Grid>
            <Grid item xs={12} className={classes.tableWrapper}>
              <NestedTable
                columns={columns}
                data={currentPageData}
                classes={{
                  container: currentPageData.length > 0 ? classes.nestedTable : undefined,
                  table: classes.table,
                  row: classes.row,
                }}
                disableNoDataMessage={!filteredData}
                disabledSelection
              />
              {!filteredData && <CircularProgress className={classes.loading} />}
              {filteredData && filteredData.length > 0 && (
                <ThemeTablePagination
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={paramPage - 1}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </Grid>
          </Grid>
          <BaseDialog
            open={Boolean(addRecordData)}
            title={t('elasticSearch:Add Record')}
            titleAlign="center"
            classes={{ dialog: classes.dialog, content: classes.addRecordContent }}
            onClose={handleCloseAddDialog}
            content={
              <>
                <DatePicker
                  variant="static"
                  ToolbarComponent={PickerToolbar}
                  value={addRecordFrom}
                  maxDate={addRecordData?.from ?? undefined}
                  disableFuture
                  onChange={handleAddDateOnChange}
                />
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  className={classes.dialogButton}
                  disabled={!addRecordFrom}
                  onClick={handleAddRecord}
                >
                  {t('common:Start')}
                </Button>
              </>
            }
          />
          <BaseDialog
            open={openDelete}
            onClose={() => {
              void handleCloseDeleteDialog();
            }}
            title={t('elasticSearch:Delete All')}
            content={
              <Grid
                container
                direction="column"
                justify="space-between"
                className={classes.deleteContent}
              >
                <Typography>
                  {t(
                    'elasticSearch:Are you sure want to delete all of the data from {{deviceType}} sensor_ {{sensorId}} in Elastic?',
                    {
                      deviceType: deleteTarget ? tDevice(deleteTarget.deviceType) : '',
                      sensorId: deleteTarget?.sensorId || '',
                    },
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  className={classes.dialogButton}
                  onClick={() => {
                    void handleCloseDeleteDialog(deleteTarget);
                  }}
                  disabled={deleteLoading}
                >
                  {t('common:Delete')}
                </Button>
              </Grid>
            }
            classes={{
              dialog: classes.deleteDialog,
            }}
          />
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default ElasticSearch;
