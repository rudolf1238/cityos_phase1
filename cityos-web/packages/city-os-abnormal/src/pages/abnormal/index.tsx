import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';

import {
  Action,
  DeviceStatus,
  DeviceType,
  Group,
  MaintainStatus,
  SortField,
  SortOrder,
  Subject,
} from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import {
  isFilterDeviceStatus,
  isFilterType,
  isMaintainStatus,
  isNumberString,
  isSortField,
  isSortOrder,
  isString,
} from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import StatusChip from 'city-os-common/modules/StatusChip';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useDeviceStatusTranslation from 'city-os-common/hooks/useDeviceStatusTranslation';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useMaintainStatusTranslation from 'city-os-common/hooks/useMaintainStatusTranslation';
import useSubscribeDevicesStatus, {
  SubscribeDevice,
} from 'city-os-common/hooks/useSubscribeDevicesStatus';

import {
  PartialNodeAbnormal,
  SEARCH_DEVICES_ABNORMAL_DEVICE,
  SearchDevicesPayloadAbnormal,
  SearchDevicesResponseAbnormal,
} from '../../api/searchDevicesAbnormalDevice';

import DetailsIcon from '../../assets/icon/details.svg';

import ExportDevices from '../../modules/Devices/ExportDevices';

import I18nProvider from '../../modules/I18nAbnormalTranslationProvider';

import useAbnormalTranslation from '../../hooks/useAbnormalTranslation';

const getGroupsString = (groups: Group[]): string =>
  groups
    .reduce<string[]>((acc, group) => (group.name ? acc.concat(group.name) : acc), [])
    .join(', ');

const useStyles = makeStyles((theme) => ({
  divisionSelector: {
    maxWidth: 600,

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  filedWrapper: {
    maxWidth: 280,

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  search: {
    width: '100%',
  },

  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-start',
    marginLeft: 'auto',

    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },

    '& > .MuiDivider-vertical:last-child': {
      display: 'none',
    },
  },

  tableWrapper: {
    width: 0,
    textAlign: 'center',
  },

  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },

  typeIcon: {
    height: theme.spacing(2.5),
    color: theme.palette.info.main,
  },

  group: {
    minWidth: 210,
  },

  desc: {
    width: 240,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  dialog: {
    width: 600,
    height: 270,
  },

  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    marginBottom: 0,
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  pagination: {
    borderWidth: '0 1px 1px',
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    transform: 'translate3d(0, 0, 0)',
  },

  loading: {
    marginTop: theme.spacing(10),
  },
}));

interface Query {
  gid?: string;
  type?: DeviceType | 'ALL';
  q?: string;
  sortBy?: SortField;
  order?: SortOrder;
  n?: number;
  p?: number;
  status?: DeviceStatus | 'ALL';
  maintainstatus?: MaintainStatus | 'ALL';
}

interface RowData extends PartialNodeAbnormal {
  key: string;
  isLoading?: boolean;
  status: DeviceStatus;
}

interface CustomColumn<T extends RowData> extends Omit<Column<T>, 'field'> {
  field: string;
}

const Abnormal: VoidFunctionComponent = () => {
  const { t } = useAbnormalTranslation(['common', 'column', 'device']);
  const { tDevice } = useDeviceTranslation();
  const { tDeviceStatus } = useDeviceStatusTranslation();
  const { tMaintainStatus } = useMaintainStatusTranslation();
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.ABNORMAL_MANAGEMENT]);
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchData, setSearchData] = useState<
    SearchDevicesResponseAbnormal['searchAbnormalDevices']
  >();

  const {
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const type = isFilterType(router.query.type) ? router.query.type : 'ALL';
  const status = isFilterDeviceStatus(router.query.status)
    ? router.query.status
    : DeviceStatus.ERROR;
  const maintainstatus = isMaintainStatus(router.query.maintainstatus)
    ? router.query.maintainstatus
    : 'ALL';
  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isSortField(router.query.sortBy) ? router.query.sortBy : undefined;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );

  useQuery<SearchDevicesResponseAbnormal, SearchDevicesPayloadAbnormal>(
    SEARCH_DEVICES_ABNORMAL_DEVICE,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        filter: {
          sortField: sortField && sortOrder ? sortField : undefined,
          sortOrder: sortField && sortOrder ? sortOrder : undefined,
          type: type !== 'ALL' ? type : undefined,
          status: status !== 'ALL' ? status : undefined,
          maintainstatus: maintainstatus !== 'ALL' ? maintainstatus : undefined,
          keyword,
        },
        size: rowsPerPage,
        skip: requestPage,
      },
      skip:
        !router.isReady ||
        !divisionGroup?.id ||
        !permissionGroup?.group.id ||
        !!(router.query.gid && router.query.gid !== divisionGroup.id),
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ searchAbnormalDevices }) => {
        setStartCursorList((prev) => {
          const newCursorList = [...prev];
          newCursorList[requestPage + 1] = searchAbnormalDevices.pageInfo.endCursor;
          return newCursorList;
        });
        if (requestPage === paramPage - 1) setSearchData(searchAbnormalDevices);
        if ((paramPage - 1) * rowsPerPage >= searchAbnormalDevices.totalCount || paramPage < 1) {
          changeRoute({ p: 1 });
        }
      },
    },
  );

  const resetOnPageInit = useCallback(() => {
    setStartCursorList([undefined]);
    setSelectedRows([]);
  }, []);

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId, p: 1 });
      resetOnPageInit();
    },
    [changeRoute, resetOnPageInit],
  );

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newType = e.target.value;
      if (isFilterType(newType)) {
        changeRoute({ type: newType, p: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleDeviceStatusChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newStatus = e.target.value;
      if (isFilterDeviceStatus(newStatus)) {
        changeRoute({ status: newStatus, p: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleMaintainStatusChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newMaintainStatus = e.target.value;
      if (isMaintainStatus(newMaintainStatus)) {
        changeRoute({ maintainstatus: newMaintainStatus, p: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );

  const handleSearch = useCallback(
    (newKeyword: string | null) => {
      if (newKeyword !== null) {
        changeRoute({ q: newKeyword, p: 1 });
        resetOnPageInit();
      }
    },
    [changeRoute, resetOnPageInit],
  );

  const handleClearSearch = useCallback(() => {
    changeRoute({ p: 1 }, ['q']);
    setSearchValue('');
    resetOnPageInit();
  }, [changeRoute, resetOnPageInit]);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeRoute({
        n: parseInt(event.target.value, 10),
        p: 1,
      });
      setStartCursorList([undefined]);
    },
    [changeRoute],
  );

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      changeRoute({ p: newPage + 1 });
      setSearchData(undefined);
    },
    [changeRoute],
  );

  const getHandleSort = useCallback(
    (newSortField: SortField, newSortOrder: SortOrder) => {
      changeRoute({
        sortBy: newSortField,
        order: newSortOrder,
        p: 1,
      });
      resetOnPageInit();
    },
    [changeRoute, resetOnPageInit],
  );

  const handleTableSelect = useCallback((currentSelected) => {
    setSelectedRows(currentSelected);
  }, []);

  const renderType = useCallback(
    (rowData: RowData) => (
      <div className={classes.type}>
        <DeviceIcon type={rowData.type} className={classes.typeIcon} />
        {tDevice(rowData.type)}
      </div>
    ),
    [classes, tDevice],
  );

  const renderGroup = useCallback(
    (rowData: RowData) => <div className={classes.group}>{getGroupsString(rowData.groups)}</div>,
    [classes],
  );

  const renderStatus = useCallback(
    (rowData: RowData) =>
      rowData.isLoading ? (
        <CircularProgress size={16} />
      ) : (
        <StatusChip
          label={
            isFilterDeviceStatus(rowData.status) ? tDeviceStatus(rowData.status) : rowData.status
          }
          color={rowData.status === DeviceStatus.ERROR ? 'error' : 'default'}
        />
      ),
    [tDeviceStatus],
  );

  const renderMaintainStatus = useCallback(
    (rowData: RowData) =>
      // eslint-disable-next-line no-nested-ternary
      rowData.isLoading ? (
        <CircularProgress size={16} />
      ) : rowData.maintainstatus ? (
        <StatusChip
          label={
            isMaintainStatus(rowData.maintainstatus)
              ? tMaintainStatus(rowData.maintainstatus)
              : rowData.maintainstatus
          }
          color={
            // eslint-disable-next-line no-nested-ternary
            rowData.maintainstatus === MaintainStatus.PROCESSING
              ? 'repair'
              : // eslint-disable-next-line no-nested-ternary
              rowData.maintainstatus === MaintainStatus.DONE
              ? 'done'
              : rowData.maintainstatus === MaintainStatus.ERROR
              ? 'error'
              : 'none'
          }
        />
      ) : null,
    [tMaintainStatus],
  );

  const handleDetail = useCallback(() => {
    const queryId: string = selectedRows[0].deviceId;
    if (!permissionGroup?.group.id) return;
    void router.push(
      {
        pathname: `${subjectRoutes[Subject.ABNORMAL_MANAGEMENT]}/detail`,
        query: { pid: permissionGroup.group.id, id: queryId, back: router.asPath },
      },
      {
        pathname: `${subjectRoutes[Subject.ABNORMAL_MANAGEMENT]}/detail`,
        query: { pid: permissionGroup.group.id, id: queryId },
      },
    );
  }, [selectedRows, permissionGroup?.group.id, router]);

  const subscribeDeviceList = useMemo<SubscribeDevice[]>(
    () =>
      searchData
        ? searchData.edges.map(({ node }) => ({
            deviceId: node.deviceId,
            type: node.type,
          }))
        : [],
    [searchData],
  );

  const deviceStatusList = useSubscribeDevicesStatus(subscribeDeviceList);

  const tableData = useMemo<RowData[]>(
    () =>
      searchData
        ? searchData.edges
            // .filter(({ node }) => (node.status === 'ERROR'))
            .map(({ node }) => ({
              ...node,
              key: node.deviceId,
              isLoading: deviceStatusList.isLoading,
              status: node.status || DeviceStatus.ERROR,
              // deviceStatusList.data.find(({ deviceId }) => deviceId === node.deviceId)?.status ||
              // DeviceStatus.ERROR,
            }))
        : [],
    [searchData, deviceStatusList],
  );

  const columns = useMemo<Array<CustomColumn<RowData>>>(
    () => [
      {
        title: t('column:Device ID'),
        field: 'deviceId',
        textWrap: 'nowrap',
        sortOrder: sortField === SortField.ID ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(SortField.ID, newSortOrder),
      },
      {
        title: t('column:Device Name'),
        field: 'name',
        textWrap: 'nowrap',
        sortOrder: sortField === SortField.NAME ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(SortField.NAME, newSortOrder),
      },
      {
        title: t('common:Type'),
        field: 'type',
        textWrap: 'nowrap',
        sortOrder: sortField === SortField.TYPE ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(SortField.TYPE, newSortOrder),
        render: renderType,
      },
      {
        title: t('common:Divisions'),
        field: 'group',
        render: renderGroup,
      },
      {
        title: t('common:Status'),
        field: 'status',
        sortOrder: sortField === SortField.STATUS ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(SortField.STATUS, newSortOrder),
        render: renderStatus,
      },
      {
        title: t('common:Maintain Status'),
        field: 'maintainstatus',
        sortOrder: sortField === SortField.MAINTAINSTATUS ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(SortField.MAINTAINSTATUS, newSortOrder),
        render: renderMaintainStatus,
      },
    ],
    [
      t,
      sortField,
      sortOrder,
      renderType,
      renderGroup,
      renderStatus,
      renderMaintainStatus,
      getHandleSort,
    ],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <I18nProvider>
      <MainLayout>
        <Guard subject={Subject.DEVICE} action={Action.VIEW}>
          <PageContainer>
            <Header
              title={t('device:Malfunction Device')}
              description={t('device:Total Device_ {{count}}', {
                count: searchData?.totalCount || 0,
              })}
            />
            <Grid container spacing={2}>
              {permissionGroup?.group.subGroups && permissionGroup.group.subGroups.length > 0 && (
                <Grid item xs={12} lg={4}>
                  <DivisionSelector
                    classes={classes.divisionSelector}
                    onChange={handleGroupChange}
                  />
                </Grid>
              )}
              <Grid item xs={6} lg={2} className={classes.filedWrapper}>
                <TextField
                  label={t('common:Type')}
                  onChange={handleFilterChange}
                  value={type}
                  variant="outlined"
                  type="text"
                  select
                  InputLabelProps={{ shrink: true }}
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
              <Grid item xs={6} lg={2} className={classes.filedWrapper}>
                <TextField
                  label={t('common:Status')}
                  onChange={handleDeviceStatusChange}
                  value={status}
                  variant="outlined"
                  type="text"
                  select
                  InputLabelProps={{ shrink: true }}
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
                >
                  <MenuItem key="ALL" value="ALL">
                    {t('common:All')}
                  </MenuItem>
                  {(Object.keys(DeviceStatus) as DeviceStatus[]).map((deviceStatus) => (
                    <MenuItem key={deviceStatus} value={deviceStatus}>
                      {tDeviceStatus(deviceStatus)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} lg={2} className={classes.filedWrapper}>
                <TextField
                  label={t('common:Maintain Status')}
                  onChange={handleMaintainStatusChange}
                  value={maintainstatus}
                  variant="outlined"
                  type="text"
                  select
                  InputLabelProps={{ shrink: true }}
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
                >
                  <MenuItem key="ALL" value="ALL">
                    {t('common:All')}
                  </MenuItem>
                  {(Object.keys(MaintainStatus) as MaintainStatus[]).map((maintainStatus) => (
                    <MenuItem key={maintainStatus} value={maintainStatus}>
                      {tMaintainStatus(maintainStatus)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} lg={3} className={classes.filedWrapper}>
                <BasicSearchField
                  value={searchValue}
                  placeholder={t('common:Search')}
                  className={classes.search}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </Grid>
              <Grid item xs={12} lg={3} className={classes.buttons}>
                {selectedRows.length > 0 && (
                  <>
                    {/* <Guard subject={Subject.DEVICE} action={Action.REMOVE} fallback={null}>
                                        <ThemeIconButton
                                            tooltip={t('common:Remove')}
                                            color="primary"
                                            onClick={handleClickRemoveIcon}
                                        >
                                            <DeleteIcon />
                                        </ThemeIconButton>
                                    </Guard> */}
                    <Guard subject={Subject.DEVICE} action={Action.VIEW} fallback={null}>
                      {selectedRows.length === 1 && (
                        <ThemeIconButton
                          tooltip={t('common:Details')}
                          color="primary"
                          variant="contained"
                          onClick={handleDetail}
                        >
                          <DetailsIcon />
                        </ThemeIconButton>
                      )}
                    </Guard>
                    <Divider orientation="vertical" />
                  </>
                )}
                <Guard subject={Subject.DEVICE} action={Action.EXPORT} fallback={null}>
                  <ExportDevices
                    sortField={sortField}
                    sortOrder={sortOrder}
                    filterType={type}
                    keyword={keyword}
                    columns={columns}
                  />
                </Guard>
              </Grid>
              <Grid item xs={12} className={classes.tableWrapper}>
                <NestedTable
                  keepSelectColumn
                  columns={columns}
                  data={tableData}
                  selectedRows={selectedRows}
                  onSelect={handleTableSelect}
                  classes={{
                    container:
                      searchData && searchData.totalCount > 0 ? classes.nestedTable : undefined,
                  }}
                  disableNoDataMessage={!searchData}
                />
                {!searchData && <CircularProgress className={classes.loading} />}
                {searchData && searchData.totalCount > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={searchData.totalCount}
                    rowsPerPage={rowsPerPage}
                    page={paramPage - 1}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    classes={{ root: classes.pagination }}
                    labelDisplayedRows={({ from, to, count }) =>
                      t('common:{{from}}-{{to}} of {{count}}', {
                        from,
                        to,
                        count,
                      })
                    }
                  />
                )}
              </Grid>
            </Grid>
          </PageContainer>
        </Guard>
      </MainLayout>
    </I18nProvider>
  );
};

export default Abnormal;
