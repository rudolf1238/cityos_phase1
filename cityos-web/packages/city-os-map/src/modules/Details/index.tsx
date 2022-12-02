import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  ComponentProps,
  ReactElement,
  ReactNode,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import IconButton from '@material-ui/core/IconButton';

import { DeviceStatus, DeviceType } from 'city-os-common/libs/schema';
import {
  GET_DEVICE_DETAIL,
  GetDeviceDetailPayload,
  GetDeviceDetailResponse,
  RelatedDeviceResponse,
  SingleDeviceResponse,
} from 'city-os-common/api/getMapDevices';
import { subscribeSensorIds, tableSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useSubscribeDevicesStatus from 'city-os-common/hooks/useSubscribeDevicesStatus';

import BasicOverview from 'city-os-common/modules/Overview/BasicOverview';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import MediaOverview from 'city-os-common/modules/Overview/MediaOverview';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';

import { useMapContext } from '../MapProvider';

import CircleIcon from '../../assets/icon/circle.svg';
import Display from './Display';
import Lamp from './Lamp';

const useStyles = makeStyles((theme) => ({
  moreRoot: {
    gridRow: '1 / 3',
    backgroundColor: theme.palette.background.light,
  },

  tabs: {
    flex: '0 0 auto',
    paddingRight: theme.spacing(8.5),
  },

  smallSpace: {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.light,
    paddingTop: theme.spacing(2),
  },

  moreSpace: {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.light,
    paddingTop: theme.spacing(13),
  },

  closeArrow: {
    position: 'absolute',
    right: 0,
    zIndex: theme.zIndex.speedDial,

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  contentWrapper: {
    padding: theme.spacing(3),
  },

  extendedTabs: {
    marginRight: theme.spacing(8.5),
  },

  scrollButtons: {
    backgroundColor: theme.palette.background.light,
  },
}));

interface TabFlagIconProps {
  type: DeviceType;
  deviceId: string;
}

const TabFlagIcon: VoidFunctionComponent<TabFlagIconProps> = ({
  type,
  deviceId,
}: TabFlagIconProps) => {
  const deviceStatusRes = useSubscribeDevicesStatus([{ deviceId, type }]);
  return deviceStatusRes.data[0]?.status === DeviceStatus.ERROR ? <CircleIcon /> : null;
};

const Details: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { tDevice } = useDeviceTranslation();

  const [devices, setDevices] = useState<SingleDeviceResponse[]>();
  const [tabIndex, setTabIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    selectedIdList,
    showDetails,
    setShowDetails,
    showPoleMenu,
    showMore,
    setShowMore,
  } = useMapContext();

  const { data: devicesData, refetch } = useQuery<GetDeviceDetailResponse, GetDeviceDetailPayload>(
    GET_DEVICE_DETAIL,
    {
      variables: { deviceIds: Array.from(selectedIdList) },
      skip: isUpdating,
    },
  );

  const handleUpdating = useCallback((isLoading: boolean) => {
    setIsUpdating(isLoading);
  }, []);

  const handleOnSelect = useCallback((currentIndex: number): boolean => {
    setTabIndex(currentIndex);
    return true;
  }, []);

  const getTabTitles = useCallback(
    (
      deviceType: DeviceType,
      relatedDevice: RelatedDeviceResponse,
    ): {
      tabId: string;
      title: string;
      icon?: string | ReactElement;
      flagIcon?: ReactElement;
    } => ({
      title: tDevice(deviceType),
      tabId: relatedDevice.deviceId,
      icon: <DeviceIcon type={deviceType} />,
      flagIcon: <TabFlagIcon type={deviceType} deviceId={relatedDevice.deviceId} />,
    }),
    [tDevice],
  );

  const getTabContent = useCallback(
    (
      deviceType: DeviceType,
      relatedDevice: RelatedDeviceResponse,
    ): {
      panelId: string;
      content: ReactElement;
    } => {
      const { deviceId } = relatedDevice;
      const shownSensors = tableSensorIds[relatedDevice.type];
      let panelContent: ReactElement;
      switch (deviceType) {
        case DeviceType.DISPLAY:
          panelContent = <Display device={relatedDevice} />;
          break;
        case DeviceType.CAMERA:
          panelContent = (
            <MediaOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              subscribeSensorIds={subscribeSensorIds[deviceType]}
              overviewSensors={shownSensors}
              reverseRowColor
              shrink={showPoleMenu}
            />
          );
          break;
        default:
          panelContent = (
            <BasicOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              shownSensors={tableSensorIds[deviceType]}
              shrink={showPoleMenu}
            />
          );
      }
      return {
        panelId: deviceId,
        content: (
          <div key={deviceId} className={classes.contentWrapper}>
            {panelContent}
          </div>
        ),
      };
    },
    [classes.contentWrapper, showPoleMenu, tDevice],
  );

  const tabTitles = useMemo<ComponentProps<typeof TabPanelSet>['tabTitles']>(() => {
    if (devices) {
      const lampTab = {
        title: tDevice(DeviceType.LAMP),
        tabId: devices[0].deviceId,
        icon: <DeviceIcon type={DeviceType.LAMP} />,
        flagIcon: <TabFlagIcon type={DeviceType.LAMP} deviceId={devices[0].deviceId} />,
      };

      if (devices.length === 1 && devices[0].related) {
        return [
          lampTab,
          ...devices[0].related.map((relatedDevice) =>
            getTabTitles(relatedDevice.type, relatedDevice),
          ),
        ];
      }
      return [lampTab];
    }
    return [];
  }, [devices, tDevice, getTabTitles]);

  const tabContents = useMemo(() => {
    if (devices) {
      const lampContent = {
        panelId: devices[0].deviceId,
        content: <Lamp devices={devices} onChanged={refetch} onUpdating={handleUpdating} />,
      };

      if (devices.length === 1 && devices[0].related) {
        return [
          lampContent,
          ...devices[0].related.map((relatedDevice) =>
            getTabContent(relatedDevice.type, relatedDevice),
          ),
        ];
      }
      return [lampContent];
    }
    return [];
  }, [devices, getTabContent, handleUpdating, refetch]);

  const tabContent = useMemo<ReactNode>(
    () =>
      tabContents.find((panel) => panel?.panelId === tabTitles[tabIndex].tabId)?.content || null,
    [tabContents, tabIndex, tabTitles],
  );

  useEffect(() => {
    if (devicesData) {
      setDevices(devicesData.getDevices);
    }
  }, [devicesData]);

  useEffect(() => {
    setTabIndex(0);
  }, [selectedIdList]);

  return (
    <>
      <ExtendablePanel
        size={showMore ? 'auto' : 'min(560px, calc(var(--vh) * 70))'}
        direction="bottom"
        open={showDetails}
        onToggle={(newShowDetails: boolean) => setShowDetails(newShowDetails)}
        PaperProps={{
          className: clsx({
            [classes.smallSpace]: showMore && showPoleMenu,
            [classes.moreSpace]: showMore && !showPoleMenu,
          }),
        }}
        classes={
          showMore
            ? {
                root: classes.moreRoot,
              }
            : undefined
        }
      >
        {showMore && (
          <IconButton
            className={classes.closeArrow}
            onClick={() => setShowMore(false)}
            disableRipple
            disableFocusRipple
          >
            <ArrowDownwardIcon color="primary" fontSize="large" />
          </IconButton>
        )}
        <TabPanelSet
          tabSize="small"
          rounded={false}
          tabTitles={tabTitles}
          index={tabIndex}
          classes={{
            root: showMore ? classes.extendedTabs : undefined,
            scrollButtons: classes.scrollButtons,
          }}
          onSelect={handleOnSelect}
        >
          {tabContent}
        </TabPanelSet>
      </ExtendablePanel>
    </>
  );
};

export default Details;
