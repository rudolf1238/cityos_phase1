import { Map as LeafletMapClass } from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import findLastIndex from 'lodash/findLastIndex';
import isEqual from 'lodash/isEqual';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import {
  CAMERA_EVENT_HISTORY,
  CameraEventHistoryPayload,
  CameraEventHistoryResponse,
} from 'city-os-common/api/cameraEventHistory';
import { autoPlayInterval } from 'city-os-common/libs/parsedENV';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useHiddenStyles from 'city-os-common/styles/hidden';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';

import { LiveViewDevice, PlaybackRange, SplitMode, VideoStatusRecord } from '../libs/type';
import { READ_LIVE_VIEW_CONFIG, ReadLiveViewConfigResponse } from '../api/readLiveViewConfig';
import {
  SAVE_LIVE_VIEW_CONFIG,
  SaveLiveViewConfigPayload,
  SaveLiveViewConfigResponse,
} from '../api/saveLiveViewConfig';
import { eventDuration, splitModeColumnCount } from '../libs/constants';
import findUnfixedDeviceIndexes from '../libs/findUnfixedDeviceIndexes';
import useSurveillanceTranslation from '../hooks/useSurveillanceTranslation';

import CameraMapIcon from '../assets/icon/camera-map.svg';
import CameraMenu from './CameraMenu';
import FixSelectingMode from './FixSelectingMode';
import I18nSurveillanceProvider from './I18nSurveillanceProvider';
import PlaybackMapToolbar from './PlaybackMapToolbar';
import SelectedMenu from './SelectedMenu';
import SplitScreenIcon from '../assets/icon/split-screen.svg';
import SplitScreens from './SplitScreens';
import SurveillanceProvider, { SurveillanceContextValue } from './SurveillanceProvider';

const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  bar: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3, 3, 2),
  },

  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: 'auto',
  },

  button: {
    borderRadius: theme.shape.borderRadius * 5,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    color: theme.palette.text.primary,

    '&:not(.Mui-disabled) svg': {
      color: theme.palette.primary.main,
    },
  },

  buttonSelected: {
    background: theme.palette.action.selected,
  },

  content: {
    display: 'flex',
    position: 'relative',
    flex: 1,
    height: '100%',
    overflowY: 'hidden',
  },

  subContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',
  },

  cameraMap: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',

    '& > div': {
      height: '100%',
    },
  },

  mapContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
}));

const getPageDeviceIds = ({
  selectedDevices,
  cursorIndex,
  splitMode,
}: {
  selectedDevices: LiveViewDevice[];
  cursorIndex: number;
  splitMode: SplitMode;
}): (string | undefined)[] => {
  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;
  const fixedDevices: (string | undefined)[] = Array.from({ length: gridsPerPage });
  let fixedDeviceCount = 0;
  selectedDevices?.forEach((device) => {
    if (device.fixedIndex !== null) {
      fixedDevices[device.fixedIndex] = device.deviceId;
      fixedDeviceCount += 1;
    }
  });
  const startIdx = cursorIndex;
  const endIdx = cursorIndex === 0 ? selectedDevices.length - 1 : cursorIndex - 1;

  const unfixedDeviceIndexes = findUnfixedDeviceIndexes({
    startIdx,
    endIdx,
    devices: selectedDevices,
    times: gridsPerPage - fixedDeviceCount,
  });

  return fixedDevices.map((deviceId) => {
    if (deviceId) return deviceId;
    const unfixedDeviceIdx = unfixedDeviceIndexes.shift();
    return unfixedDeviceIdx !== undefined ? selectedDevices[unfixedDeviceIdx].deviceId : undefined;
  });
};

const getNormalizedDevices = ({
  devices,
  splitMode,
}: {
  devices: LiveViewDevice[];
  splitMode: SplitMode;
}): LiveViewDevice[] => {
  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;
  const fixedList: string[] = [];
  return devices.map(({ deviceId, fixedIndex }) => {
    if (fixedIndex !== null) {
      if (fixedIndex >= gridsPerPage || fixedList[fixedIndex] !== undefined) {
        return { deviceId, fixedIndex: null };
      }
      fixedList[fixedIndex] = deviceId;
    }

    return { deviceId, fixedIndex };
  });
};

const SurveillancePage: VoidFunctionComponent = () => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const enableView = useIsEnableRule({ subject: Subject.IVS_SURVEILLANCE, action: Action.VIEW });
  const { t } = useSurveillanceTranslation(['mainLayout', 'surveillance']);
  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const [mode, setMode] = useState<'map' | 'splitScreen'>('map');
  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<LiveViewDevice[]>([]);
  const [pageDeviceIds, setPageDeviceIds] = useState<(string | undefined)[]>([]);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [showCameraMenu, setShowCameraMenu] = useState<boolean>(true);
  const [showSelectedMenu, setShowSelectedMenu] = useState<boolean>(true);
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>(SplitMode.FOUR);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [autoplayInSeconds, setAutoplayInSeconds] = useState<number>(autoPlayInterval);
  const [fixSelectingDevice, setFixSelectingDevice] = useState<LiveViewDevice>();
  const [playbackRange, setPlaybackRange] = useState<PlaybackRange>();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [playbackTime, setPlaybackTime] = useState<number | null>(null);
  const [isPlaybackPaused, setIsPlaybackPaused] = useState(true);
  const [videoStatusRecord, setVideoStatusRecord] = useState<VideoStatusRecord>({});
  const [cameraEvents, setCameraEvents] =
    useState<CameraEventHistoryResponse['cameraEventHistory']>();
  const [eventDeviceIds, setEventDeviceIds] = useState<string[]>([]);

  useQuery<ReadLiveViewConfigResponse>(READ_LIVE_VIEW_CONFIG, {
    fetchPolicy: 'cache-and-network',
    skip: !permissionGroup?.group?.id || !enableView,
    onCompleted: ({ readLiveViewConfig }) => {
      if (!readLiveViewConfig) return;
      const {
        devices,
        splitMode: initSplitMode,
        autoplay: initAutoPlay,
        autoplayInSeconds: initAutoPlayInSeconds,
      } = readLiveViewConfig;
      if (devices.length > 0) {
        setMode('splitScreen');
        setSelectedDevices(getNormalizedDevices({ devices, splitMode }));
      } else {
        setMode('map');
      }
      if (initSplitMode) setSplitMode(initSplitMode);
      if (initAutoPlay !== null) setAutoplay(initAutoPlay);
      if (initAutoPlayInSeconds !== null) setAutoplayInSeconds(initAutoPlayInSeconds);
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('surveillance:Unable to connect to camera service_'),
        },
      });
    },
  });

  const [saveLiveViewConfig] = useMutation<SaveLiveViewConfigResponse, SaveLiveViewConfigPayload>(
    SAVE_LIVE_VIEW_CONFIG,
  );

  const { fetchMore } = useQuery<CameraEventHistoryResponse, CameraEventHistoryPayload>(
    CAMERA_EVENT_HISTORY,
    {
      skip: !divisionGroup?.id || !playbackRange,
      fetchPolicy: 'cache-and-network',
      variables: {
        groupId: divisionGroup?.id || '',
        filter: {
          from: playbackRange?.from.getTime() ?? 0,
          to: playbackRange?.to.getTime() ?? 0,
          deviceIds: pageDeviceIds.filter((id): id is string => !!id),
        },
        size: 100,
      },
      onCompleted: ({ cameraEventHistory }) => {
        const {
          pageInfo: { hasNextPage, endCursor },
        } = cameraEventHistory;
        if (hasNextPage) {
          void fetchMore({
            variables: { after: endCursor },
            updateQuery: (previousQueryResult, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previousQueryResult;
              if (!previousQueryResult.cameraEventHistory) return fetchMoreResult;
              const newResult: CameraEventHistoryResponse = {
                cameraEventHistory: {
                  ...fetchMoreResult.cameraEventHistory,
                  edges: [
                    ...previousQueryResult.cameraEventHistory.edges,
                    ...fetchMoreResult.cameraEventHistory.edges,
                  ],
                },
              };
              return newResult;
            },
          });
        } else {
          setCameraEvents(cameraEventHistory);
        }
      },
    },
  );

  const clearAllSelected = useCallback(() => {
    setSelectedDevices([]);
    setCursorIndex(0);
    setIsUpdating(true);
  }, []);

  const contextValue = useMemo<SurveillanceContextValue>(
    () => ({
      map,
      keyword,
      selectedDevices,
      pageDeviceIds,
      cursorIndex,
      splitMode,
      autoplay,
      autoplayInSeconds,
      fixSelectingDevice,
      playbackRange,
      isUpdating,
      playbackTime,
      isPlaybackPaused,
      videoStatusRecord,
      cameraEvents,
      eventDeviceIds,
      setMap,
      setSelectedDevices,
      clearAllSelected,
      setCursorIndex,
      setSplitMode,
      setAutoplay,
      setAutoplayInSeconds,
      setFixSelectingDevice,
      setPlaybackRange,
      setIsUpdating,
      setPlaybackTime,
      setIsPlaybackPaused,
      setVideoStatusRecord,
      setCameraEvents,
      setEventDeviceIds,
    }),
    [
      map,
      keyword,
      selectedDevices,
      pageDeviceIds,
      cursorIndex,
      splitMode,
      autoplay,
      autoplayInSeconds,
      fixSelectingDevice,
      playbackRange,
      isUpdating,
      playbackTime,
      isPlaybackPaused,
      clearAllSelected,
      videoStatusRecord,
      cameraEvents,
      eventDeviceIds,
    ],
  );

  const handleModeChange = useCallback((newMode: 'map' | 'splitScreen') => {
    setMode(newMode);
    setAutoplay(false);
  }, []);

  const handleFixSelectOnClose = useCallback(() => {
    setFixSelectingDevice(undefined);
  }, []);

  const handleChangeFixed = useCallback(
    (deviceId: string, screenIndex: number | null) => {
      const newSelectedDevices = selectedDevices.map((device) => {
        if (deviceId === device.deviceId) return { ...device, fixedIndex: screenIndex };
        if (screenIndex !== null && screenIndex === device.fixedIndex)
          return { ...device, fixedIndex: null };
        return device;
      });
      setSelectedDevices(newSelectedDevices);
      setIsUpdating(true);

      // unfix device
      if (screenIndex === null) return;

      const onPageIdx = pageDeviceIds.findIndex((id) => id === deviceId);
      if (onPageIdx !== -1) {
        // fix on page device to current index
        if (onPageIdx === screenIndex) return;
        // fix on page device to other index
        const newPageDeviceIds = pageDeviceIds.map((id) => (id !== deviceId ? id : undefined));
        newPageDeviceIds[screenIndex] = deviceId;
        const unfixedDeviceIdx = findUnfixedDeviceIndexes({
          startIdx: selectedDevices.findIndex(
            (device) =>
              device.deviceId ===
              (newPageDeviceIds[onPageIdx - 1] ||
                newPageDeviceIds[findLastIndex(pageDeviceIds, (id) => id !== undefined) - 1]),
          ),
          devices: newSelectedDevices,
          excludingIds: newPageDeviceIds.filter((id) => id !== undefined) as string[],
        });
        const appendDeviceId: string | undefined =
          newSelectedDevices[unfixedDeviceIdx[0]]?.deviceId;
        newPageDeviceIds[onPageIdx] = appendDeviceId;
        setPageDeviceIds(newPageDeviceIds);
      } else {
        // fix not on page device to index
        const newPageDeviceIds = [...pageDeviceIds];
        newPageDeviceIds[screenIndex] = deviceId;
        setPageDeviceIds(newPageDeviceIds);
      }
    },
    [pageDeviceIds, selectedDevices],
  );

  useEffect(() => {
    if (isUpdating) {
      void saveLiveViewConfig({
        variables: {
          input: {
            devices: selectedDevices,
            autoplay,
            splitMode,
            autoplayInSeconds,
          },
        },
      });
      setIsUpdating(false);
    }
  }, [saveLiveViewConfig, selectedDevices, autoplay, splitMode, autoplayInSeconds, isUpdating]);

  useEffect(() => {
    const newSelectedIds = selectedDevices.map(({ deviceId }) => deviceId);
    if (!isEqual(newSelectedIds, selectedIds)) {
      setSelectedIds(newSelectedIds);
    }
  }, [selectedDevices, selectedIds]);

  useEffect(() => {
    setPageDeviceIds(
      getPageDeviceIds({
        selectedDevices,
        cursorIndex,
        splitMode,
      }),
    );
    // Don't update `currentPageDevices` when fixed state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, cursorIndex, splitMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!map) return;
      map.invalidateSize(true);
    }, 500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [map, showCameraMenu, mode, showSelectedMenu]);

  useEffect(() => {
    setSelectedDevices([]);
    setAutoplay(false);
  }, [permissionGroup?.group?.id]);

  useEffect(() => {
    if (playbackTime === null || !cameraEvents) return;
    setEventDeviceIds(() =>
      cameraEvents.edges.reduce<string[]>(
        (newIds, { node: { deviceId, time } }) =>
          newIds.includes(deviceId) ||
          (time <= playbackTime && playbackTime <= time + eventDuration)
            ? newIds.concat(deviceId)
            : newIds.filter((id) => id !== deviceId),
        [],
      ),
    );
  }, [cameraEvents, playbackTime]);

  return (
    <I18nSurveillanceProvider>
      <MainLayout>
        <Guard subject={Subject.IVS_SURVEILLANCE} action={Action.VIEW}>
          <SurveillanceProvider value={contextValue}>
            <div className={classes.root}>
              <div className={classes.bar}>
                <Typography variant="h3">{t('mainLayout:Surveillance')}</Typography>
                <div className={classes.buttonsWrapper}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    className={clsx(classes.button, { [classes.buttonSelected]: mode === 'map' })}
                    onClick={() => handleModeChange('map')}
                    startIcon={<CameraMapIcon />}
                  >
                    {t('surveillance:Camera Map')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    className={clsx(classes.button, {
                      [classes.buttonSelected]: mode === 'splitScreen',
                    })}
                    onClick={() => handleModeChange('splitScreen')}
                    startIcon={<SplitScreenIcon />}
                  >
                    {t('surveillance:Split Screen')}
                  </Button>
                </div>
              </div>
              <div className={classes.content}>
                <div className={classes.subContainer}>
                  <div
                    className={clsx(classes.cameraMap, {
                      [hiddenClasses.hidden]: mode !== 'map',
                    })}
                  >
                    {map && (
                      <CameraMenu
                        showCameraMenu={showCameraMenu}
                        setKeyword={setKeyword}
                        setShowCameraMenu={setShowCameraMenu}
                      />
                    )}
                    <div className={classes.mapContainer}>
                      <MapContainer />
                      {map && playbackRange && <PlaybackMapToolbar playbackRange={playbackRange} />}
                    </div>
                  </div>
                  <SplitScreens
                    className={mode !== 'splitScreen' ? hiddenClasses.hidden : undefined}
                    onChangeFixed={handleChangeFixed}
                  />
                </div>
                {map && (
                  <SelectedMenu
                    open={showSelectedMenu}
                    mode={mode}
                    onToggle={setShowSelectedMenu}
                    onChangeFixed={handleChangeFixed}
                  />
                )}
                <FixSelectingMode
                  device={fixSelectingDevice}
                  onChangeFixed={handleChangeFixed}
                  onClose={handleFixSelectOnClose}
                />
              </div>
            </div>
          </SurveillanceProvider>
        </Guard>
      </MainLayout>
    </I18nSurveillanceProvider>
  );
};

export default memo(SurveillancePage);
