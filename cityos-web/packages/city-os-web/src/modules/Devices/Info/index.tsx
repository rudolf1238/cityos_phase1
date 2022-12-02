import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { Action, DeviceStatus, DeviceType, Subject } from 'city-os-common/libs/schema';
import { subscribeSensorIds, tableSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useSubscribeDevicesStatus, {
  SubscribeDevice,
} from 'city-os-common/hooks/useSubscribeDevicesStatus';

import BasicOverview from 'city-os-common/modules/Overview/BasicOverview';
import Guard from 'city-os-common/modules/Guard';
import MediaOverview from 'city-os-common/modules/Overview/MediaOverview';

import { PartialDevice } from '../../../api/getDeviceOnDeviceDetail';
import useWebTranslation from '../../../hooks/useWebTranslation';

import EditDevice from './EditDevice';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(6),
  },

  realtime: {
    width: '100%',
    maxWidth: theme.spacing(130),

    '& > h6': {
      padding: theme.spacing(0.5, 0),
    },
  },

  overview: {
    marginTop: theme.spacing(3),
    overflow: 'auto',
  },
}));

interface InfoProps {
  deviceData?: PartialDevice;
}

const Info: FunctionComponent<InfoProps> = ({ deviceData }: InfoProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation('device');
  const { tDevice } = useDeviceTranslation();

  const subscribeDeviceList = useMemo<SubscribeDevice[]>(
    () =>
      deviceData
        ? [
            {
              deviceId: deviceData.deviceId,
              type: deviceData.type,
            },
          ]
        : [],
    [deviceData],
  );

  const deviceStatusList = useSubscribeDevicesStatus(subscribeDeviceList);

  const deviceName = useMemo(() => {
    if (!deviceData) return '';
    return tDevice(deviceData.type);
  }, [deviceData, tDevice]);

  const deviceInfo = useMemo<PartialDevice | null>(() => {
    if (!deviceData) return null;
    return {
      ...deviceData,
      status:
        deviceStatusList.data.find((device) => device.deviceId === deviceData.deviceId)?.status ||
        DeviceStatus.ERROR,
    };
  }, [deviceData, deviceStatusList]);

  const getContent = useCallback(
    (deviceType: DeviceType) => {
      if (!deviceInfo) return null;
      const shownSensors = tableSensorIds[deviceInfo.type];
      if (deviceType === DeviceType.CAMERA || deviceType === DeviceType.DISPLAY) {
        return (
          <MediaOverview
            name={deviceName}
            device={deviceInfo}
            subscribeSensorIds={subscribeSensorIds[deviceType]}
            overviewSensors={shownSensors}
            disableHeader
          />
        );
      }
      return (
        <BasicOverview
          name={deviceName}
          device={deviceInfo}
          shownSensors={shownSensors}
          disableHeader
          reverseRowColor
        />
      );
    },
    [deviceInfo, deviceName],
  );

  return (
    <div className={classes.root}>
      <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={<EditDevice />}>
        <EditDevice enableModify />
      </Guard>
      <div className={classes.realtime}>
        <Typography variant="subtitle2" align="left">
          {t('Realtime')}
        </Typography>
        <Divider orientation="horizontal" />
        <div className={classes.overview}>{deviceInfo && getContent(deviceInfo.type)}</div>
      </div>
    </div>
  );
};

export default Info;
