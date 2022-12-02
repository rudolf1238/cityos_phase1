import 'leaflet/dist/leaflet.css';

import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import MapIcon from '@material-ui/icons/Map';

import { Action, DeviceType, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import DevicesIcon from 'city-os-common/assets/icon/devices.svg';
import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import { Building, DetailMode, Floor, Query } from 'city-os-indoor/libs/type';
import {
  GET_FULL_BUILDINGS,
  GetFullBuildingsPayload,
  GetFullBuildingsResponse,
} from 'city-os-indoor/api/getFullBuildings';
import DeviceMapMode from 'city-os-indoor/modules/detailMode/DeviceMapMode';
import EditBuildingDialog from 'city-os-indoor/modules/dialog/EditBuildingDialog';
import FloorSelector from 'city-os-indoor/modules/custom/FloorSelector';
import Header from 'city-os-indoor/modules/custom/Header';
import HeatMapMode from 'city-os-indoor/modules/detailMode/HeatMapMode';
import I18nIndoorProvider from 'city-os-indoor/modules/I18nIndoorProvider';
import SplitScreenIcon from 'city-os-indoor/assets/icon/split-screen.svg';
import SplitScreenMode from 'city-os-indoor/modules/detailMode/SplitScreenMode';
import ThemeButtonMenu, {
  ThemeButtonMoreMenuItem,
} from 'city-os-indoor/modules/custom/ThemeButtonMenu';
import ThemeIconButtonMoreMenu from 'city-os-indoor/modules/custom/ThemeIconButtonMoreMenu';
import ViewerPageProvider, {
  ViewerPageContextValue,
} from 'city-os-indoor/modules/ViewerPageProvider';
import useIndoorTranslation from 'city-os-indoor/hooks/useIndoorTranslation';

// 因為刪除建築不知道要從哪個 division 刪除，所以先隱藏按鈕，直到這個邏輯問題改善後再開放
// import DeleteBuildingDialog from 'city-os-indoor/modules/deleteBuilding/DeleteBuildingDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  headerContainer: {
    marginTop: theme.spacing(2),
    marginBottom: -theme.spacing(2.075),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(1.5),
  },

  title: {},

  content: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'hidden',
    marginTop: theme.spacing(3),
    background: '#ffffff',
  },

  editBuildingDialog: {
    width: 1024,
    height: '95vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(5),
  },

  editBuildingDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

const IndoorDetailViewerPage: VoidFunctionComponent = () => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const router = useRouter();
  const { t } = useIndoorTranslation(['indoor']);
  const { tDevice } = useDeviceTranslation();
  const changeRoute = useChangeRoute<Query>(`${subjectRoutes[Subject.INDOOR]}/detail`);

  const [deviceList, setDeviceList] = useState<IDevice[]>([]);
  const [selectedIdList, setSelectedIdList] = useState<string[]>([]);
  const [mode, setMode] = useState<DetailMode | null>(null);
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<DeviceType | null>(null);

  const contextValue = useMemo<ViewerPageContextValue>(
    () => ({
      selectedIdList,
      setSelectedIdList,
      mode,
      setMode,
      selectedFloorNumber,
      setSelectedFloorNumber,
      building,
      setBuilding,
      activeId,
      setActiveId,
      deviceList,
      setDeviceList,
      floor,
      setFloor,
      deviceTypeFilter,
      setDeviceTypeFilter,
    }),
    [
      activeId,
      building,
      deviceList,
      deviceTypeFilter,
      floor,
      mode,
      selectedFloorNumber,
      selectedIdList,
    ],
  );

  const handleModeChange = useCallback(
    (_mode: string) => {
      changeRoute({ mode: _mode as DetailMode });
    },
    [changeRoute],
  );

  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const { data: getFullBuildingsData, refetch: refetchGetFullBuildingsData } = useQuery<
    GetFullBuildingsResponse,
    GetFullBuildingsPayload
  >(GET_FULL_BUILDINGS, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      filter: { deviceId: routerQuery.deviceId || '' },
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  useEffect(() => {
    if (getFullBuildingsData !== undefined) {
      if (getFullBuildingsData.getBuildings.edges.length > 0) {
        setBuilding(getFullBuildingsData.getBuildings.edges[0].node);
      }
    }
  }, [getFullBuildingsData]);

  useEffect(() => {
    void refetchGetFullBuildingsData();
  }, [refetchGetFullBuildingsData]);

  const ModeContent = useMemo(() => {
    switch (routerQuery.mode) {
      case DetailMode.DEVICE_MAP:
        return <DeviceMapMode />;
      case DetailMode.SPLIT_SCREEN:
        return <SplitScreenMode />;
      case DetailMode.HEATMAP:
        return <HeatMapMode />;
      default:
        return <DeviceMapMode />;
    }
  }, [routerQuery.mode]);

  const currentFloorList = useMemo<Floor[]>(() => {
    if (getFullBuildingsData !== undefined) {
      if (getFullBuildingsData.getBuildings.edges.length > 0) {
        return getFullBuildingsData.getBuildings.edges[0].node.floors;
      }
    }
    return [];
  }, [getFullBuildingsData]);

  useEffect(() => {
    setFloor(
      currentFloorList?.find((currentFloor) => currentFloor.floorNum === selectedFloorNumber) ||
        null,
    );
  }, [currentFloorList, selectedFloorNumber]);

  useEffect(() => {
    if (floor !== null) {
      const currentDeviceList = floor.devices.filter(
        (device) => deviceTypeFilter === null || device.type === deviceTypeFilter,
      );
      setDeviceList(currentDeviceList);
    }
  }, [deviceTypeFilter, floor]);

  const [isEditBuildingDialogOpen, setIsEditBuildingDialogOpen] = React.useState(false);

  const handleEditBuildingAction: React.MouseEventHandler<HTMLButtonElement> = (
    _e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setIsEditBuildingDialogOpen(true);
  };

  const handleEditBuildingDialogClose = useCallback(
    (_flag?: boolean) => {
      if (isMountedRef.current) {
        setIsEditBuildingDialogOpen(false);
      }
      if (_flag) {
        void refetchGetFullBuildingsData();
      }
    },
    [isMountedRef, refetchGetFullBuildingsData],
  );

  // 因為刪除建築不知道要從哪個 division 刪除，所以先隱藏按鈕，直到這個邏輯問題改善後再開放
  // const [openDeleteBuilding, setOpenDeleteBuilding] = useState(false);
  // const handleCloseDeleteBuildingInfo = useCallback(() => {
  //   setOpenDeleteBuilding(false);
  //   void router.push({
  //     pathname: `${subjectRoutes[Subject.INDOOR]}`,
  //   });
  // }, [router]);

  const themeIconButtonMoreMenuPropsItemList: ThemeButtonMoreMenuItem[] = [
    {
      id: DetailMode.DEVICE_MAP,
      label: t('indoor:Device Map'),
      icon: <MapIcon />,
    },
    {
      id: DetailMode.SPLIT_SCREEN,
      label: t('indoor:Split Screen'),
      icon: <SplitScreenIcon />,
    },
    // 堆然設計圖有熱點圖，但是沒有熱點圖的設備，所以暫時不開放
    // {
    //   id: DetailMode.HEATMAP,
    //   label: 'Heat Map',
    //   icon: <MapIcon />,
    // },
  ];

  const deviceFilterItemList: ThemeButtonMoreMenuItem[] = useMemo(() => {
    const currentList: ThemeButtonMoreMenuItem[] = [
      { id: 'all', label: t('common:All'), icon: <DevicesIcon /> },
    ];

    (Object.keys(DeviceType) as DeviceType[]).map((deviceType: DeviceType) => {
      currentList.push({
        id: deviceType,
        label: tDevice(deviceType),
        icon: <DeviceIcon type={deviceType} />,
      });
      return null;
    });

    return currentList;
  }, [t, tDevice]);

  // const canRemove = useIsEnableRule({ subject: Subject.INDOOR, action: Action.REMOVE });
  const canModify = useIsEnableRule({ subject: Subject.INDOOR, action: Action.MODIFY });

  const moreMenuContent = useMemo(
    () => [
      canModify
        ? {
            id: 'edit-floorplans',
            label: t('indoor:Edit Floorplans'),
            onClick: () => {
              void router.push({
                pathname: `${subjectRoutes[Subject.INDOOR]}/detail/editor`,
                query: {
                  deviceId: building?.deviceId,
                },
              });
            },
          }
        : null,
      canModify
        ? {
            id: 'edit-building-info',
            label: t('indoor:Edit Building Info'),
            onClick: handleEditBuildingAction,
          }
        : null,
      // TODO: 因為刪除建築不知道要從哪個 division 刪除，所以先隱藏按鈕，直到這個邏輯問題改善後再開放
      // canRemove
      //   ? {
      //       id: 'delete-building',
      //       label: t('indoor:Delete Building'),
      //       onClick: () => {
      //         setOpenDeleteBuilding(true);
      //       },
      //       errorColor: true,
      //     }
      //   : null,
    ],
    [building?.deviceId, canModify, router, t],
  );

  const handleDeviceFilterChange = useCallback((id: string) => {
    setDeviceTypeFilter(id === 'all' ? null : (id as DeviceType));
  }, []);

  return (
    <I18nIndoorProvider>
      <MainLayout>
        <Guard subject={Subject.INDOOR} action={Action.VIEW}>
          <ViewerPageProvider value={contextValue}>
            <div className={classes.root}>
              <Grid
                container
                className={classes.headerContainer}
                justify="space-between"
                alignItems="center"
              >
                <Grid item className={classes.title} md={6} lg={5}>
                  <Header
                    title={building?.name}
                    backLinkText={t('indoor:Indoor Map')}
                    backLinkHref={subjectRoutes[Subject.INDOOR]}
                  />
                </Grid>
                <Grid item container justify="flex-end" md={6} lg={7}>
                  {(routerQuery.mode === DetailMode.DEVICE_MAP ||
                    routerQuery.mode === undefined) && (
                    <ThemeButtonMenu
                      style={{ marginRight: '1em' }}
                      handleChange={handleDeviceFilterChange}
                      itemList={deviceFilterItemList}
                      selectedItemId={!deviceTypeFilter ? 'all' : deviceTypeFilter}
                    />
                  )}
                  <ThemeButtonMenu
                    style={{ marginRight: '1em' }}
                    handleChange={handleModeChange}
                    itemList={themeIconButtonMoreMenuPropsItemList}
                    selectedItemId={(routerQuery.mode || DetailMode.DEVICE_MAP) as string}
                  />
                  {/* canRemove 暫時被拿掉 */}
                  {canModify && <ThemeIconButtonMoreMenu menuItemList={moreMenuContent} />}
                </Grid>
              </Grid>
              <div className={classes.content}>
                {currentFloorList.length > 0 && (
                  <FloorSelector
                    floorList={currentFloorList}
                    selectedFloorNumber={selectedFloorNumber}
                    setSelectedFloorNumber={setSelectedFloorNumber}
                  />
                )}
                {ModeContent}
              </div>
            </div>
            <Guard subject={Subject.INDOOR} action={Action.MODIFY} fallback={null}>
              <EditBuildingDialog
                open={isEditBuildingDialogOpen}
                onClose={handleEditBuildingDialogClose}
                styles={{
                  root: classes.editBuildingDialog,
                  content: classes.editBuildingDialogContent,
                }}
              />
            </Guard>
            {/* 因為刪除建築不知道要從哪個 division 刪除，所以先隱藏按鈕，直到這個邏輯問題改善後再開放 */}
            {/* <Guard subject={Subject.INDOOR} action={Action.REMOVE} fallback={null}>
              <DeleteBuildingDialog
                open={openDeleteBuilding}
                onClose={handleCloseDeleteBuildingInfo}
                buildingdeviceId={building?.deviceId || ''}
              />
            </Guard> */}
          </ViewerPageProvider>
        </Guard>
      </MainLayout>
    </I18nIndoorProvider>
  );
};

export default IndoorDetailViewerPage;
