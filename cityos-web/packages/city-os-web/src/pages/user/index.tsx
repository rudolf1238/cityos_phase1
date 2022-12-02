import { makeStyles } from '@material-ui/core/styles';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
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
import Grid from '@material-ui/core/Grid';

import { Action, SortOrder, Subject, UserSortField, UserStatus } from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import {
  isNumberString,
  isSortOrder,
  isString,
  isUserSortField,
} from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/src/hooks/useChangeRoute';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NestedTable from 'city-os-common/modules/NestedTable';
import PageContainer from 'city-os-common/modules/PageContainer';
import StatusChip from 'city-os-common/modules/StatusChip';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { GET_USER_PROFILE, GetUserProfileResponse } from '../../api/getUserProfile';
import { INVITE_USER, InviteUserPayload, InviteUserResponse } from '../../api/inviteUser';
import {
  PartialNode,
  SEARCH_USERS,
  SearchUsersPayload,
  SearchUsersResponse,
} from '../../api/searchUsers';
import useUserStatusTranslation from '../../hooks/useUserStatusTranslation';
import useWebTranslation from '../../hooks/useWebTranslation';

import AddUserIcon from '../../assets/icon/add-user.svg';
import DeleteUserDialog from '../../modules/Users/DeleteUserDialog';
import DetailsIcon from '../../assets/icon/details.svg';
import ExportUsers from '../../modules/Users/ExportUsers';
import InviteIcon from '../../assets/icon/invite.svg';
import InviteUser from '../../modules/Users/InviteUser';

const useStyles = makeStyles((theme) => ({
  divisionSelector: {
    maxWidth: theme.spacing(75),

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  searchWrapper: {
    maxWidth: theme.spacing(35),

    [theme.breakpoints.up('lg')]: {
      maxWidth: 'none',
    },
  },

  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-start',
    marginLeft: 'auto',

    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },

    [`& > :first-child > .MuiDivider-vertical,
    & > :last-child > .MuiDivider-vertical`]: {
      display: 'none',
    },
  },

  tableWrapper: {
    width: 0,
    textAlign: 'center',
  },

  svgIcon: {
    fill: 'none',
  },

  chip: {
    padding: theme.spacing(0, 0.5),
    textTransform: 'uppercase',
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
  q?: string;
  sortBy?: UserSortField;
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

const UserManagement: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'user']);
  const { tUserStatus } = useUserStatusTranslation();
  const client = useApolloClient();
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.USER]);
  const [startCursorList, setStartCursorList] = useState<(undefined | string)[]>([undefined]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [openInvite, setOpenInvite] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchData, setSearchData] = useState<SearchUsersResponse['searchUsers']>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    dispatch,
    user,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const keyword = isString(router.query.q) ? router.query.q : undefined;
  const sortField = isUserSortField(router.query.sortBy) ? router.query.sortBy : undefined;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : undefined;
  const paramPage = isNumberString(router.query.p) ? parseInt(router.query.p, 10) : 1;
  const rowsPerPage = isNumberString(router.query.n) ? parseInt(router.query.n, 10) : 10;

  const requestPage = useMemo(
    () => (startCursorList.length - 1 >= paramPage ? paramPage - 1 : startCursorList.length - 1),
    [startCursorList, paramPage],
  );

  const [inviteUser, { loading: inviteLoading }] = useMutation<
    InviteUserResponse,
    InviteUserPayload
  >(INVITE_USER);

  const { refetch } = useQuery<SearchUsersResponse, SearchUsersPayload>(SEARCH_USERS, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        userSortField: sortField && sortOrder ? sortField : undefined,
        sortOrder: sortField && sortOrder ? sortOrder : undefined,
        keyword,
      },
      size: rowsPerPage,
      after: startCursorList[requestPage],
    },
    skip:
      !router.isReady ||
      !divisionGroup?.id ||
      !permissionGroup?.group.id ||
      !!(router.query.gid && router.query.gid !== divisionGroup.id) ||
      inviteLoading ||
      deleteLoading,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ searchUsers }) => {
      setStartCursorList((prev) => {
        const newCursorList = [...prev];
        newCursorList[requestPage + 1] = searchUsers.pageInfo.endCursor;
        return newCursorList;
      });
      if (requestPage === paramPage - 1) setSearchData(searchUsers);
      if ((paramPage - 1) * rowsPerPage >= searchUsers.totalCount || paramPage < 1) {
        changeRoute({ p: 1 });
      }
    },
  });

  const resetOnPageInit = useCallback(() => {
    setStartCursorList([undefined]);
    setSelectedRows([]);
  }, []);

  const resetProfile = useCallback(async () => {
    const { data: profileData } = await client.query<GetUserProfileResponse>({
      query: GET_USER_PROFILE,
      fetchPolicy: 'network-only',
    });
    dispatch({
      type: ReducerActionType.SetProfile,
      payload: {
        profile: profileData.userProfile,
      },
    });
  }, [client, dispatch]);

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
    (newSortField: UserSortField, newSortOrder: SortOrder) => {
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

  const renderStatus = useCallback(
    (rowData: RowData) => (
      <StatusChip
        label={tUserStatus(rowData.status)}
        color={
          rowData.status === UserStatus.WAITING || rowData.status === UserStatus.SUSPEND
            ? 'pending'
            : 'default'
        }
      />
    ),
    [tUserStatus],
  );

  const handleOpenInvite = useCallback(() => {
    setOpenInvite(true);
  }, []);

  const handleCloseInvite = useCallback(
    async (invitedId?: string) => {
      if (invitedId) {
        await refetch();
        if (invitedId === user.email) await resetProfile();
      }
      setOpenInvite(false);
    },
    [refetch, user.email, resetProfile],
  );

  const handleOpenDelete = useCallback(() => {
    setOpenDelete(true);
  }, []);

  const handleCloseDelete = useCallback(
    async (isDeleted?: boolean) => {
      if (isDeleted) {
        await refetch();
        if (selectedRows[0].email === user.email) await resetProfile();
        setOpenDelete(false);
        setSelectedRows([]);
      } else {
        setOpenDelete(false);
      }
    },
    [selectedRows, user.email, refetch, resetProfile],
  );

  const handleDetails = useCallback(() => {
    if (!divisionGroup?.id || !permissionGroup?.group.id) return;
    const queryId: string = selectedRows[0].email;
    void router.push(
      {
        pathname: `${subjectRoutes[Subject.USER]}/detail`,
        query: {
          id: queryId,
          gid: divisionGroup?.id,
          pid: permissionGroup.group.id,
          back: router.asPath,
        },
      },
      {
        pathname: `${subjectRoutes[Subject.USER]}/detail`,
        query: { id: queryId, gid: divisionGroup?.id, pid: permissionGroup.group.id },
      },
    );
  }, [router, selectedRows, divisionGroup?.id, permissionGroup?.group.id]);

  const handleInviteAgain = useCallback(async () => {
    if (!selectedRows[0] || !divisionGroup) return;
    try {
      const mutationResult = await inviteUser({
        variables: {
          inviteUserInput: {
            email: selectedRows[0].email,
            groupId: divisionGroup.id,
          },
        },
      });
      if (!mutationResult.data) {
        throw new Error('no response');
      }
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('user:Invitation sent_'),
        },
      });
    } catch (error) {
      if (D_DEBUG) console.log(error);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('user:Invite user failed_ Please try again_'),
        },
      });
    }
    setSelectedRows([]);
  }, [divisionGroup, selectedRows, inviteUser, dispatch, t]);

  const tableData = useMemo<RowData[]>(
    () => (searchData ? searchData.edges.map(({ node }) => ({ ...node, key: node.email })) : []),
    [searchData],
  );

  const columns = useMemo<Array<CustomColumn<RowData>>>(
    () => [
      {
        title: t('common:Email'),
        field: 'email',
        sortOrder: sortField === UserSortField.EMAIL ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(UserSortField.EMAIL, newSortOrder),
      },
      {
        title: t('common:Name'),
        field: 'name',
        sortOrder: sortField === UserSortField.NAME ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(UserSortField.NAME, newSortOrder),
      },
      {
        title: t('common:Phone'),
        field: 'phone',
        sortOrder: sortField === UserSortField.PHONE ? sortOrder : SortOrder.ASCENDING,
        sort: (newSortOrder) => getHandleSort(UserSortField.PHONE, newSortOrder),
      },
      {
        title: t('common:Status'),
        field: 'status',
        render: renderStatus,
      },
    ],
    [sortField, sortOrder, renderStatus, getHandleSort, t],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <MainLayout>
      <Guard subject={Subject.USER} action={Action.VIEW}>
        <PageContainer>
          <Header
            title={t('user:User Management')}
            description={
              searchData &&
              t('user:Total {{count}} user', {
                count: searchData.totalCount,
              })
            }
          />
          <Grid container spacing={2}>
            {permissionGroup?.group.subGroups && permissionGroup.group.subGroups.length > 0 && (
              <Grid item xs={12} lg={4}>
                <DivisionSelector classes={classes.divisionSelector} onChange={handleGroupChange} />
              </Grid>
            )}
            <Grid item xs={6} lg={3} className={classes.searchWrapper}>
              <BasicSearchField
                value={searchValue}
                placeholder={t('common:Search user')}
                size="small"
                InputProps={{ margin: 'none' }}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </Grid>
            <Grid item xs={12} lg={3} className={classes.buttons}>
              <Guard subject={Subject.USER} action={Action.REMOVE} fallback={null}>
                {(selectedRows.length > 1 ||
                  (selectedRows.length === 1 &&
                    (selectedRows[0].email !== user.email ||
                      permissionGroup?.group.id !== divisionGroup?.id))) && (
                  <>
                    <Grid item>
                      <ThemeIconButton
                        tooltip={t('common:Remove')}
                        color="primary"
                        onClick={handleOpenDelete}
                      >
                        <DeleteIcon />
                      </ThemeIconButton>
                    </Grid>
                    <DeleteUserDialog
                      open={openDelete}
                      selectedRows={selectedRows}
                      onClose={handleCloseDelete}
                      onChanged={setDeleteLoading}
                    />
                  </>
                )}
              </Guard>
              <Guard subject={Subject.USER} action={Action.ADD} fallback={null}>
                {selectedRows.length === 1 && selectedRows[0].status === UserStatus.WAITING && (
                  <Grid item>
                    <ThemeIconButton
                      tooltip={t('user:Invite Again')}
                      color="primary"
                      variant="contained"
                      onClick={handleInviteAgain}
                    >
                      <InviteIcon className={classes.svgIcon} />
                    </ThemeIconButton>
                  </Grid>
                )}
              </Guard>
              <Guard subject={Subject.USER} action={Action.MODIFY} fallback={null}>
                {selectedRows.length === 1 && (
                  <Grid item>
                    <ThemeIconButton
                      tooltip={t('common:Details')}
                      color="primary"
                      variant="contained"
                      onClick={handleDetails}
                    >
                      <DetailsIcon />
                    </ThemeIconButton>
                  </Grid>
                )}
              </Guard>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
              <Guard subject={Subject.USER} action={Action.EXPORT} fallback={null}>
                <Grid item>
                  <ExportUsers
                    userSortField={sortField}
                    sortOrder={sortOrder}
                    keyword={keyword}
                    columns={columns}
                  />
                </Grid>
              </Guard>
              <Guard subject={Subject.USER} action={Action.ADD} fallback={null}>
                <Grid item>
                  <ThemeIconButton
                    tooltip={t('user:Invite User')}
                    color="primary"
                    variant="contained"
                    onClick={handleOpenInvite}
                  >
                    <AddUserIcon className={classes.svgIcon} />
                  </ThemeIconButton>
                </Grid>
                <InviteUser open={openInvite} onClose={handleCloseInvite} />
              </Guard>
            </Grid>
            <Grid item xs={12} className={classes.tableWrapper}>
              <NestedTable
                columns={columns}
                data={tableData}
                selectedRows={selectedRows}
                classes={{ container: classes.nestedTable }}
                keepSelectColumn
                disableNoDataMessage={!searchData}
                onSelect={handleTableSelect}
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
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default UserManagement;
