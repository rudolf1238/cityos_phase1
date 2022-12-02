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

import { Action, Subject } from 'city-os-common/src/libs/schema';

import { WifiSortField, SortOrder } from '../libs/schema';

import { PartialCompany } from '../libs/types';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';

import { Column } from 'city-os-common/src/modules/NestedTable/NestedTableProvider';

import {
  isNumberString,
  isWifiSortField,
  isSortOrder,
  isString,
} from 'city-os-common/src/libs/validators';
import { useStore } from 'city-os-common/src/reducers';
import ReducerActionType from 'city-os-common/src/reducers/actions';
import subjectRoutes from 'city-os-common/src/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/src/hooks/useChangeRoute';
import useIsMountedRef from 'city-os-common/src/hooks/useIsMountedRef';

import ErrorPage from 'city-os-common/modules/ErrorPage';
import BasicSearchField from 'city-os-common/src/modules/BasicSearchField';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import Guard from 'city-os-common/src/modules/Guard';
import Header from 'city-os-common/src/modules/Header';
import MainLayout from 'city-os-common/src/modules/MainLayout';
import NestedTable from 'city-os-common/src/modules/NestedTable';
import PageContainer from 'city-os-common/src/modules/PageContainer';
import ThemeIconButton from 'city-os-common/src/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/src/modules/ThemeTablePagination';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DELETE_COMPANY, DeleteCompanyPayload, DeleteCompanyResponse } from '../api/deleteCompany';
import {
  SEARCH_COMPANYS_ON_WIFI,
  SearchCompanysPayload,
  SearchCompanysResponse,
} from '../api/searchCompanysOnWifi';
import I18nWifiProvider from './I18nWifiProvider';
import useWifiTranslation from '../hooks/useWifiTranslation';
import UserProfile from 'city-os-common/modules/MainLayout/ProfileMenu/UserProfile';
import DeleteCompanyDialog from './DeleteCompanyDialog';
import isGqlError from 'city-os-common/libs/isGqlError';
import ErrorCode from 'city-os-common/libs/errorCode';
import NoPermissionImg from 'city-os-common/assets/img/no-permission.svg';
import WIFICompany from './WifiCompany';

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
    marginBottom: 0,
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
  paper: {
    padding: theme.spacing(4, 11),
    width: 900,
  },

  form: {
    margin: 0,
    width: '100%',

    '& > .MuiGrid-item': {
      marginTop: theme.spacing(5),
    },
  },
}));

interface Query {
  gid?: string;
  q?: string;
  sortBy?: WifiSortField;
  order?: SortOrder;
  n?: number; // pagesize
  p?: number; // currentpage
}

interface RowData extends PartialCompany {
  key: string;
  isLoading?: boolean;
  // status: DeviceStatus;
}

interface CustomColumn<T extends RowData> extends Omit<Column<T>, 'field'> {
  field: string;
}

const Wifi: VoidFunctionComponent = () => {
  const { t } = useWifiTranslation(['wifi']);
  // const { t } = useWebTranslation(['common', 'wifi']);
  const classes = useStyles();
  const router = useRouter();
  const isMountedRef = useIsMountedRef();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.WIFI]);
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [openAddCompany, setOpenAddCompany] = useState(false);
  const [openEditCompany, setOpenEditCompany] = useState(false);
  const [searchData, setSearchData] = useState<SearchCompanysResponse['searchCompanys']>();

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup, joinedGroups, profile },
  } = useStore();

  // const type = isFilterType(router.query.type) ? router.query.type : 'ALL';
  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isWifiSortField(router.query.sortBy) ? router.query.sortBy : undefined;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );

  const { error, refetch } = useQuery<SearchCompanysResponse, SearchCompanysPayload>(
    SEARCH_COMPANYS_ON_WIFI,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        email: profile?.email || '', // email 應該不可為空值, to be verified.
        filter: {
          sortField: sortField && sortOrder ? sortField : undefined,
          sortOrder: sortField && sortOrder ? sortOrder : undefined,
          keyword,
        },
        currentPage: requestPage + 1,
        pageCount: rowsPerPage,
        // currentPage: startCursorList[requestPage],
      },
      skip:
        !router.isReady ||
        !divisionGroup?.id ||
        !permissionGroup?.group.id ||
        !!(router.query.gid && router.query.gid !== divisionGroup.id),
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ searchCompanys }) => {
        setStartCursorList((prev) => {
          const newCursorList = [...prev];
          newCursorList[requestPage + 1] = searchCompanys.pageInfo.endCursor;
          return newCursorList;
        });
        if (requestPage === paramPage - 1) setSearchData(searchCompanys);
        if ((paramPage - 1) * rowsPerPage >= searchCompanys.totalCount || paramPage < 1) {
          changeRoute({ p: 1 });
        }
      },
      onError: (error) => {
        isGqlError(error, ErrorCode.USER_ALREADY_EXISTED);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('wifi:Not found, Please try again_'),
          },
        });
      },
    },
  );

  const [deleteCompany] = useMutation<DeleteCompanyResponse, DeleteCompanyPayload>(DELETE_COMPANY, {
    onCompleted: ({ deleteCompany: removedList }) => {
      if (removedList.length === selectedRows.length) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('wifi:The company has been removed successfully_', {
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
            message: t('wifi:Company was not able to be removed successfully_'),
          },
        });
        setSelectedRows((prev) =>
          prev.filter(({ companyId }) => removedList.every((removedId) => removedId !== companyId)),
        );
      }
      setStartCursorList([undefined]);
      // void refetchCompany();
      void refetch();
    },
  });

  const resetOnPageInit = useCallback(() => {
    setStartCursorList([undefined]);
    setSelectedRows([]);
  }, []);

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

  const handleDetail = useCallback(() => {
    const queryId: string = selectedRows[0].id;
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

  const handleOpenEditCompany = useCallback(() => {
    setOpenEditCompany(true);
  }, []);

  const handleCloseEditCompany = useCallback(() => {
    // async () => {
    void refetch();
    setOpenEditCompany(false);
    setSelectedRows([]);
    // }
  }, [refetch]);

  const handleOpenAddCompany = useCallback(() => {
    setOpenAddCompany(true);
  }, []);

  const handleCloseAddCompany = useCallback(() => {
    // async () => {
    void refetch();
    setOpenAddCompany(false);
    setSelectedRows([]);
    // }
  }, [refetch]);

  const handleClickRemoveIcon = useCallback(() => {
    if (selectedRows.length < 1) return;
    if (selectedRows.length === 1) {
      // Cannot allow remove division here(without companyId)
      const canRemove = !(selectedRows[0].companyId === null || selectedRows[0].companyId == '');
      // const canRemove = selectedRows[0].groups.some(({ id }) => id === divisionGroup?.id);
      if (canRemove) {
        setOpenRemoveDialog(true);
      } else {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t('wifi:This is not a company, you cannot remove the division from here_'),
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
        const groupId = divisionGroup?.id;
        const divisionId = selectedRows.map(({ id }) => id);
        await deleteCompany({
          variables: {
            groupId: divisionGroup.id,
            divisionId: divisionId[0],
          },
        });
      }
      if (isMountedRef.current) setOpenRemoveDialog(false);
    },
    [divisionGroup?.id, isMountedRef, selectedRows, deleteCompany],
  );

  const renderLogo = useCallback(
    (rowData: RowData) => {
      return (
        rowData.logo && (
          <div className={classes.desc}>
            <img src={rowData.logo} alt={t('wifi:Logo not found_')} width="100%" height="100%" />
          </div>
        )
      );
    },
    [classes],
  );

  const getHandleSort = useCallback(
    (newSortField: WifiSortField, newSortOrder: SortOrder) => {
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

  const tableData = useMemo<RowData[]>(
    () =>
      searchData
        ? searchData.divisions.map(({ node }) => ({
            ...node,
            key: node.id,
          }))
        : [],
    [searchData],
  );

  const columns = useMemo<CustomColumn<RowData>[]>(
    () => [
      {
        title: t('wifi:Company ID'),
        field: 'companyId',
        textWrap: 'nowrap',
        sortOrder: sortField === WifiSortField.COMPANYID ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(WifiSortField.COMPANYID, newSortOrder),
      },
      {
        title: t('wifi:Division ID'),
        field: 'id',
        textWrap: 'nowrap',
        sortOrder: sortField === WifiSortField.ID ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(WifiSortField.ID, newSortOrder),
      },
      {
        title: t('wifi:Name'),
        field: 'name',
        textWrap: 'nowrap',
        sortOrder: sortField === WifiSortField.NAME ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(WifiSortField.NAME, newSortOrder),
      },
      {
        title: t('wifi:Logo'),
        field: 'logo',
        render: renderLogo,
      },
      {
        title: t('wifi:Url'),
        field: 'url',
      },
    ],
    [sortField, sortOrder, t, getHandleSort],
  );

  const isRootDivision = useMemo(() => {
    const selectedDivision = joinedGroups?.find(({ id }) => id === divisionGroup?.id);
    return selectedDivision && !selectedDivision.projectKey;
  }, [joinedGroups, divisionGroup?.id]);

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  return (
    <I18nWifiProvider>
      <MainLayout>
        <Guard subject={Subject.WIFI} action={Action.VIEW} forbidden={isForbidden}>
          {searchData && searchData?.totalCount === 0 && (
            <ErrorPage
              text={t(
                'wifi:There are no functions available_ Please contact the person who invited you for access_',
              )}
              img={<NoPermissionImg />}
            />
          )}
          <PageContainer>
            <Header
              title={t('wifi:Wifi Advertisement Management')}
              description={t('wifi:Total Company_{{count}}', {
                count: searchData?.totalCount || 0,
              })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6} lg={3} className={classes.filedWrapper}>
                <BasicSearchField
                  value={searchValue}
                  placeholder={t('wifi:Search')}
                  className={classes.search}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </Grid>
              <Grid item xs={12} lg={3} className={classes.buttons}>
                {selectedRows.length > 0 && (
                  <>
                    {selectedRows.length === 1 && (
                      <>
                        {selectedRows[0].companyId !== null && (
                          <>
                            <Guard subject={Subject.WIFI} action={Action.REMOVE} fallback={null}>
                              <ThemeIconButton
                                tooltip={t('wifi:Remove')}
                                color="primary"
                                onClick={handleClickRemoveIcon}
                              >
                                <DeleteIcon />
                              </ThemeIconButton>
                            </Guard>

                            <Guard subject={Subject.WIFI} action={Action.MODIFY} fallback={null}>
                              <ThemeIconButton
                                tooltip={t('wifi:Edit')}
                                color="primary"
                                variant="contained"
                                onClick={handleOpenEditCompany}
                              >
                                <EditIcon />
                              </ThemeIconButton>
                            </Guard>
                            <Guard subject={Subject.WIFI} action={Action.MODIFY} fallback={null}>
                              <ThemeIconButton
                                tooltip={t('wifi:Next')}
                                color="primary"
                                variant="contained"
                              >
                                <NavigateNextIcon />
                              </ThemeIconButton>

                              <WIFICompany
                                type="E"
                                divisionId={selectedRows[0].id}
                                companyId={selectedRows[0].companyId}
                                name={selectedRows[0].name}
                                logo={selectedRows[0].logo}
                                url={selectedRows[0].url}
                                line={selectedRows[0].line}
                                open={openEditCompany}
                                onClose={handleCloseEditCompany}
                              />
                            </Guard>
                          </>
                        )}

                        {selectedRows[0].companyId === null && (
                          <>
                            <Guard subject={Subject.WIFI} action={Action.ADD} fallback={null}>
                              <ThemeIconButton
                                tooltip={t('wifi:Add Company')}
                                color="primary"
                                variant="contained"
                                onClick={handleOpenAddCompany}
                              >
                                <AddIcon />
                              </ThemeIconButton>
                              <WIFICompany
                                type="A"
                                divisionId={selectedRows[0].id}
                                name={selectedRows[0].name}
                                logo={selectedRows[0].logo}
                                url={selectedRows[0].url}
                                open={openAddCompany}
                                onClose={handleCloseAddCompany}
                              />
                            </Guard>{' '}
                          </>
                        )}
                      </>
                    )}
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
                  <ThemeTablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    count={searchData.totalCount}
                    rowsPerPage={rowsPerPage}
                    page={paramPage - 1}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                )}
              </Grid>
            </Grid>
            <DeleteCompanyDialog
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
    </I18nWifiProvider>
  );
};

export default Wifi;
