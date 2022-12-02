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

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';

import {
  Action,
  DeviceType,
  Group,
  SortField,
  SortOrder,
  Subject,
} from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import {
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
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import UnknownIcon from 'city-os-common/assets/icon/unknown.svg';

import {
  PartialNode,
  SEARCH_DEVICES_ON_DEVICE,
  SearchDevicesPayload,
  SearchDevicesResponse,
} from '../api/searchDevicesOnDevice';
import {
  RESTORE_DEVICES,
  RestoreDevicesPayload,
  RestoreDevicesResponse,
} from '../api/restoreDevices';
import useWebTranslation from '../hooks/useWebTranslation';

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
}

interface RowData extends PartialNode {
  key: string;
}

interface CustomColumn<T> extends Omit<Column<T>, 'field'> {
  field: string;
}

const RecycleBin: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'column', 'device', 'recycleBin']);
  const { tDevice } = useDeviceTranslation();
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.RECYCLE_BIN]);

  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [searchData, setSearchData] = useState<SearchDevicesResponse['searchDevices']>();

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
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
          disabled: true,
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

  const [restoreDevices] = useMutation<RestoreDevicesResponse, RestoreDevicesPayload>(
    RESTORE_DEVICES,
    {
      onCompleted: ({ restoreDevices: restoreList }) => {
        if (restoreList.length === selectedRows.length) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('recycleBin:The device has been restored successfully_', {
                count: restoreList.length,
              }),
            },
          });
          setSelectedRows([]);
        }
        if (restoreList.length < selectedRows.length) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t('recycleBin:Not all devices were able to be restored successfully_'),
            },
          });
          setSelectedRows((prev) =>
            prev.filter(({ deviceId }) => restoreList.every((removedId) => removedId !== deviceId)),
          );
        }
        setStartCursorList([undefined]);
        void refetchDevice();
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

  const restoreDevicesMemFunc = useCallback(
    async (isDeleted) => {
      if (isDeleted && divisionGroup?.id) {
        const deviceIds = selectedRows.map(({ deviceId }) => deviceId);
        await restoreDevices({
          variables: {
            groupId: divisionGroup.id,
            deviceIds,
          },
        });
      }
    },
    [divisionGroup?.id, selectedRows, restoreDevices],
  );

  const handleClickRestoreIcon = useCallback(() => {
    if (selectedRows.length >= 1) {
      void restoreDevicesMemFunc(true);
    }
  }, [restoreDevicesMemFunc, selectedRows.length]);

  const tableData = useMemo<RowData[]>(
    () =>
      searchData
        ? searchData.edges.map(({ node }) => ({
            ...node,
            key: node.deviceId,
          }))
        : [],
    [searchData],
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
        title: t('common:Description'),
        field: 'desc',
        render: renderDesc,
      },
    ],
    [sortField, sortOrder, t, renderType, renderDesc, renderGroup, getHandleSort],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <MainLayout>
      <Guard subject={Subject.DEVICE} action={Action.VIEW}>
        <PageContainer>
          <Header
            title={t('common:Recycle Bin')}
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
                      tooltip={t('recycleBin:Restore')}
                      color="primary"
                      onClick={handleClickRestoreIcon}
                    >
                      <UnknownIcon />
                    </ThemeIconButton>
                  </Guard>
                  <Divider orientation="vertical" />
                </>
              )}
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
                />
              )}
            </Grid>
          </Grid>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default RecycleBin;
