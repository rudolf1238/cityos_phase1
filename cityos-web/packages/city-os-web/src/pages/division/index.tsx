import { fade, makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  ReactNode,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';
import i18n from 'i18next';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Paper from '@material-ui/core/Paper';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';

import { Action, Group, Level, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import CheckCircleIcon from 'city-os-common/assets/icon/checkCheckbox.svg';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { SEARCH_GROUPS, SearchGroupsResponse } from '../../api/searchGroups';
import DivisionsProvider, {
  DivisionsContextValue,
  useDivisionsContext,
} from '../../modules/Divisions/DivisionsProvider';
import useWebTranslation from '../../hooks/useWebTranslation';

import AddDivision from '../../modules/Divisions/AddDivision';
import DeleteDivisionDialog from '../../modules/Divisions/DeleteDivisionDialog';
import MinusSquareIcon from '../../assets/icon/minus-square.svg';
import PlusSquareIcon from '../../assets/icon/plus-square.svg';

const useStyles = makeStyles((theme) => ({
  itemRoot: {
    '&:focus > .MuiTreeItem-content .MuiTreeItem-label': {
      backgroundColor: 'transparent',
    },
  },

  itemRootExpanded: {
    display: 'grid',
    gridTemplateAreas: `
        "groupLine content"
        "groupLine group"
      `,
    gridTemplateRows: 'auto auto',
    gridTemplateColumns: '1px auto',

    '&::after': {
      position: 'relative',
      gridArea: 'groupLine',
      zIndex: 1,
      marginTop: `calc((72px + 1.25rem) / 2)`, // (treeRow height + icon inner height) / 2
      marginLeft: `calc((2.25rem + 2px) / 2)`, // (icon height + borderWidth) / 2
      borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
      content: "''",
    },
  },

  content: {
    gridArea: 'content',
  },

  group: {
    gridArea: 'group',
    marginLeft: 0,
    paddingLeft: theme.spacing(4),
  },

  iconContainer: {
    margin: 0,
    width: 36,
  },

  labelRoot: {
    position: 'static',
    padding: theme.spacing(1),

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  label: {
    '&:hover $treeRow': {
      backgroundColor: theme.palette.background.light,
    },
  },

  treeRow: {
    display: 'flex',
    // get full width from root Paper and align width label
    position: 'absolute',
    left: 0,
    marginTop: theme.spacing(-1),
    width: '100%',
    height: 72,
  },

  treeRowSelected: {
    backgroundColor: theme.palette.action.selected,
  },

  checkbox: {
    alignSelf: 'center',
    margin: theme.spacing(3),
    color: theme.palette.primary.main,
  },

  labelChip: {
    position: 'relative',
    border: '1px solid transparent',
    borderRadius: 30,
    padding: theme.spacing(0, 2.5),
    width: 300,
    height: 56,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '56px',
    fontWeight: 700,
  },

  rootChip: {
    backgroundColor: theme.palette.group.root,
    color: theme.palette.primary.contrastText,
  },

  projectChip: {
    backgroundColor: theme.palette.group.project,
    color: theme.palette.primary.contrastText,
  },

  parentChip: {
    borderColor: theme.palette.group.parent,
    color: theme.palette.group.parent,
  },

  leafChip: {
    color: theme.palette.group.leaf,
  },

  pageContent: {
    position: 'relative',
  },

  iconWrapper: {
    display: 'flex',
    position: 'absolute',
    right: 0,
    gap: theme.spacing(2.5),
    transform: 'translateY(-100%)',
    padding: theme.spacing(2.5, 1),

    [theme.breakpoints.down('sm')]: {
      position: 'relative',
      transform: 'none',
      paddingTop: 0,
    },
  },

  paper: {
    padding: theme.spacing(1, 0),
    minHeight: 320,
  },

  treeRoot: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },

  icon: {
    position: 'relative',
    zIndex: 1,
    padding: '0.5rem', // use rem to sync with width & height
    width: '2.25rem',
    height: '2.25rem',
    color: theme.palette.grey[600],
  },
}));

interface StyledTreeItemProps extends TreeItemProps {
  level?: Level;
  deviceCount?: number;
}

const StyledTreeItem: VoidFunctionComponent<StyledTreeItemProps> = ({
  label,
  level = Level.LEAF,
  nodeId,
  deviceCount,
  ...rest
}: StyledTreeItemProps) => {
  const classes = useStyles();
  const ref = useRef<HTMLDivElement>(null);
  const { expanded, selected, setSelected } = useDivisionsContext();

  const isSelected = selected.includes(nodeId);

  const handleSelect = useCallback(() => {
    setSelected((prev) => (prev.includes(nodeId) ? [] : [nodeId]));
    // fix MUI TreeItem issue on v4 which is already fixed on v5
    // see https://github.com/mui/material-ui/issues/24096 for more information
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, [nodeId, setSelected]);

  return (
    <TreeItem
      {...rest}
      ref={ref}
      nodeId={nodeId}
      label={
        <div
          className={classes.label}
          role="button"
          tabIndex={0}
          onClick={handleSelect}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSelect();
          }}
        >
          <div className={clsx(classes.treeRow, { [classes.treeRowSelected]: isSelected })}>
            {isSelected && <CheckCircleIcon className={classes.checkbox} />}
          </div>
          <div
            className={clsx(classes.labelChip, {
              [classes.rootChip]: level === Level.ROOT,
              [classes.projectChip]: level === Level.PROJECT,
              [classes.parentChip]: level === Level.PARENT,
              [classes.leafChip]: level === Level.LEAF,
            })}
          >
            {label}
            {deviceCount !== undefined && ` (${deviceCount})`}
          </div>
        </div>
      }
      onLabelClick={(e) => {
        e.preventDefault();
      }}
      classes={{
        root: clsx(classes.itemRoot, { [classes.itemRootExpanded]: expanded.includes(nodeId) }),
        content: classes.content,
        group: classes.group,
        iconContainer: classes.iconContainer,
        label: classes.labelRoot,
      }}
    />
  );
};

const getGroup = (
  groupId: string,
  groupData: SearchGroupsResponse['searchGroups'],
): Required<Group> | undefined => groupData.find(({ id }) => id === groupId);

const renderGroup = (
  { id, name, level, subGroups, deviceCount }: Group,
  groupData: Group[],
): ReactNode => {
  const sortGroups = subGroups?.reduce<Group[]>((groups, groupId) => {
    const subGroup = getGroup(groupId, groupData);
    if (subGroup) groups.push(subGroup);
    return groups;
  }, []);
  if (!sortGroups) return null;
  sortGroups.sort((a, b) => a.name.localeCompare(b.name, i18n.language));

  return (
    <StyledTreeItem
      key={id}
      nodeId={id}
      label={name}
      level={level || undefined}
      deviceCount={deviceCount ?? undefined}
    >
      {sortGroups.map((subGroup) => renderGroup(subGroup, groupData))}
    </StyledTreeItem>
  );
};

const DivisionManagement: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'division']);
  const classes = useStyles();
  const router = useRouter();
  const {
    dispatch,
    userProfile: { permissionGroup, joinedGroups },
  } = useStore();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openAddDivision, setOpenAddDivision] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const SEARCH_GROUPS_DIVISION = useMemo(() => cloneDeep(SEARCH_GROUPS), []);

  const { refetch } = useQuery<SearchGroupsResponse>(SEARCH_GROUPS_DIVISION, {
    fetchPolicy: 'cache-and-network',
    skip: !permissionGroup?.group.id || isUpdating,
    onCompleted: (res) => {
      dispatch({
        type: ReducerActionType.SetJoinedGroups,
        payload: {
          joinedGroups: res.searchGroups,
        },
      });
    },
  });

  const handleUpdating = useCallback((isLoading: boolean) => {
    setIsUpdating(isLoading);
  }, []);

  const contextValue = useMemo<DivisionsContextValue>(
    () => ({
      groups: joinedGroups || [],
      expanded,
      selected,
      setSelected,
      setExpanded,
    }),
    [joinedGroups, expanded, selected],
  );

  const handleOnToggle = useCallback(
    (_: ChangeEvent<Record<string, unknown>>, nodeIds: string[]) => {
      setExpanded(nodeIds);
    },
    [],
  );
  const handleOpenDelete = useCallback(() => {
    setOpenDelete(true);
  }, []);
  const handleCloseDelete = useCallback(() => {
    setOpenDelete(false);
  }, []);

  const handleEdit = useCallback(() => {
    if (!permissionGroup?.group.id) return;
    void router.push({
      pathname: `${subjectRoutes[Subject.GROUP]}/editDivision`,
      query: { pid: permissionGroup.group.id, id: selected[0] },
    });
  }, [permissionGroup?.group.id, router, selected]);

  const handleOpenAdd = useCallback(() => {
    setOpenAddDivision(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setOpenAddDivision(false);
  }, []);

  const rootGroup = useMemo<Required<Group> | undefined>(() => {
    if (!joinedGroups || !permissionGroup?.group.id) return undefined;
    return getGroup(permissionGroup.group.id, joinedGroups);
  }, [joinedGroups, permissionGroup]);

  const selectedGroup = useMemo(() => joinedGroups && getGroup(selected[0], joinedGroups), [
    selected,
    joinedGroups,
  ]);

  useEffect(() => {
    if (joinedGroups) {
      const expandableGroups = joinedGroups.reduce<string[]>(
        (groups, group) =>
          group.subGroups?.length && group.subGroups.length > 0 ? groups.concat(group.id) : groups,
        [],
      );
      setExpanded(expandableGroups);
    }
    setSelected([]);
  }, [permissionGroup?.group.id, joinedGroups]);

  return (
    <MainLayout>
      <Guard subject={Subject.GROUP} action={Action.VIEW}>
        <PageContainer className={classes.pageContent}>
          <Header
            title={t('division:Division Management')}
            description={t('division:Show the division structure here_')}
          />
          <DivisionsProvider value={contextValue}>
            {joinedGroups && selected.length > 0 && (
              <div className={classes.iconWrapper}>
                <Guard subject={Subject.GROUP} action={Action.REMOVE} fallback={null}>
                  {selectedGroup?.level !== Level.ROOT && selectedGroup?.subGroups?.length === 0 && (
                    <ThemeIconButton
                      tooltip={t('common:Delete')}
                      color="primary"
                      onClick={handleOpenDelete}
                    >
                      <DeleteIcon />
                    </ThemeIconButton>
                  )}
                </Guard>
                <Guard subject={Subject.GROUP} action={Action.MODIFY} fallback={null}>
                  <ThemeIconButton
                    tooltip={t('common:Edit')}
                    color="primary"
                    variant="contained"
                    onClick={handleEdit}
                  >
                    <EditIcon />
                  </ThemeIconButton>
                </Guard>
                <Guard subject={Subject.GROUP} action={Action.ADD} fallback={null}>
                  <ThemeIconButton
                    tooltip={t('division:Add a Division')}
                    color="primary"
                    variant="contained"
                    onClick={handleOpenAdd}
                  >
                    <AddIcon />
                  </ThemeIconButton>
                  <AddDivision
                    open={openAddDivision}
                    onClose={handleCloseAdd}
                    onChanged={refetch}
                    onUpdating={handleUpdating}
                  />
                </Guard>
              </div>
            )}
            <Guard subject={Subject.GROUP} action={Action.REMOVE} fallback={null}>
              <DeleteDivisionDialog
                open={openDelete}
                selected={selected}
                onClose={handleCloseDelete}
                onChanged={refetch}
                onUpdating={handleUpdating}
              />
            </Guard>
            <Paper square={false} elevation={0} variant="outlined" className={classes.paper}>
              <TreeView
                disableSelection
                defaultCollapseIcon={<MinusSquareIcon className={classes.icon} />}
                defaultExpandIcon={<PlusSquareIcon className={classes.icon} />}
                className={classes.treeRoot}
                selected={selected}
                expanded={expanded}
                onNodeToggle={handleOnToggle}
              >
                {rootGroup && joinedGroups && renderGroup(rootGroup, joinedGroups)}
              </TreeView>
            </Paper>
          </DivisionsProvider>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default DivisionManagement;
