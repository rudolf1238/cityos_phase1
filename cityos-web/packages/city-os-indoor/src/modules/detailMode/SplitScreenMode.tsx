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

import { Action, DeviceType, Subject } from 'city-os-common/libs/schema';
import { autoPlayInterval } from 'city-os-common/libs/parsedENV';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import Guard from 'city-os-common/modules/Guard';

import { LiveViewDevice, SplitMode } from '../../libs/type';
import { READ_LIVE_VIEW_CONFIG, ReadLiveViewConfigResponse } from '../../api/readLiveViewConfig';
import {
  SAVE_LIVE_VIEW_CONFIG,
  SaveLiveViewConfigPayload,
  SaveLiveViewConfigResponse,
} from '../../api/saveLiveViewConfig';
import { splitModeColumnCount } from '../../libs/constants';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

import { IDevice } from '../../../../city-os-common/src/libs/schema';
import { useViewerPageContext } from '../ViewerPageProvider';
import DeviceList from '../custom/DeviceList';
import FixSelectingMode from './FixSelectingMode';
import I18nIndoorProvider from '../I18nIndoorProvider';
import SplitScreens from './SplitScreens';
import SurveillanceProvider, { SurveillanceContextValue } from './SurveillanceProvider';

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

    '& > button': {
      borderRadius: theme.shape.borderRadius * 5,
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      color: theme.palette.text.primary,

      '&:not(.Mui-disabled) svg': {
        color: theme.palette.primary.main,
      },
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
    background: theme.palette.background.default,
  },

  subContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',
  },

  mapContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',

    '& > div': {
      height: '100%',
    },
  },
}));

const getFixedStateList = ({
  selectedDevices,
  splitMode,
}: {
  selectedDevices: LiveViewDevice[];
  splitMode: SplitMode;
}): { fixedDevices: (LiveViewDevice | undefined)[]; unfixedDevice: LiveViewDevice[] } => {
  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;
  const currPageFixedDevices: (LiveViewDevice | undefined)[] = Array.from({ length: gridsPerPage });
  const allUnfixedDevices: LiveViewDevice[] = [];

  selectedDevices?.forEach((device) => {
    if (device.fixedIndex !== null) {
      currPageFixedDevices[device.fixedIndex] = device;
    } else {
      allUnfixedDevices.push(device);
    }
  });

  return {
    fixedDevices: currPageFixedDevices,
    unfixedDevice: allUnfixedDevices,
  };
};

const getCurrentPageDevices = ({
  fixedDevices,
  unfixedDevice,
  splitMode,
  page,
}: {
  fixedDevices: (LiveViewDevice | undefined)[];
  unfixedDevice: LiveViewDevice[];
  splitMode: SplitMode;
  page: number;
}): (LiveViewDevice | undefined)[] => {
  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;

  const fixedDevicesPerPage = fixedDevices.reduce(
    (count, fixedDevice) => (fixedDevice !== undefined ? count + 1 : count),
    0,
  );
  const unfixedDevicesPerPage = gridsPerPage - fixedDevicesPerPage;
  const startIdx = (page - 1) * unfixedDevicesPerPage;
  const endIdx = page * unfixedDevicesPerPage;
  const currUnfixedDevices = unfixedDevice.slice(startIdx, endIdx);

  return fixedDevices.map((device) => device || currUnfixedDevices.shift());
};

const SplitScreenMode: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useIndoorTranslation(['mainLayout', 'indoor']);
  const isMountedRef = useIsMountedRef();
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();

  const [mode, setMode] = useState<'map' | 'splitScreen'>('map');
  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<LiveViewDevice[]>([]);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [showCameraMenu, setShowCameraMenu] = useState<boolean>(true);
  const [showSelectedMenu, setShowSelectedMenu] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [splitMode, setSplitMode] = useState<SplitMode>(SplitMode.FOUR);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [autoplayInSeconds, setAutoplayInSeconds] = useState<number>(autoPlayInterval);
  const [activeDevice, setActiveDevice] = useState<LiveViewDevice | undefined>(undefined);
  const [fixSelectingDevice, setFixSelectingDevice] = useState<LiveViewDevice | undefined>();

  useQuery<ReadLiveViewConfigResponse>(READ_LIVE_VIEW_CONFIG, {
    fetchPolicy: 'cache-and-network',
    skip: !permissionGroup?.group?.id,
    onCompleted: ({ readLiveViewConfig }) => {
      if (!readLiveViewConfig) return;
      const {
        devices,
        splitMode: initSplitMode,
        autoplay: initAutoPlay,
        autoplayInSeconds: initAutoPlayInSeconds,
      } = readLiveViewConfig;
      if (devices && devices.length > 0) {
        setMode('splitScreen');
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
          message: t('indoor:Unable to connect to camera service_'),
        },
      });
    },
  });

  const { deviceList } = useViewerPageContext();

  useEffect(() => {
    setSelectedDevices(
      deviceList
        .filter((device) => device.type === DeviceType.CAMERA)
        .map((device) => ({ deviceId: device.deviceId, fixedIndex: null })),
    );
  }, [deviceList]);

  const [saveLiveViewConfig] = useMutation<SaveLiveViewConfigResponse, SaveLiveViewConfigPayload>(
    SAVE_LIVE_VIEW_CONFIG,
  );

  const clearAllSelected = useCallback(() => {
    void saveLiveViewConfig({
      variables: {
        input: {
          devices: [],
        },
      },
    });
    if (!isMountedRef.current) return;
    setSelectedDevices([]);
    setActiveDevice(undefined);
  }, [isMountedRef, saveLiveViewConfig]);

  const { fixedDevices, unfixedDevice } = useMemo(
    () => getFixedStateList({ selectedDevices, splitMode }),
    [selectedDevices, splitMode],
  );

  const currentPageDevices = useMemo(
    () =>
      getCurrentPageDevices({
        fixedDevices,
        unfixedDevice,
        splitMode,
        page,
      }),
    [fixedDevices, page, splitMode, unfixedDevice],
  );

  const contextValue = useMemo<SurveillanceContextValue>(
    () => ({
      map,
      keyword,
      selectedDevices,
      currentPageDevices,
      activeDevice,
      page,
      splitMode,
      autoplay,
      autoplayInSeconds,
      fixSelectingDevice,
      setMap,
      setSelectedDevices,
      setActiveDevice,
      clearAllSelected,
      setPage,
      setSplitMode,
      setAutoplay,
      setAutoplayInSeconds,
      setFixSelectingDevice,
    }),
    [
      map,
      keyword,
      selectedDevices,
      currentPageDevices,
      activeDevice,
      page,
      splitMode,
      autoplay,
      autoplayInSeconds,
      fixSelectingDevice,
      clearAllSelected,
    ],
  );

  const handleFixSelectOnClose = useCallback(() => {
    setFixSelectingDevice(undefined);
  }, []);

  const handleFix = useCallback(
    (fixItem: { device: LiveViewDevice; fixIdx: number }) => {
      const newSelectedDevices = selectedDevices.map(({ deviceId, fixedIndex }) => {
        if (fixedIndex === fixItem.fixIdx) return { deviceId, fixedIndex: null };
        if (deviceId === fixItem.device.deviceId) return { deviceId, fixedIndex: fixItem.fixIdx };
        return { deviceId, fixedIndex };
      });

      void saveLiveViewConfig({
        variables: {
          input: {
            devices: newSelectedDevices,
          },
        },
      });
    },
    [selectedDevices, saveLiveViewConfig],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!map) return;
      map.invalidateSize(true);
    }, 500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [map, showCameraMenu, mode, showSelectedMenu]);

  return (
    <I18nIndoorProvider>
      <Guard subject={Subject.IVS_SURVEILLANCE} action={Action.VIEW}>
        <SurveillanceProvider value={contextValue}>
          <div className={classes.content}>
            <SplitScreens onFix={handleFix} />
            <DeviceList
              open={showSelectedMenu}
              mode={mode}
              onToggle={setShowSelectedMenu}
              handleClick={(deviceId: string) => {
                setActiveDevice({ deviceId, fixedIndex: null });
                const index = deviceList.indexOf(
                  deviceList.find((device) => device.deviceId === deviceId) as IDevice,
                );
                let prePage = 1;
                if (splitMode === SplitMode.FOUR) {
                  prePage = 4;
                } else if (splitMode === SplitMode.NINE) {
                  prePage = 9;
                } else if (splitMode === SplitMode.SIXTEEN) {
                  prePage = 16;
                }
                setPage(Math.floor(index / prePage) + 1);
              }}
            />
            <FixSelectingMode
              device={fixSelectingDevice}
              onFix={handleFix}
              onClose={handleFixSelectOnClose}
            />
          </div>
        </SurveillanceProvider>
      </Guard>
    </I18nIndoorProvider>
  );
};

export default memo(SplitScreenMode);
