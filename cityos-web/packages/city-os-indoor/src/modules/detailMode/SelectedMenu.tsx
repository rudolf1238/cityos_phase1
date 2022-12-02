import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceType } from 'city-os-common/libs/schema';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';

import {
  GET_DEVICES_ON_SURVEILLANCE,
  GetDevicesOnSurveillancePayload,
  GetDevicesOnSurveillanceResponse,
} from '../../api/getDevicesOnSurveillance';
import { LiveViewDevice, SplitMode } from '../../libs/type';
import {
  SAVE_LIVE_VIEW_CONFIG,
  SaveLiveViewConfigPayload,
  SaveLiveViewConfigResponse,
} from '../../api/saveLiveViewConfig';
import { splitModeColumnCount } from '../../libs/constants';
import { useSurveillanceContext } from './SurveillanceProvider';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

import PinIcon from '../../assets/icon/pin.svg';

/** css animation constants */
const animationBuffer = 300;
const twinkleDuration = 1_000;
const twinkleDelay = 0;
const twinkleTimes = 2;
const fadeOutDelay = twinkleDuration * twinkleTimes;
const fadeOutDuration = 10_000;

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    boxShadow: theme.shadows[10],
    backgroundColor: theme.palette.background.paper,
  },

  selectedMenuTablet: {
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      right: 0,
      height: '100%',
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
  },

  extendablePanel: {
    height: '100%',
  },

  toggle: {
    top: theme.spacing(14),
  },

  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
    backgroundColor: theme.palette.background.oddRow,
    padding: theme.spacing(2.5),
    width: '100%',
  },

  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
  },

  listItem: {
    gap: theme.spacing(1),
    cursor: 'pointer',
    paddingLeft: theme.spacing(1.5),
    height: theme.spacing(7),

    '&::after': {
      display: 'none',
    },

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },

  activeItem: {
    '&$selected': {
      animation: `$fadeOut ${fadeOutDuration}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  selectedItem: {
    '&$selected': {
      animation: `$twinkle ${twinkleDuration}ms ${twinkleDelay}ms ${twinkleTimes} ${theme.transitions.easing.sharp}, $fadeOut ${fadeOutDuration}ms ${fadeOutDelay}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  '@keyframes fadeOut': {
    from: {
      backgroundColor: theme.palette.action.selected,
    },

    to: {
      backgroundColor: 'transparent',
    },
  },

  '@keyframes twinkle': {
    '50%': {
      backgroundColor: theme.palette.action.selected,
    },

    '100%': {
      backgroundColor: 'transparent',
    },
  },

  selected: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,

    '&:last-child': {
      borderBottom: '1px solid transparent',
    },
  },

  listItemIcon: {
    minWidth: 24,
    color: theme.palette.info.contrastText,
  },

  pinIcon: {
    width: 12,
    color: theme.palette.text.disabled,
  },

  pinIconSelected: {
    color: theme.palette.primary.main,
  },

  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: 24,
    height: 24,
  },

  cameraIcon: {
    borderRadius: '50%',
    backgroundColor: theme.palette.secondary.main,
    padding: theme.spacing(0.5),
  },
}));

interface SelectedMenuProps {
  open: boolean;
  mode: 'map' | 'splitScreen';
  onToggle: (isOpen: boolean) => void;
  onFix: (fixItem: { device: LiveViewDevice; fixIdx: number }) => void;
}

const SelectedMenu: VoidFunctionComponent<SelectedMenuProps> = ({
  open,
  mode,
  onToggle,
  onFix,
}: SelectedMenuProps) => {
  const classes = useStyles();
  const { t } = useIndoorTranslation('indoor');
  const isMountedRef = useIsMountedRef();
  const {
    activeDevice,
    selectedDevices,
    currentPageDevices,
    splitMode,
    setSelectedDevices,
    setActiveDevice,
    setFixSelectingDevice,
  } = useSurveillanceContext();

  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;

  const [selectedAnonymousDevice, setSelectedAnonymousDevice] = useState<LiveViewDevice>();

  const { data: getDevicesData } = useQuery<
    GetDevicesOnSurveillanceResponse,
    GetDevicesOnSurveillancePayload
  >(GET_DEVICES_ON_SURVEILLANCE, {
    variables: {
      deviceIds: selectedDevices.map(({ deviceId }) => deviceId),
    },
    skip: setSelectedDevices.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const [saveLiveViewConfig] = useMutation<SaveLiveViewConfigResponse, SaveLiveViewConfigPayload>(
    SAVE_LIVE_VIEW_CONFIG,
  );

  const initSelectedAnimation = useCallback(() => {
    setActiveDevice(undefined);
    setSelectedAnonymousDevice(undefined);
  }, [setActiveDevice]);

  const handleSelect = useCallback(
    (device: LiveViewDevice, label: string | null) => {
      const setSelected = () => {
        setSelectedAnonymousDevice(label ? undefined : device);
        setActiveDevice(label ? device : undefined);
      };

      if (selectedAnonymousDevice || activeDevice) {
        initSelectedAnimation();
        window.setTimeout(() => {
          if (!isMountedRef.current) return;
          setSelected();
        }, animationBuffer);
      } else {
        setSelected();
      }

      if (splitMode === SplitMode.SINGLE) {
        onFix({ device, fixIdx: 0 });
      } else {
        setFixSelectingDevice(device);
      }
    },
    [
      selectedAnonymousDevice,
      activeDevice,
      splitMode,
      isMountedRef,
      setActiveDevice,
      initSelectedAnimation,
      onFix,
      setFixSelectingDevice,
    ],
  );

  const handleDeleteSelected = useCallback(
    (device: LiveViewDevice) => {
      const currSelectedDevices = selectedDevices.filter(
        (selectedDevice) => selectedDevice.deviceId !== device.deviceId,
      );
      void saveLiveViewConfig({
        variables: {
          input: {
            devices: currSelectedDevices,
          },
        },
      });
      if (!isMountedRef.current) return;
      setSelectedDevices(currSelectedDevices);
    },
    [isMountedRef, saveLiveViewConfig, selectedDevices, setSelectedDevices],
  );

  const selectedCameraList = useMemo(
    () =>
      getDevicesData?.getDevices
        ? selectedDevices.reduce<{ device: LiveViewDevice; name: string; label: string | null }[]>(
            (cameraList, selectedDevice) => {
              const deviceInfo = getDevicesData.getDevices?.find(
                (device) => device.deviceId === selectedDevice.deviceId,
              );
              if (deviceInfo) {
                const playingIndex = currentPageDevices.findIndex(
                  (device) => device?.deviceId === selectedDevice.deviceId,
                );
                cameraList.push({
                  device: selectedDevice,
                  name: deviceInfo.name,
                  label: playingIndex >= 0 ? (playingIndex + 1).toString() : null,
                });
              }
              return cameraList;
            },
            [],
          )
        : undefined,
    [currentPageDevices, getDevicesData?.getDevices, selectedDevices],
  );

  return (
    <div
      className={clsx(classes.selectedMenu, {
        [classes.selectedMenuTablet]: mode === 'splitScreen',
      })}
    >
      <ExtendablePanel
        size={330}
        open={open}
        onToggle={onToggle}
        direction="right"
        PaperProps={{
          className: classes.paper,
        }}
        classes={{ root: classes.extendablePanel, toggle: classes.toggle }}
      >
        <div className={classes.counter}>
          <Typography variant="body2">
            {t('{{count}} device', { count: selectedDevices.length })}
          </Typography>
        </div>
        <List aria-label={t('Selected Camera List')} className={classes.list}>
          {selectedCameraList?.map(({ device, name, label }) => (
            <ListItem
              key={device.deviceId}
              classes={{
                root: clsx(classes.listItem, {
                  [classes.selectedItem]: device.deviceId === selectedAnonymousDevice?.deviceId,
                  [classes.activeItem]: device.deviceId === activeDevice?.deviceId,
                }),
                selected: classes.selected,
              }}
              selected={
                device.deviceId === activeDevice?.deviceId ||
                device.deviceId === selectedAnonymousDevice?.deviceId
              }
              onClick={() => {
                handleSelect(device, label);
              }}
              onAnimationEnd={initSelectedAnimation}
            >
              <PinIcon
                className={clsx(classes.pinIcon, {
                  [classes.pinIconSelected]:
                    device.fixedIndex !== null && device.fixedIndex < gridsPerPage,
                })}
              />
              <ListItemIcon className={classes.listItemIcon}>
                {label ? (
                  <Avatar className={classes.avatar}>
                    <Typography variant="subtitle2">{label}</Typography>
                  </Avatar>
                ) : (
                  <DeviceIcon type={DeviceType.CAMERA} className={classes.cameraIcon} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textPrimary">
                    {name}
                  </Typography>
                }
              />
              <ListItemIcon
                className={classes.listItemIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteSelected(device);
                }}
              >
                <CloseIcon color="primary" fontSize="small" />
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </ExtendablePanel>
    </div>
  );
};

export default memo(SelectedMenu);
