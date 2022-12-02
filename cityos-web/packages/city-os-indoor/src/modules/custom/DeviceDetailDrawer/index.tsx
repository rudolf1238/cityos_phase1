import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import React, {
  ComponentProps,
  ReactElement,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { DeviceType } from 'city-os-common/libs/schema';
import {
  GET_DEVICE_DETAIL,
  GetDeviceDetailPayload,
  GetDeviceDetailResponse,
  RelatedDeviceResponse,
  SingleDeviceResponse,
} from 'city-os-common/api/getMapDevices';
import { subscribeSensorIds, tableSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import BasicOverview from 'city-os-common/modules/Overview/BasicOverview';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import Img from 'city-os-common/modules/Img';
import IndoorLampOverview from 'city-os-common/src/modules/Overview/IndoorLampOverview';
import LampOverview from 'city-os-common/src/modules/Overview/LampOverview';
import MediaOverview from 'city-os-common/modules/Overview/MediaOverview';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';

import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import { useViewerPageContext } from '../../ViewerPageProvider';
import ExecuteLogTab from './Tabs/ExecuteLogTab';
import ScheduleTab from './Tabs/ScheduleTab';
import TimelineTab from './Tabs/TimelineTab';

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
    width: '100%',
    height: '100%',
  },

  scrollButtons: {
    backgroundColor: theme.palette.background.light,
  },

  contentWrapper: {
    padding: theme.spacing(1, 3, 0, 3),
  },

  imageContentWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(3),
  },

  image: {
    borderRadius: theme.spacing(1),
    width: theme.spacing(30),
    height: theme.spacing(30),
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
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
}));

interface DeviceDetailDrawerProps {
  open?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const DeviceDetailDrawer: VoidFunctionComponent<DeviceDetailDrawerProps> = ({
  open = false,
  onToggle = () => {},
}: DeviceDetailDrawerProps) => {
  const classes = useStyles();
  const { t } = useIndoorTranslation('indoor');
  const { tDevice } = useDeviceTranslation();
  // const isMountedRef = useIsMountedRef();
  const { activeId, selectedIdList } = useViewerPageContext();

  const [deviceDetail, setDeviceDetail] = useState<SingleDeviceResponse>();
  const [tabIndex, setTabIndex] = useState<number>(0);

  useEffect(() => {
    setTabIndex(0);
  }, [selectedIdList]);

  const { data: devicesData } = useQuery<GetDeviceDetailResponse, GetDeviceDetailPayload>(
    GET_DEVICE_DETAIL,
    {
      variables: { deviceIds: [activeId || ''] }, // skip 避免 activeId 為空時 refetch
      skip: activeId === null,
    },
  );

  const handleOnSelect = useCallback((currentIndex: number): boolean => {
    setTabIndex(currentIndex);
    return true;
  }, []);

  useEffect(() => {
    if (devicesData?.getDevices) {
      setDeviceDetail(devicesData.getDevices[0]);
    }
  }, [devicesData]);

  const getInfoTabContent = useCallback(
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
        // // 看板先不用特殊頁面，畢竟還沒串上 CMS
        // case DeviceType.DISPLAY:
        //   panelContent = <Display device={relatedDevice} />;
        //   break;
        case DeviceType.CAMERA:
          panelContent = (
            <MediaOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              subscribeSensorIds={subscribeSensorIds[deviceType]}
              overviewSensors={shownSensors}
              reverseRowColor
            />
          );
          break;
        case DeviceType.LAMP:
          panelContent = (
            <LampOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              shownSensors={tableSensorIds[deviceType]}
            />
          );
          break;
        case DeviceType.INDOOR_LAMP:
          panelContent = (
            <IndoorLampOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              shownSensors={tableSensorIds[deviceType]}
            />
          );
          break;
        default:
          panelContent = (
            <BasicOverview
              name={tDevice(deviceType)}
              device={relatedDevice}
              shownSensors={tableSensorIds[deviceType]}
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
    [classes.contentWrapper, tDevice],
  );

  const getImageTabContent = useCallback(
    (relatedDevice: RelatedDeviceResponse): ReactElement => (
      <div className={clsx(classes.contentWrapper, classes.imageContentWrapper)}>
        {(relatedDevice.imageIds || []).map((imageId) => (
          <Img id={imageId} className={classes.image} />
        ))}
      </div>
    ),
    [classes.contentWrapper, classes.image, classes.imageContentWrapper],
  );

  const getTimelineTabContent = useCallback(
    (singleDevice: SingleDeviceResponse): ReactElement => (
      <TimelineTab singleDevice={singleDevice} />
    ),
    [],
  );

  const tabList = useMemo<
    { title: ComponentProps<typeof TabPanelSet>['tabTitles'][0]; content: React.ReactNode }[]
  >(() => {
    const baseTabPane = [
      {
        title: {
          title: t('indoor:Info'),
        },
        content: deviceDetail
          ? getInfoTabContent(deviceDetail?.type || DeviceType.UNKNOWN, deviceDetail).content
          : null,
      },
      {
        title: {
          title: t('indoor:Timeline'),
        },
        content: deviceDetail ? getTimelineTabContent(deviceDetail) : null,
      },
      {
        title: {
          title: t('indoor:Image'),
        },
        content: deviceDetail ? getImageTabContent(deviceDetail) : null,
      },
    ];
    if (deviceDetail?.type === DeviceType.CHILLER) {
      baseTabPane.push(
        {
          title: {
            title: 'Schedule',
          },
          content: <ScheduleTab />,
        },
        {
          title: {
            title: 'Execution history',
          },
          content: <ExecuteLogTab />,
        },
      );
    }
    return baseTabPane;
  }, [deviceDetail, getImageTabContent, getInfoTabContent, getTimelineTabContent, t]);

  useEffect(() => {
    if (tabIndex >= tabList.length) {
      // 避免 tabIndex 超過 tabList 的長度
      setTabIndex(0);
    }
  }, [tabIndex, tabList.length, deviceDetail]);

  const getTabListContent = useCallback(() => {
    const { content } = tabList[tabIndex] || { content: null }; // 因為有些 tab 數量依據設備類型有些不同，超出範圍要回傳 null 避免錯誤
    return content;
  }, [tabIndex, tabList]);

  const [showMore, setShowMore] = useState<boolean>(false);
  const [hiddenShowMore, setHiddenShowMore] = useState<boolean>(open);

  useEffect(() => {
    setHiddenShowMore(open);
  }, [open]);

  return (
    <div className={classes.selectedMenu}>
      <ExtendablePanel
        size={showMore ? 'calc(100vh - 175px)' : 'min(560px, calc(var(--vh) * 52))'} // TODO: 暫時不處理 RDW 的問題，先完成能伸縮的 drawer
        direction="bottom"
        open={open}
        onToggle={(value: boolean) => {
          onToggle(value);
          setHiddenShowMore(value);
        }}
      >
        {hiddenShowMore && (
          <IconButton
            className={classes.closeArrow}
            onClick={() => setShowMore(!showMore)}
            disableRipple
            disableFocusRipple
          >
            {showMore ? (
              <KeyboardArrowDownIcon color="primary" fontSize="large" />
            ) : (
              <KeyboardArrowUpIcon color="primary" fontSize="large" />
            )}
          </IconButton>
        )}

        <TabPanelSet
          tabSize="small"
          rounded={false}
          tabTitles={tabList.map((item) => item.title)}
          index={tabIndex}
          classes={{
            scrollButtons: classes.scrollButtons,
          }}
          onSelect={handleOnSelect}
        >
          {getTabListContent()}
        </TabPanelSet>
      </ExtendablePanel>
    </div>
  );
};

export default memo(DeviceDetailDrawer);
