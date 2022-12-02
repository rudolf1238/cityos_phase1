import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  Action,
  DeviceStatus,
  DeviceType,
  Group,
  SortField,
  SortOrder,
  Subject,
} from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import {
  isDeviceStatus,
  isFilterType,
  isNumberString,
  isSortField,
  isSortOrder,
  isString,
} from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/src/hooks/useChangeRoute';
import useDeviceStatusTranslation from 'city-os-common/hooks/useDeviceStatusTranslation';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
import useSubscribeDevicesStatus, {
  SubscribeDevice,
} from 'city-os-common/hooks/useSubscribeDevicesStatus';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import StatusChip from 'city-os-common/modules/StatusChip';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import {
  DELETE_DEVICES,
  DeleteDevicesPayload,
  DeleteDevicesResponse,
} from '../../api/deleteDevices';
import {
  PartialNode,
  SEARCH_DEVICES_ON_DEVICE,
  SearchDevicesPayload,
  SearchDevicesResponse,
} from '../../api/searchDevicesOnDevice';
import useWebTranslation from '../../hooks/useWebTranslation';

import DeleteDeviceDialog from '../../modules/Devices/DeleteDeviceDialog';
import DetailsIcon from '../../assets/icon/details.svg';
import ExportDevices from '../../modules/Devices/ExportDevices';

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
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  dialog: {
    width: 600,
    height: 270,
  },

  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
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
}

interface RowData extends PartialNode {
  key: string;
  isLoading?: boolean;
  status: DeviceStatus;
}

interface CustomColumn<T> extends Omit<Column<T>, 'field'> {
  field: string;
}

const DeviceManagement: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'column', 'device']);
  const { tDevice } = useDeviceTranslation();
  const { tDeviceStatus } = useDeviceStatusTranslation();
  const classes = useStyles();
  const router = useRouter();
  const isMountedRef = useIsMountedRef();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.DEVICE]);

  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [openAddDevicesDialog, setOpenAddDevicesDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [searchData, setSearchData] = useState<SearchDevicesResponse['searchDevices']>();

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup, joinedGroups },
  } = useStore();

  const type = isFilterType(router.query.type) ? router.query.type : 'ALL';
  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isSortField(router.query.sortBy) ? router.query.sortBy : undefined;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );

  const { refetch: refetchDevice } = useQuery<SearchDevicesResponse, SearchDevicesPayload>(
    SEARCH_DEVICES_ON_DEVICE,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        filter: {
          sortField: sortField && sortOrder ? sortField : undefined,
          sortOrder: sortField && sortOrder ? sortOrder : undefined,
          type: type !== 'ALL' ? type : undefined,
          keyword,
        },
        size: rowsPerPage,
        after: startCursorList[requestPage],
      },
      skip:
        !router.isReady ||
        !divisionGroup?.id ||
        !permissionGroup?.group.id ||
        !!(router.query.gid && router.query.gid !== divisionGroup.id),
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ searchDevices }) => {
        setStartCursorList((prev) => {
          const newCursorList = [...prev];
          newCursorList[requestPage + 1] = searchDevices.pageInfo.endCursor;
          return newCursorList;
        });
        if (requestPage === paramPage - 1) setSearchData(searchDevices);
        if ((paramPage - 1) * rowsPerPage >= searchDevices.totalCount || paramPage < 1) {
          changeRoute({ p: 1 });
        }
      },
    },
  );

  const [deleteDevices] = useMutation<DeleteDevicesResponse, DeleteDevicesPayload>(DELETE_DEVICES, {
    onCompleted: ({ deleteDevices: removedList }) => {
      if (removedList.length === selectedRows.length) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('device:The device has been removed successfully_', {
              count: removedList.length,
            }),
          },
        });
        setSelectedRows([]);
      }
      if (removedList.length < selectedRows.length) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t('device:Not all devices were able to be removed successfully_'),
          },
        });
        setSelectedRows((prev) =>
          prev.filter(({ deviceId }) => removedList.every((removedId) => removedId !== deviceId)),
        );
      }
      setStartCursorList([undefined]);
      void refetchDevice();
    },
  });

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

  const renderDesc = useCallback(
    (rowData: RowData) => <div className={classes.desc}>{rowData.desc}</div>,
    [classes],
  );

  const renderStatus = useCallback(
    (rowData: RowData) =>
      rowData.isLoading ? (
        <CircularProgress size={16} />
      ) : (
        <StatusChip
          label={isDeviceStatus(rowData.status) ? tDeviceStatus(rowData.status) : rowData.status}
          color={rowData.status === DeviceStatus.ERROR ? 'error' : 'default'}
        />
      ),
    [tDeviceStatus],
  );

  const handleClickRemoveIcon = useCallback(() => {
    if (selectedRows.length < 1) return;
    if (selectedRows.length === 1) {
      const canRemove = selectedRows[0].groups.some(({ id }) => id === divisionGroup?.id);
      if (canRemove) {
        setOpenRemoveDialog(true);
      } else {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('device:Cannot remove the devices that do not belong to {{divisionName}}_', {
              divisionName: divisionGroup?.name || '',
            }),
          },
        });
      }
      return;
    }
    setOpenRemoveDialog(true);
  }, [dispatch, divisionGroup?.id, divisionGroup?.name, selectedRows, t]);

  const handleCloseRemoveDialog = useCallback(
    async (isDeleted) => {
      if (isDeleted && divisionGroup?.id) {
        const deviceIds = selectedRows.map(({ deviceId }) => deviceId);
        await deleteDevices({
          variables: {
            groupId: divisionGroup.id,
            deviceIds,
          },
        });
      }
      if (isMountedRef.current) setOpenRemoveDialog(false);
    },
    [divisionGroup?.id, isMountedRef, selectedRows, deleteDevices],
  );

  const handleDetail = useCallback(() => {
    const queryId: string = selectedRows[0].deviceId;
    if (!permissionGroup?.group.id) return;
    void router.push(
      {
        pathname: `${subjectRoutes[Subject.DEVICE]}/detail`,
        query: { pid: permissionGroup.group.id, id: queryId, back: router.asPath },
      },
      {
        pathname: `${subjectRoutes[Subject.DEVICE]}/detail`,
        query: { pid: permissionGroup.group.id, id: queryId },
      },
    );
  }, [selectedRows, permissionGroup?.group.id, router]);

  const handleOpenAddDevicesDialog = useCallback(() => {
    setOpenAddDevicesDialog(true);
  }, []);

  const handleCloseAddDevicesDialog = useCallback(() => {
    setOpenAddDevicesDialog(false);
  }, []);

  const handleAddDevices = useCallback(() => {
    setOpenAddDevicesDialog(false);
    if (!permissionGroup?.group.id || !divisionGroup?.id) return;
    void router.push(
      {
        pathname: `${subjectRoutes[Subject.DEVICE]}/addDevices`,
        query: { pid: permissionGroup.group.id, gid: divisionGroup.id, back: router.asPath },
      },
      {
        pathname: `${subjectRoutes[Subject.DEVICE]}/addDevices`,
        query: { pid: permissionGroup.group.id, gid: divisionGroup.id },
      },
    );
  }, [permissionGroup?.group.id, divisionGroup?.id, router]);

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
        ? searchData.edges.map(({ node }) => ({
            ...node,
            key: node.deviceId,
            isLoading: deviceStatusList.isLoading,
            status:
              deviceStatusList.data.find(({ deviceId }) => deviceId === node.deviceId)?.status ||
              DeviceStatus.ERROR,
          }))
        : [],
    [searchData, deviceStatusList],
  );

  const columns = useMemo<CustomColumn<RowData>[]>(
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
        title: t('common:Description'),
        field: 'desc',
        render: renderDesc,
      },
      {
        title: t('common:Status'),
        field: 'status',
        render: renderStatus,
      },
    ],
    [sortField, sortOrder, t, renderType, renderDesc, renderGroup, renderStatus, getHandleSort],
  );

  const isRootDivision = useMemo(() => {
    const selectedDivision = joinedGroups?.find(({ id }) => id === divisionGroup?.id);
    return selectedDivision && !selectedDivision.projectKey;
  }, [joinedGroups, divisionGroup?.id]);

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <MainLayout>
      <Guard subject={Subject.DEVICE} action={Action.VIEW}>
        <PageContainer>
          <Header
            title={t('device:Device Management')}
            description={t('device:Total Device_ {{count}}', {
              count: searchData?.totalCount || 0,
            })}
          />
          <Grid container spacing={2}>
            {permissionGroup?.group.subGroups && permissionGroup.group.subGroups.length > 0 && (
              <Grid item xs={12} lg={4}>
                <DivisionSelector classes={classes.divisionSelector} onChange={handleGroupChange} />
              </Grid>
            )}
            <Grid item xs={6} lg={2} className={classes.filedWrapper}>
              <TextField
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
                  <Guard subject={Subject.DEVICE} action={Action.REMOVE} fallback={null}>
                    <ThemeIconButton
                      tooltip={t('common:Remove')}
                      color="primary"
                      onClick={handleClickRemoveIcon}
                    >
                      <DeleteIcon />
                    </ThemeIconButton>
                  </Guard>
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
              <Guard
                subject={Subject.DEVICE}
                action={Action.ADD}
                fallback={null}
                forbidden={isRootDivision}
              >
                <ThemeIconButton
                  tooltip={t('device:Add Device')}
                  color="primary"
                  variant="contained"
                  onClick={handleOpenAddDevicesDialog}
                >
                  <AddIcon />
                </ThemeIconButton>
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
                <ThemeTablePagination
                  count={searchData.totalCount}
                  rowsPerPage={rowsPerPage}
                  page={paramPage - 1}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </Grid>
          </Grid>
          <BaseDialog
            open={openAddDevicesDialog}
            onClose={handleCloseAddDevicesDialog}
            title={t('device:Add Devices')}
            classes={{ dialog: classes.dialog, content: classes.dialogContent }}
            content={
              <>
                <Typography variant="body1">
                  {t(
                    "device:All imported devices will be assigned to the division '{{divisionName}}'_ Do you wish to proceed?",
                    { divisionName: divisionGroup?.name || '' },
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={handleAddDevices}
                  className={classes.dialogButton}
                >
                  {t('common:Start')}
                </Button>
              </>
            }
          />
          <DeleteDeviceDialog
            open={openRemoveDialog}
            selectedRows={selectedRows}
            classes={{
              root: classes.dialog,
              content: classes.dialogContent,
              button: classes.dialogButton,
            }}
            onClose={handleCloseRemoveDialog}
          />
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default DeviceManagement;
