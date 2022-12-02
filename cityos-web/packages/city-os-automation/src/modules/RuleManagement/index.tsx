import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  MouseEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Typography from '@material-ui/core/Typography';

import { Action, SortOrder, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import omitUndefinedProps from 'city-os-common/libs/omitUndefinedProps';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/src/hooks/useChangeRoute';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import CollapsibleTable, { Column } from 'city-os-common/modules/CollapsibleTable';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { DELETE_RULE, DeleteRulePayload, DeleteRuleResponse } from '../../api/deleteRule';
import { EDIT_RULE, EditRuleInput, EditRulePayload, EditRuleResponse } from '../../api/editRule';
import { EffectiveAt, PartialRuleAutomation, RuleAutomation, RuleSortField } from '../../libs/type';
import { SEARCH_RULES, SearchRulesPayload, SearchRulesResponse } from '../../api/searchRules';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import DetailPanel from '../DetailPanel';
import I18nAutomationProvider from '../I18nAutomationProvider';
import TimeSettingDialog from './settingDialogs/TimeSettingDialog';
import WeekDayChips from '../WeekDayChips';

const useStyles = makeStyles((theme) => ({
  divisionSelector: {
    width: 440,
  },

  search: {
    marginRight: 'auto',
  },

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

  iconButton: {
    margin: 'auto',
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

  idCell: {
    width: 130,
    wordWrap: 'break-word',
  },

  nameCell: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },

  nameFieldRoot: {
    backgroundColor: 'transparent',
    padding: 0,
    width: 255,
    ...theme.typography.body2,
  },

  nameFieldInput: {
    padding: theme.spacing(1, 0),
  },

  nameFieldInputEditable: {
    [`&:focus,
    &:hover`]: {
      backgroundColor: theme.palette.grey[50],
    },
  },

  dateCell: {
    width: 130,
  },

  timeCell: {
    width: 130,
  },

  weekCell: {
    paddingRight: theme.spacing(1),
  },
}));

interface RowData extends Omit<PartialRuleAutomation, 'group' | 'effectiveAt'>, EffectiveAt {}

const columnToSortField: Record<keyof RowData, RuleSortField | undefined> = {
  id: RuleSortField.ID,
  name: RuleSortField.NAME,
  effectiveDate: RuleSortField.EFFECTIVE_DATE,
  effectiveWeekday: undefined,
  effectiveTime: RuleSortField.EFFECTIVE_TIME,
  timezone: undefined,
  logic: undefined,
  if: undefined,
  then: undefined,
};

interface NameCellProps {
  rowData: RowData;
  isCollapse: boolean;
  onRuleUpdate: (ruleId: string, editRuleInput: EditRuleInput) => void;
}

const NameCell: VoidFunctionComponent<NameCellProps> = ({
  rowData,
  isCollapse,
  onRuleUpdate,
}: NameCellProps) => {
  const classes = useStyles();
  const [value, setValue] = useState(rowData.name);

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value.replace(/\r|\n/g, '').trim());
  }, []);

  const handleUpdate = useCallback(() => {
    if (isCollapse || value === rowData.name) return;
    onRuleUpdate(rowData.id, {
      name: value,
    });
  }, [isCollapse, rowData.name, rowData.id, value, onRuleUpdate]);

  useEffect(() => {
    setValue(rowData.name);
  }, [rowData.name]);

  return (
    <div className={classes.nameCell}>
      <InputBase
        value={value}
        onChange={handleChange}
        onBlur={handleUpdate}
        multiline
        classes={{
          root: classes.nameFieldRoot,
          input: clsx(classes.nameFieldInput, {
            [classes.nameFieldInputEditable]: !isCollapse,
          }),
        }}
        readOnly={isCollapse}
      />
      {!isCollapse && <EditIcon color="primary" fontSize="small" />}
    </div>
  );
};

interface MoreMenuProps {
  onEditTime: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const MoreMenu: VoidFunctionComponent<MoreMenuProps> = ({
  onEditTime,
  onDuplicate,
  onDelete,
}: MoreMenuProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['common', 'automation']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const enableEdit = useIsEnableRule({
    subject: Subject.AUTOMATION_RULE_MANAGEMENT,
    action: Action.MODIFY,
  });

  const enableDuplicate = useIsEnableRule({
    subject: Subject.AUTOMATION_RULE_MANAGEMENT,
    action: Action.ADD,
  });

  const enableDelete = useIsEnableRule({
    subject: Subject.AUTOMATION_RULE_MANAGEMENT,
    action: Action.REMOVE,
  });

  const handleOpenMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpenMenu(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const handleEditTime = useCallback(() => {
    handleCloseMenu();
    onEditTime();
  }, [handleCloseMenu, onEditTime]);

  const handleDuplicate = useCallback(() => {
    handleCloseMenu();
    onDuplicate();
  }, [handleCloseMenu, onDuplicate]);

  const handleDelete = useCallback(() => {
    handleCloseMenu();
    onDelete();
  }, [handleCloseMenu, onDelete]);

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
        {enableEdit && <MenuItem onClick={handleEditTime}>{t('automation:Edit Time')}</MenuItem>}
        {enableDuplicate && <MenuItem onClick={handleDuplicate}>{t('common:Duplicate')}</MenuItem>}
        {enableDelete && (
          <MenuItem onClick={handleDelete} className={classes.delete}>
            {t('common:Delete')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

interface Query {
  gid?: string;
  /** search value */
  q?: string;
}

const RuleManagementPage: VoidFunctionComponent = () => {
  const { t } = useAutomationTranslation(['mainLayout', 'automation', 'variables']);
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.AUTOMATION_RULE_MANAGEMENT]);

  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [sortField, setSortField] = useState<RuleSortField>();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [pageVariables, setPageVariables] = useState<{ before?: string; after?: string }>({
    before: undefined,
    after: undefined,
  });

  const [searchValue, setSearchValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RowData>();
  const [timeSettingTarget, setTimeSettingTarget] =
    useState<Pick<RuleAutomation, 'id' | 'effectiveAt'>>();

  const enableEdit = useIsEnableRule({
    subject: Subject.AUTOMATION_RULE_MANAGEMENT,
    action: Action.MODIFY,
  });

  const enableMoreMenu = useIsEnableRule({
    subject: Subject.AUTOMATION_RULE_MANAGEMENT,
    action: [Action.ADD, Action.MODIFY, Action.REMOVE],
  });

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const keyword = isString(router.query.q) ? router.query.q : undefined;

  const {
    data: searchData,
    loading,
    refetch: refetchRules,
  } = useQuery<SearchRulesResponse, SearchRulesPayload>(SEARCH_RULES, {
    skip: !permissionGroup?.group.id || !divisionGroup?.id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        sortField,
        sortOrder,
        keyword,
      },
      ...pageVariables,
      size: rowsPerPage,
    },
  });

  const [editRule] = useMutation<EditRuleResponse, EditRulePayload>(EDIT_RULE, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('common:The value has been set successfully_'),
        },
      });
    },
    onError: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to set value_ Please try again_'),
        },
      });
    },
  });

  const [deleteRule] = useMutation<DeleteRuleResponse, DeleteRulePayload>(DELETE_RULE, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('automation:The rule has been deleted successfully_'),
        },
      });
      setPage(0);
      if (pageVariables.before !== undefined || pageVariables.after !== undefined) {
        setPageVariables({ before: undefined, after: undefined });
      } else {
        void refetchRules();
      }
    },
    onError: (error) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to delete_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    },
  });

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId });
      setPage(0);
      setPageVariables({ before: undefined, after: undefined });
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
      if (!searchData) return;
      const { endCursor, beforeCursor } = searchData.searchRules.pageInfo;
      const before = newPage < page && beforeCursor ? beforeCursor : undefined;
      const after = newPage > page && endCursor ? endCursor : undefined;
      setPage(before || after ? newPage : 0);
      setPageVariables({ before, after });
    },
    [page, searchData],
  );

  const directToAddRulePage = useCallback(
    (copyId?: string) => {
      const pathname = `${subjectRoutes[Subject.AUTOMATION_RULE_MANAGEMENT]}/add-rule`;
      void router.push(
        {
          pathname,
          query: {
            ...omitUndefinedProps({
              copyId,
              pid: permissionGroup?.group.id,
              gid: divisionGroup?.id,
            }),
            back: router.asPath,
          },
        },
        {
          pathname,
          query: copyId ? { copyId } : undefined,
        },
      );
    },
    [divisionGroup?.id, permissionGroup?.group.id, router],
  );

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteTarget(undefined);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteRule({
      variables: {
        ruleId: deleteTarget.id,
      },
    });
    handleCloseDeleteDialog();
  }, [deleteTarget, deleteRule, handleCloseDeleteDialog]);

  const handelRuleUpdate = useCallback(
    (ruleId: string, editRuleInput: EditRuleInput) => {
      void editRule({
        variables: {
          ruleId,
          editRuleInput,
        },
      });
    },
    [editRule],
  );

  const handleOpenTimeSettingDialog = useCallback(
    ({ id, timezone, effectiveDate, effectiveTime, effectiveWeekday }: RowData) =>
      () => {
        setTimeSettingTarget({
          id,
          effectiveAt: { timezone, effectiveDate, effectiveTime, effectiveWeekday },
        });
      },
    [],
  );

  const handleCloseTimeSettingDialog = useCallback(
    (newSetting?: EffectiveAt) => {
      if (timeSettingTarget && newSetting) {
        handelRuleUpdate(timeSettingTarget.id, { effectiveAtInput: newSetting });
      }
      setTimeSettingTarget(undefined);
    },
    [handelRuleUpdate, timeSettingTarget],
  );

  const detailPanel = useCallback(
    (rowData: RowData) => (
      <DetailPanel rule={rowData} onChange={enableEdit ? handelRuleUpdate : undefined} />
    ),
    [enableEdit, handelRuleUpdate],
  );

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
        field: 'id',
        sortOrder: sortField === RuleSortField.ID ? sortOrder : SortOrder.DESCENDING,
        render: ({ id }: RowData) => <div className={classes.idCell}>{id}</div>,
      },
      {
        title: t('automation:Rule Name'),
        field: 'name',
        sortOrder: sortField === RuleSortField.NAME ? sortOrder : SortOrder.DESCENDING,
        render: (rowData: RowData, isCollapse: boolean) => (
          <NameCell rowData={rowData} isCollapse={isCollapse} onRuleUpdate={handelRuleUpdate} />
        ),
      },
      {
        title: t('automation:Effective Date'),
        field: 'effectiveDate',
        sortOrder: sortField === RuleSortField.EFFECTIVE_DATE ? sortOrder : SortOrder.DESCENDING,
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
        sortOrder: sortField === RuleSortField.EFFECTIVE_TIME ? sortOrder : SortOrder.DESCENDING,
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
      ...(enableMoreMenu
        ? [
            {
              title: '',
              field: 'more',
              render: (rowData: RowData) => (
                <MoreMenu
                  onEditTime={handleOpenTimeSettingDialog(rowData)}
                  onDelete={() => {
                    setDeleteTarget(rowData);
                  }}
                  onDuplicate={() => {
                    directToAddRulePage(rowData.id);
                  }}
                />
              ),
            },
          ]
        : []),
    ],
    [
      sortField,
      sortOrder,
      enableMoreMenu,
      classes,
      directToAddRulePage,
      handelRuleUpdate,
      t,
      handleOpenTimeSettingDialog,
    ],
  );

  const tableData = useMemo<RowData[]>(
    () =>
      searchData?.searchRules?.edges.map(({ node: { effectiveAt, ...otherRules } }) => ({
        ...effectiveAt,
        ...otherRules,
      })) || [],
    [searchData?.searchRules?.edges],
  );

  useEffect(() => {
    if (keyword) setSearchValue(keyword);
  }, [keyword]);

  return (
    <I18nAutomationProvider>
      <MainLayout>
        <Guard subject={Subject.AUTOMATION_RULE_MANAGEMENT} action={Action.VIEW}>
          <PageContainer>
            <Header title={t('mainLayout:Rule Management')} />
            <Grid container spacing={2} justify="space-between">
              {permissionGroup?.group.subGroups && permissionGroup.group.subGroups.length > 0 && (
                <Grid item>
                  <DivisionSelector
                    classes={classes.divisionSelector}
                    onChange={handleGroupChange}
                  />
                </Grid>
              )}
              <Grid item className={classes.search}>
                <BasicSearchField
                  value={searchValue}
                  label={t('common:Search')}
                  placeholder={t('automation:Insert a keyword')}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </Grid>
              <Grid item>
                <Guard
                  subject={Subject.AUTOMATION_RULE_MANAGEMENT}
                  action={Action.ADD}
                  fallback={null}
                >
                  <ThemeIconButton
                    tooltip={t('common:Add')}
                    color="primary"
                    variant="contained"
                    onClick={() => directToAddRulePage()}
                  >
                    <AddIcon />
                  </ThemeIconButton>
                </Guard>
              </Grid>
              <Grid item xs={12} className={classes.tableWrapper}>
                <CollapsibleTable
                  data={tableData}
                  columns={columns}
                  autoExpandingSingleRow={!loading}
                  classes={{
                    container: classes.table,
                    column: classes.tableColumn,
                  }}
                  disableNoDataMessage={!searchData}
                  dense
                  detailPanel={detailPanel}
                  onSortChange={onSortChange}
                />
                {!searchData && <CircularProgress className={classes.loading} />}
                {searchData?.searchRules && searchData.searchRules.totalCount > 0 && (
                  <ThemeTablePagination
                    count={searchData.searchRules.totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                )}
              </Grid>
            </Grid>
          </PageContainer>
          <TimeSettingDialog
            open={!!timeSettingTarget}
            effectiveAt={timeSettingTarget?.effectiveAt}
            onClose={handleCloseTimeSettingDialog}
          />
          <BaseDialog
            open={!!deleteTarget}
            onClose={handleCloseDeleteDialog}
            title={t('common:Are you sure you want to delete?')}
            content={
              <Grid
                container
                direction="column"
                justify="space-between"
                className={classes.deleteContent}
              >
                <Typography>
                  {t('automation:This {{item}} no longer will be in use_', {
                    item: t('automation:rule'),
                  })}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  className={classes.dialogButton}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={handleDelete}
                >
                  {t('common:Delete')}
                </Button>
              </Grid>
            }
            classes={{
              dialog: classes.deleteDialog,
            }}
          />
        </Guard>
      </MainLayout>
    </I18nAutomationProvider>
  );
};

export default memo(RuleManagementPage);
