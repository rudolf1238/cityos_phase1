import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

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
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TablePagination from '@material-ui/core/TablePagination';

import { Action, SortOrder, Subject } from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';

import { isNumberString, isSortOrder, isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import AddIcon from '@material-ui/icons/Add';
import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import EditIcon from '@material-ui/icons/Edit';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import ReducerActionType from 'city-os-common/reducers/actions';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import {
  GET_MALDEVICES_ON_DEVICE,
  GetDeviceResponse,
  GetMalDevicePayload,
  PartialNode,
} from '../../api/getMalDevices';

import DeviceIcon from '../../modules/common/DeviceIcon';
import NotifyIcon from '../../modules/common/NotifyIcon';
import StatusIcon from '../../modules/common/StatusIcon';

import {
  DELETE_MALDEVICES,
  DeleteMalDevicesPayload,
  DeleteMalDevicesResponse,
} from '../../api/deleteMalDevices';

// import AddDevices from '../../modules/MalDevices/AddDevices';

import ACDevices from '../../modules/MalDevices/ACDevices';

import { MaldeviceSortField } from '../../libs/schema';
import { isMaldeviceSortField } from '../../libs/validators';
// import CUDevices from '../../modules/MalDevices/CUDevices';
import DeleteMalDeviceDialog from '../../modules/MalDevices/DeleteMalDeviceDialog';
import I18nAbnormalTranslationProvider from '../../modules/I18nAbnormalTranslationProvider';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    marginLeft: 'auto',

    '& > :first-child > .MuiDivider-vertical, & > :last-child > .MuiDivider-vertical': {
      display: 'none',
    },
  },

  panel: {
    justifyContent: 'center',
    marginTop: theme.spacing(5),
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    padding: theme.spacing(5, 7),
  },

  errorMessage: {
    minHeight: 16,
    marginTop: theme.spacing(1),
  },

  button: {
    maxWidth: 274,
  },

  scrollButtons: {
    backgroundColor: theme.palette.grey[50],
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

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
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

  pagination: {
    borderWidth: '0 1px 1px',
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  },

  loading: {
    marginTop: theme.spacing(10),
  },

  searchWrapper: {
    maxWidth: theme.spacing(35),

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  divisionSelector: {
    maxWidth: 600,

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },
}));

interface RowData extends PartialNode {
  key: string;
}

interface CustomColumn<T extends RowData> extends Omit<Column<T>, 'field'> {
  field: string;
}
interface Query {
  gid?: string;
  q?: string;
  sortBy?: MaldeviceSortField;
  order?: SortOrder;
  n?: number;
  p?: number;
}

interface MaldevicesData {
  name: string;
  id: string;
}

const Info: VoidFunctionComponent = () => {
  const { t } = useTranslation(['common', 'user', 'info', 'device']);
  const classes = useStyles();
  const router = useRouter();
  const isMountedRef = useIsMountedRef();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.INFO]);
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [openAddDevices, setOpenAddDevices] = useState(false);
  const [openEditDevices, setOpenEditDevices] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchData, setSearchData] = useState<GetDeviceResponse['getMalDevices']>();

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isMaldeviceSortField(router.query.sortBy) ? router.query.sortBy : undefined;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );

  const resetOnPageInit = useCallback(() => {
    setStartCursorList([undefined]);
    setSelectedRows([]);
  }, []);

  const { refetch } = useQuery<GetDeviceResponse, GetMalDevicePayload>(GET_MALDEVICES_ON_DEVICE, {
    variables: {
      groupId: divisionGroup?.id,
      filter: {
        maldeviceSortField: sortField && sortOrder ? sortField : undefined,
        sortOrder: sortField && sortOrder ? sortOrder : undefined,
        keyword,
      },
      size: rowsPerPage,
      after: startCursorList[requestPage],
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getMalDevices }) => {
      setStartCursorList((prev) => {
        const newCursorList = [...prev];
        newCursorList[requestPage + 1] = getMalDevices.pageInfo.endCursor;
        return newCursorList;
      });
      if (requestPage === paramPage - 1) setSearchData(getMalDevices);
      if ((paramPage - 1) * rowsPerPage >= getMalDevices.totalCount || paramPage < 1) {
        changeRoute({ p: 1 });
      }
    },
  });

  const maldevices = useMemo<MaldevicesData[]>(
    () => [
      {
        name: t('info:DeviceType'),
        id: '1',
      },
    ],
    [t],
  );

  const tabTitles = useMemo(
    () =>
      maldevices.map((maldevice) => ({
        title: maldevice.name,
        tabId: maldevice.id,
      })),
    [maldevices],
  );

  const handleSelectTab = useCallback((index: number): boolean => {
    setTabIndex(index);
    setSelectedRows([]);
    return true;
  }, []);

  const handleTableSelect = useCallback(
    (currentSelected) => {
      if (tabIndex === 0) setSelectedRows(currentSelected);
    },
    [tabIndex, setSelectedRows],
  );

  const tableData = useMemo<RowData[]>(
    () => (searchData ? searchData.edges.map(({ node }) => ({ ...node, key: node.name })) : []),

    [searchData],
  );

  const renderDeviceType = useCallback(
    (rowData: RowData) => (
      <div className={classes.type}>
        {rowData.deviceType.map((list) => (
          <DeviceIcon type={list} className={classes.typeIcon} />
        ))}
      </div>
    ),
    [classes],
  );

  const renderNotifyType = useCallback(
    (rowData: RowData) => (
      <div className={classes.type}>
        {rowData.notifyType.map((list) => (
          <NotifyIcon type={list} className={classes.typeIcon} />
        ))}
      </div>
    ),
    [classes],
  );

  const renderStatusType = useCallback(
    (rowData: RowData) => (
      <div className={classes.type}>
        <StatusIcon type={rowData.status} className={classes.typeIcon} />
      </div>
    ),
    [classes],
  );

  const getHandleSort = useCallback(
    (newSortField: MaldeviceSortField, newSortOrder: SortOrder) => {
      changeRoute({
        sortBy: newSortField,
        order: newSortOrder,
        p: 1,
      });
      resetOnPageInit();
    },
    [changeRoute, resetOnPageInit],
  );

  const columns = useMemo<Array<CustomColumn<RowData>>>(
    () => [
      {
        title: t('info:Name'),
        field: 'name',
        textWrap: 'nowrap',
        sort: (newSortOrder: SortOrder) => getHandleSort(MaldeviceSortField.NAME, newSortOrder),
      },
      {
        title: t('info:DeviceType'),
        field: 'deviceType',
        render: renderDeviceType,
      },
      {
        title: t('info:NotifyType'),
        field: 'notifyType',
        render: renderNotifyType,
      },
      {
        title: t('info:Status'),
        field: 'status',
        render: renderStatusType,
        sort: (newSortOrder: SortOrder) => getHandleSort(MaldeviceSortField.STATUS, newSortOrder),
      },
    ],
    [getHandleSort, renderDeviceType, renderNotifyType, renderStatusType, t],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  const handleOpenEditDevices = useCallback(() => {
    setOpenEditDevices(true);
  }, []);

  const handleCloseEditDevices = useCallback(() => {
    // async () => {
    void refetch();
    setOpenEditDevices(false);
    setSelectedRows([]);
    // }
  }, [refetch]);

  const handleOpenAddDevices = useCallback(() => {
    setOpenAddDevices(true);
  }, []);

  const handleCloseAddDevices = useCallback(() => {
    // async () => {
    void refetch();
    setOpenAddDevices(false);
    // }
  }, [refetch]);

  const handleDelete = useCallback(() => {
    let canRemove = true;
    if (tabIndex === 0 && selectedRows.length >= 1) {
      for (let i = 0; i <= selectedRows.length - 1; i += 1) {
        canRemove = selectedRows[i].division_id.some((list) => list === divisionGroup?.id);
        if (canRemove === false) break;
      }
    }
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
      return;
    }

    setOpenRemoveDialog(true);
  }, [dispatch, divisionGroup?.id, divisionGroup?.name, selectedRows, t, tabIndex]);

  const [deleteMlDevices] = useMutation<DeleteMalDevicesResponse, DeleteMalDevicesPayload>(
    DELETE_MALDEVICES,
    {
      onCompleted: ({ deleteMlDevices: removedList }) => {
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
            prev.filter(({ name }) => removedList.every((removedName) => removedName !== name)),
          );
        }
        setStartCursorList([undefined]);
        void refetch();
      },
    },
  );

  const handleCloseRemoveDialog = useCallback(
    async (isDeleted) => {
      if (isDeleted && divisionGroup?.id) {
        const names = selectedRows.map(({ name }) => name);
        await deleteMlDevices({
          variables: {
            groupId: divisionGroup.id,
            names,
          },
        });
      }
      if (isMountedRef.current) setOpenRemoveDialog(false);
    },
    [divisionGroup?.id, isMountedRef, selectedRows, deleteMlDevices],
  );

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

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId, p: 1 });
      resetOnPageInit();
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

  return (
    <I18nAbnormalTranslationProvider>
      <MainLayout>
        <Guard subject={Subject.DEVICE} action={Action.VIEW}>
          <PageContainer>
            <Header
              title={t('info:Maldevice Notify Design')}
              description={t('info:Total Device_ {{count}}', {
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
              <Grid item xs={12} lg={4} className={classes.searchWrapper}>
                <BasicSearchField
                  value={searchValue}
                  placeholder={t('info:Search')}
                  size="small"
                  InputProps={{ margin: 'none' }}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Grid container className={classes.buttons}>
                  {selectedRows.length > 0 && (
                    <>
                      <Guard subject={Subject.DEVICE} action={Action.REMOVE} fallback={null}>
                        <ThemeIconButton
                          tooltip={t('common:Remove')}
                          color="primary"
                          onClick={handleDelete}
                        >
                          <DeleteIcon />
                        </ThemeIconButton>
                      </Guard>
                      {selectedRows.length === 1 && (
                        <>
                          <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={null}>
                            <Grid item>
                              <ThemeIconButton
                                tooltip={t('common:Edit')}
                                color="primary"
                                variant="contained"
                                onClick={handleOpenEditDevices}
                              >
                                <EditIcon />
                              </ThemeIconButton>

                              <ACDevices
                                type="E"
                                queryId={selectedRows[0].name}
                                open={openEditDevices}
                                onClose={handleCloseEditDevices}
                              />
                            </Grid>
                          </Guard>
                        </>
                      )}
                      <Divider orientation="vertical" />
                    </>
                  )}

                  <Guard subject={Subject.DEVICE} action={Action.ADD} fallback={null}>
                    <Grid item>
                      <ThemeIconButton
                        tooltip={t('common:Add')}
                        color="primary"
                        variant="contained"
                        onClick={handleOpenAddDevices}
                      >
                        <AddIcon />
                      </ThemeIconButton>
                    </Grid>
                    <ACDevices
                      type="A"
                      queryId=""
                      open={openAddDevices}
                      onClose={handleCloseAddDevices}
                    />
                  </Guard>
                </Grid>
              </Grid>
            </Grid>

            <div className={classes.panel}>
              <TabPanelSet
                tabsColor="transparent"
                tabTitles={tabTitles}
                index={tabIndex}
                classes={{
                  scrollButtons: classes.scrollButtons,
                }}
                onSelect={handleSelectTab}
              />
              <NestedTable
                columns={columns}
                data={tableData}
                selectedRows={selectedRows}
                classes={{ container: classes.nestedTable }}
                keepSelectColumn
                disableNoDataMessage={!searchData}
                onSelect={handleTableSelect}
              />

              <DeleteMalDeviceDialog
                open={openRemoveDialog}
                selectedRows={selectedRows}
                classes={{
                  root: classes.dialog,
                  content: classes.dialogContent,
                  button: classes.dialogButton,
                }}
                onClose={handleCloseRemoveDialog}
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
            </div>
          </PageContainer>
        </Guard>
      </MainLayout>
    </I18nAbnormalTranslationProvider>
  );
};

export default memo(Info);
