import { Layout as GadgetLayout, Layouts as GadgetLayouts } from 'react-grid-layout';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import React, {
  MouseEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import { gadgetLimit } from 'city-os-common/libs/parsedENV';
import { isNumber } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import downloadFile from 'city-os-common/libs/downloadFile';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import Guard from 'city-os-common/modules/Guard';
import Loading from 'city-os-common/modules/Loading';
import MainLayout from 'city-os-common/modules/MainLayout';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  ConfigFormType,
  DashboardConfigJson,
  GadgetConfig,
  GadgetsConfig,
  GridLayoutBreakpoint,
} from '../libs/type';
import { READ_DASHBOARD, ReadDashboardResponse } from '../api/readDashboard';
import { SAVE_DASHBOARD, SaveDashboardPayload, SaveDashboardResponse } from '../api/saveDashboard';
import { gadgetSize, gadgetSizeSet, gridLayoutColumnSizes } from '../libs/constants';
import { isDashboardConfig, isGridLayoutBreakpoint, isLayoutPosition } from '../libs/validators';
import uploadFile from '../libs/uploadFile';

import AddGadget from './AddGadget';
import GridLayout from './GridLayout';
import useDashboardTranslation from '../hooks/useDashboardTranslation';

import I18nDashboardProvider from './I18nDashboardProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    padding: theme.spacing(1, 0),
    height: '100%',
    overflow: 'hidden',
  },

  bar: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'end',
    padding: theme.spacing(1, 4),

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
    },

    '& span': {
      marginLeft: 'auto',
    },
  },

  tabs: {
    display: 'flex',
    position: 'absolute',
    top: '50%',
    left: '50%',
    gap: theme.spacing(2),
    transform: 'translate(-50%, -50%)',

    [theme.breakpoints.down('xs')]: {
      gap: theme.spacing(1.5),
    },
  },

  tab: {
    backgroundColor: theme.palette.grey[100],
    width: 60,
    minWidth: 52,
    height: 10,

    [theme.breakpoints.down('xs')]: {
      width: 52,
    },

    '&:hover': {
      backgroundColor: theme.palette.background.miniTab,
    },
  },

  tabSelected: {
    backgroundColor: theme.palette.primary.main,
  },

  moreButton: {
    borderColor: 'transparent',
    boxShadow: 'none',
  },

  menuPaper: {
    width: 368,
  },

  addButton: {
    position: 'fixed',
    right: 24,
    bottom: 16,
    zIndex: theme.zIndex.speedDial,
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
}));

const validateGadgetLayout = (dashboardConfig: DashboardConfigJson): boolean => {
  const { gadgets, layouts } = dashboardConfig;
  return (Object.entries(layouts) as [GridLayoutBreakpoint, GadgetLayout[]][]).every(
    ([sizeKey, tab]) =>
      tab.every((layout) => {
        const targetConfig = gadgets.find(({ id }) => id === layout.i);
        // inspect width and height of gadget config is same as gadget layout
        // if config width is larger then current columnSize, layout.w may turn to the columnSize
        if (
          !targetConfig ||
          layout.h !== targetConfig.height ||
          (layout.w !== targetConfig.width &&
            layout.w !== Math.min(targetConfig.width, gridLayoutColumnSizes[sizeKey]))
        ) {
          return false;
        }
        const { type } = targetConfig;
        // inspect gadget layout is valid for assigned gadget type
        const validSizeSet = gadgetSizeSet[type];
        const isValidSize = validSizeSet.some((size) => {
          const { width, height } = gadgetSize[size];
          return (
            (layout.w === width || layout.w === Math.min(width, gridLayoutColumnSizes[sizeKey])) &&
            height === layout.h
          );
        });

        return isValidSize;
      }),
  );
};

const parseConfigToJson = (configString: string): DashboardConfigJson | null => {
  try {
    const newDashboardConfig: unknown = JSON.parse(configString);
    if (!isDashboardConfig(newDashboardConfig) || !validateGadgetLayout(newDashboardConfig)) {
      throw new Error('Config data format is invalid');
    }
    if (newDashboardConfig.gadgets.length > gadgetLimit) {
      newDashboardConfig.gadgets = newDashboardConfig.gadgets.slice(0, gadgetLimit);
      (Object.keys(newDashboardConfig.layouts) as GridLayoutBreakpoint[]).forEach((sizeKey) => {
        const currentLayout = newDashboardConfig.layouts[sizeKey];
        if (currentLayout) {
          newDashboardConfig.layouts[sizeKey] = currentLayout.filter((gadget) =>
            newDashboardConfig.gadgets.some(({ id }) => id === gadget.i),
          );
        }
      });
    }
    return newDashboardConfig;
  } catch (error) {
    if (D_DEBUG) console.log(error);
    return null;
  }
};

const getSpacesStatus = (
  sizeKey: GridLayoutBreakpoint,
  gadgetLayouts: GadgetLayout[],
): number[][] => {
  const spaces: number[][] = [];
  gadgetLayouts.forEach((layout) => {
    for (let { y } = layout; y < layout.y + layout.h; y += 1) {
      if (!spaces[y]) {
        // fill in empty array with 0
        spaces[y] = Array.from({ length: gridLayoutColumnSizes?.[sizeKey] || 0 }, () => 0);
      }
      for (let { x } = layout; x < layout.x + layout.w; x += 1) {
        spaces[y][x] = 1;
      }
    }
  });
  return spaces;
};

const clearOccupancy = (
  spaces: number[][],
  originX = 0,
  originY = 0,
  width = 0,
  height = 0,
): number[][] => {
  const newSpaces = cloneDeep(spaces);
  for (let y = originY; y < originY + height; y += 1) {
    for (let x = originX; x < originX + width; x += 1) {
      newSpaces[y][x] = 0;
    }
  }
  return newSpaces;
};

type FindSpace = (
  spaces: number[][],
  originX: number,
  originY: number,
  width: number,
  height: number,
) => { x: number; y: number } | FindSpace;

const findSpace: FindSpace = (
  spaces: number[][],
  originX = 0,
  originY = 0,
  width: number,
  height: number,
) => {
  for (let top = originY; spaces[top] && top < originY + height; top += 1) {
    for (let left = originX; left < originX + width; left += 1) {
      if (spaces[top][left] !== 0) {
        let nextOriginX = left + 1;
        let nextOriginY = originY;
        // decide next origin position should start from next row or not
        if (nextOriginX + width > (spaces[0]?.length || 0)) {
          nextOriginX = 0;
          nextOriginY += 1;
        }
        // generate new row if there is no acceptable space
        if (nextOriginY >= spaces.length) {
          return { x: 0, y: spaces.length };
        }
        return findSpace(spaces, nextOriginX, nextOriginY, width, height);
      }
    }
  }
  return { x: originX, y: originY };
};

const getGadgetAddedLayouts = (
  gadgetConfig: GadgetConfig<ConfigFormType>,
  layouts: GadgetLayouts,
) => {
  const newLayouts: GadgetLayouts = cloneDeep(layouts);
  const { id, height, width } = gadgetConfig;
  Object.keys(GridLayoutBreakpoint).forEach((sizeKey) => {
    if (!newLayouts[sizeKey]) {
      newLayouts[sizeKey] = [];
    }
  });
  Object.entries(newLayouts).forEach(([sizeKey, currLayouts]) => {
    if (!isGridLayoutBreakpoint(sizeKey)) {
      return;
    }
    // inspect all grid spaces status
    const spaces = getSpacesStatus(sizeKey, currLayouts);
    // try all empty space to get the topmost & leftmost acceptable position
    const acceptablePosition = findSpace(spaces, 0, 0, width, height);
    const newPosition = isLayoutPosition(acceptablePosition)
      ? acceptablePosition
      : { x: 0, y: spaces.length };
    currLayouts.push({ i: id, x: newPosition.x, y: newPosition.y, h: height, w: width });
  });
  return newLayouts;
};

const getGadgetUpdatedLayouts = (
  gadgetConfig: GadgetConfig<ConfigFormType>,
  layouts: GadgetLayouts,
) => {
  const newLayouts: GadgetLayouts = cloneDeep(layouts);
  const { id, height, width } = gadgetConfig;
  Object.keys(newLayouts).forEach((sizeKey) => {
    const currLayouts = newLayouts[sizeKey];
    const breakpoint = isGridLayoutBreakpoint(sizeKey) ? sizeKey : null;
    if (breakpoint) {
      const initSpaces = getSpacesStatus(breakpoint, currLayouts);
      const targetIndex = currLayouts.findIndex(({ i }) => i === id);
      if (targetIndex >= 0) {
        const target = currLayouts[targetIndex];
        const { x, y, w, h } = target;
        // clear original layout of this gadget
        const spaces = clearOccupancy(initSpaces, x, y, w, h);
        const acceptablePosition = findSpace(spaces, 0, currLayouts[targetIndex].y, width, height);
        const newPosition = isLayoutPosition(acceptablePosition)
          ? acceptablePosition
          : { x: 0, y: spaces.length };
        target.x = newPosition.x;
        target.y = newPosition.y;
        target.h = height;
        target.w = width;
      }
    }
  });
  return newLayouts;
};

interface MiniTabsProps {
  number: number;
  index: number;
  onChange: (newIndex: number) => void;
}

const MiniTabs: VoidFunctionComponent<MiniTabsProps> = ({
  number,
  index,
  onChange,
}: MiniTabsProps) => {
  const classes = useStyles();

  return (
    <div className={classes.tabs}>
      {Array.from({ length: number }, (_, i) => (
        <Button
          key={i}
          className={clsx(classes.tab, { [classes.tabSelected]: index === i })}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  );
};

const Dashboard: VoidFunctionComponent = () => {
  const { t } = useDashboardTranslation(['common', 'dashboard']);
  const classes = useStyles();
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const [allGadgetsConfig, setAllGadgetsConfig] = useState<GadgetsConfig[]>([[], [], []]);
  const [allLayouts, setAllLayouts] = useState<GadgetLayouts[]>([{}, {}, {}]);
  const [originAllLayout, setOriginAllLayout] = useState<GadgetLayouts[]>([{}, {}, {}]);

  const [tabIdx, setTabIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [openMore, setOpenMore] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const uploadedFile = useRef<string | null>(null);

  const layoutWrapperRef = useRef<HTMLDivElement | null>(null);

  const enableAdd = useMemo(() => allGadgetsConfig[tabIdx].length < gadgetLimit, [
    allGadgetsConfig,
    tabIdx,
  ]);

  const getConfigString = useCallback(
    (value: number | DashboardConfigJson) => {
      const newLayouts: GadgetLayouts = {};
      Object.entries(isNumber(value) ? allLayouts[value] : value.layouts).forEach(
        ([sizeKey, layout]) => {
          newLayouts[sizeKey] = layout.map(({ i, x, y, w, h }) => ({
            i,
            x,
            y,
            w,
            h,
          }));
        },
      );
      const dashboardConfig: DashboardConfigJson = {
        gadgets: isNumber(value) ? allGadgetsConfig[value] : value.gadgets,
        layouts: newLayouts,
      };
      return JSON.stringify(dashboardConfig, null, 2);
    },
    [allGadgetsConfig, allLayouts],
  );

  const setConfig = useCallback((config: DashboardConfigJson, index: number) => {
    setAllGadgetsConfig((prev) => {
      const newGadgets = cloneDeep(prev);
      newGadgets[index] = config.gadgets;
      return newGadgets;
    });
    setAllLayouts((prev) => {
      const newLayouts = cloneDeep(prev);
      newLayouts[index] = config.layouts;
      return newLayouts;
    });
  }, []);

  const { loading, called } = useQuery<ReadDashboardResponse>(READ_DASHBOARD, {
    skip: !permissionGroup?.group?.id || isDraggable,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ readDashboard }) => {
      if (!readDashboard) return;
      readDashboard.forEach(({ index, config }) => {
        const newConfig = parseConfigToJson(config);
        if (newConfig) {
          setConfig(newConfig, index);
        }
      });
    },
  });

  const [saveDashboard] = useMutation<SaveDashboardResponse, SaveDashboardPayload>(SAVE_DASHBOARD, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: <>{t('common:The value has been set successfully_')}</>,
        },
      });
    },
    onError: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: <>{t('common:Failed to save_ Please try again_')}</>,
        },
      });
    },
  });

  const handleTabsChange = useCallback(
    (newIndex: number) => {
      if (layoutWrapperRef.current) {
        layoutWrapperRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setSlideDirection(newIndex > tabIdx ? 'left' : 'right');
      setTabIdx(newIndex);
    },
    [tabIdx],
  );

  const handleOpenMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpenMore(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMore(false);
  }, []);

  const handleMove = useCallback(() => {
    setOriginAllLayout(allLayouts);
    setIsDraggable(true);
    handleCloseMenu();
  }, [allLayouts, handleCloseMenu]);

  const triggerImport = useCallback(async () => {
    handleCloseMenu();
    try {
      uploadedFile.current = await uploadFile('application/json');
      setOpenImport(true);
    } catch (error) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: (
            <>{t('dashboard:Import failed_ Please check the file is in the correct format_')}</>
          ),
        },
      });
    }
  }, [dispatch, handleCloseMenu, t]);

  const handleCloseImport = useCallback(() => {
    uploadedFile.current = null;
    setOpenImport(false);
  }, []);

  const handleImport = useCallback(async () => {
    if (!uploadedFile.current) return;
    const newConfig = parseConfigToJson(uploadedFile.current);
    if (newConfig) {
      const saveResult = await saveDashboard({
        variables: {
          index: tabIdx,
          config: uploadedFile.current,
        },
      });
      if (saveResult.data?.saveDashboard) setConfig(newConfig, tabIdx);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: <>{t('dashboard:Dashboard settings have been imported successfully_')}</>,
        },
      });
    } else {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: (
            <>{t('dashboard:Import failed_ Please check the file is in the correct format_')}</>
          ),
        },
      });
    }
    handleCloseImport();
  }, [tabIdx, handleCloseImport, setConfig, saveDashboard, dispatch, t]);

  const triggerExport = useCallback(() => {
    handleCloseMenu();
    setOpenExport(true);
  }, [handleCloseMenu]);

  const handleExport = useCallback((): void => {
    const dashboardConfigString = getConfigString(tabIdx);
    const file = new Blob([dashboardConfigString], {
      type: 'application/json',
    });
    downloadFile(file, 'Dashboard Config.json');
    setOpenExport(false);
  }, [tabIdx, getConfigString]);

  const handleLayoutChange = useCallback(
    (layouts: GadgetLayouts) => {
      setAllLayouts((prev) => {
        const newLayouts = cloneDeep(prev);
        newLayouts[tabIdx] = layouts;
        return newLayouts;
      });
    },
    [tabIdx],
  );

  const handleDragSave = useCallback(async () => {
    const dashboardConfigString = getConfigString(tabIdx);
    await saveDashboard({
      variables: {
        index: tabIdx,
        config: dashboardConfigString,
      },
    });
    setIsDraggable(false);
  }, [tabIdx, getConfigString, saveDashboard]);

  const handleDragCancel = useCallback(() => {
    setIsDraggable(false);
    setAllLayouts(originAllLayout);
  }, [originAllLayout]);

  const handleOpenAddDialog = useCallback(() => {
    setOpenAdd(true);
  }, []);

  const handleAdd = useCallback(
    async (newGadgetConfig?: GadgetConfig<ConfigFormType>) => {
      if (newGadgetConfig) {
        const newAllGadgets = cloneDeep(allGadgetsConfig);
        newAllGadgets[tabIdx].push(newGadgetConfig);
        // calculate layouts manually to avoid react-grid-layout reset gadgets
        const newAllLayouts: GadgetLayouts[] = cloneDeep(allLayouts);
        newAllLayouts[tabIdx] = getGadgetAddedLayouts(newGadgetConfig, newAllLayouts[tabIdx]);
        setAllGadgetsConfig(newAllGadgets);
        setAllLayouts(newAllLayouts);

        const dashboardConfigString = getConfigString({
          gadgets: newAllGadgets[tabIdx],
          layouts: newAllLayouts[tabIdx],
        });
        await saveDashboard({
          variables: {
            index: tabIdx,
            config: dashboardConfigString,
          },
        });
      }
      setOpenAdd(false);
    },
    [allGadgetsConfig, allLayouts, getConfigString, saveDashboard, tabIdx],
  );

  const handleUpdateConfig = useCallback(
    async (newGadgetConfig: GadgetConfig<ConfigFormType>) => {
      const {
        id: selectedId,
        width: newWidth,
        height: newHeight,
        setting: newSetting,
      } = newGadgetConfig;
      let isResized = false;
      const newAllGadgets = cloneDeep(allGadgetsConfig);
      const target = newAllGadgets[tabIdx].find(({ id }) => id === selectedId);
      if (target) {
        isResized = newWidth !== target.width || newHeight !== target.height;
        target.width = newWidth;
        target.height = newHeight;
        target.setting = {
          ...target.setting,
          ...newSetting,
        };
      }
      const newAllLayouts: GadgetLayouts[] = cloneDeep(allLayouts);
      newAllLayouts[tabIdx] = getGadgetUpdatedLayouts(newGadgetConfig, newAllLayouts[tabIdx]);
      setAllGadgetsConfig(newAllGadgets);
      if (isResized) {
        setAllLayouts(newAllLayouts);
      }
      const dashboardConfigString = getConfigString({
        gadgets: newAllGadgets[tabIdx],
        layouts: newAllLayouts[tabIdx],
      });
      await saveDashboard({
        variables: {
          index: tabIdx,
          config: dashboardConfigString,
        },
      });
    },
    [allGadgetsConfig, allLayouts, getConfigString, saveDashboard, tabIdx],
  );

  const handleDelete = useCallback(
    async (deleteId) => {
      const newAllGadgets = cloneDeep(allGadgetsConfig);
      newAllGadgets[tabIdx] = newAllGadgets[tabIdx].filter(({ id }) => id !== deleteId);
      const newAllLayouts: GadgetLayouts[] = cloneDeep(allLayouts);
      Object.entries(newAllLayouts[tabIdx]).forEach(([sizeKey, value]) => {
        newAllLayouts[tabIdx][sizeKey] = value.filter(({ i }) => i !== deleteId);
      });
      setAllGadgetsConfig(newAllGadgets);
      setAllLayouts(newAllLayouts);
      const dashboardConfigString = getConfigString({
        gadgets: newAllGadgets[tabIdx],
        layouts: newAllLayouts[tabIdx],
      });
      await saveDashboard({
        variables: {
          index: tabIdx,
          config: dashboardConfigString,
        },
      });
    },
    [tabIdx, allLayouts, allGadgetsConfig, getConfigString, saveDashboard],
  );

  const handleArrowKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') handleTabsChange(tabIdx === 0 ? tabIdx : tabIdx - 1);
      if (e.code === 'ArrowRight') handleTabsChange(tabIdx === 2 ? tabIdx : tabIdx + 1);
    },
    [tabIdx, handleTabsChange],
  );

  useEffect(() => {
    if (!containerNode) return () => {};
    containerNode.addEventListener('keydown', handleArrowKeyDown);
    return () => {
      containerNode.removeEventListener('keydown', handleArrowKeyDown);
    };
  }, [containerNode, handleArrowKeyDown]);

  useEffect(() => {
    if (containerNode && document.activeElement !== containerNode) {
      containerNode.focus(); // if previous activeElement unmount, re-focus to container
    }
  }, [containerNode, tabIdx]);

  return (
    <I18nDashboardProvider>
      <MainLayout>
        <Guard subject={Subject.DASHBOARD} action={Action.VIEW}>
          <Container ref={setContainerNode} tabIndex={0} maxWidth={false} className={classes.root}>
            <div className={classes.bar}>
              <MiniTabs number={3} index={tabIdx} onChange={handleTabsChange} />
              <ThemeIconButton
                color="primary"
                size="small"
                tooltip={t('dashboard:More')}
                onClick={handleOpenMenu}
                className={classes.moreButton}
              >
                <MoreIcon />
              </ThemeIconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMore}
                onClose={handleCloseMenu}
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
              >
                <MenuItem onClick={triggerImport}>
                  {t('dashboard:Import dashboard settings')}
                </MenuItem>
                <MenuItem onClick={triggerExport}>
                  {t('dashboard:Export this dashboard settings')}
                </MenuItem>
                <MenuItem
                  onClick={handleMove}
                  disabled={!allGadgetsConfig[tabIdx] || allGadgetsConfig[tabIdx].length === 0}
                >
                  {t('dashboard:Move gadgets')}
                </MenuItem>
              </Menu>
            </div>
            {loading && !called ? (
              <Loading open />
            ) : (
              Array.from(
                { length: 3 },
                (_, i) =>
                  tabIdx === i && (
                    <GridLayout
                      key={i}
                      ref={layoutWrapperRef}
                      isDraggable={isDraggable}
                      gadgets={allGadgetsConfig[i]}
                      layouts={allLayouts[i]}
                      slideDirection={slideDirection}
                      enableAdd={enableAdd}
                      onDragSave={handleDragSave}
                      onDragCancel={handleDragCancel}
                      onDelete={handleDelete}
                      onLayoutChange={handleLayoutChange}
                      onOpenAdd={handleOpenAddDialog}
                      onUpdateConfig={handleUpdateConfig}
                      onDuplicateConfig={handleAdd}
                    />
                  ),
              )
            )}
            <ThemeIconButton
              color="primary"
              variant="contained"
              onClick={handleOpenAddDialog}
              className={classes.addButton}
            >
              <AddIcon />
            </ThemeIconButton>
            <AddGadget open={openAdd} enableAdd={enableAdd} onClose={handleAdd} />
          </Container>
          <BaseDialog
            open={openImport}
            onClose={handleCloseImport}
            title={t('dashboard:Import and replace dashboard settings')}
            classes={{ dialog: classes.dialog, content: classes.dialogContent }}
            content={
              <>
                <Typography variant="body1">
                  {t(
                    'dashboard:Applying a dashboard file will replace the existing settings_ Any changes you have made will be lost_',
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={handleImport}
                  className={classes.dialogButton}
                >
                  {t('dashboard:Yes, apply it')}
                </Button>
              </>
            }
          />
          <BaseDialog
            open={openExport}
            onClose={() => {
              setOpenExport(false);
            }}
            title={t('dashboard:Export current dashboard settings')}
            classes={{ dialog: classes.dialog, content: classes.dialogContent }}
            content={
              <>
                <Typography variant="body1">
                  {t(
                    'dashboard:Reminder_ This settings file could not display correctly in another division_ It could be because the previous settings included devices you do not have permissions for_ You can re-configure the file to make it work_',
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={handleExport}
                  className={classes.dialogButton}
                >
                  {t('common:Download')}
                </Button>
              </>
            }
          />
        </Guard>
      </MainLayout>
    </I18nDashboardProvider>
  );
};

export default memo(Dashboard);
