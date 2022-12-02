import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import { isNumber } from 'city-os-common/libs/validators';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import { getAqiInfo } from '../../../libs/utils';
import useAqiTranslation from '../../../hooks/useAqiLevelTranslation';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import AqiMonitorConfig from './AqiMonitorConfig';
import GadgetBase from '../GadgetBase';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: 0,
    width: '100%',

    '& > .MuiGrid-item': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  loading: {
    height: '100%',
  },

  circle: {
    borderRadius: '50%',
    padding: theme.spacing(2, 0),
  },

  label: {
    padding: theme.spacing(0, 1),
    color: theme.palette.primary.contrastText,
  },

  value: {
    lineHeight: 1,
    color: theme.palette.gadget.value,
    fontWeight: theme.typography.h6.fontWeight,
  },
}));

interface AqiMonitorProps {
  config: GadgetConfig<ConfigFormType.DEVICE_ONLY>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
}

const AqiMonitor: VoidFunctionComponent<AqiMonitorProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onDuplicate,
  onUpdate,
}: AqiMonitorProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const { tAqi } = useAqiTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { deviceId },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>();

  const { data, loading, error: getDevicesError } = useQuery<
    GetDevicesOnDashboardResponse,
    GetDevicesOnDashboardPayload
  >(GET_DEVICES_ON_DASHBOARD, {
    variables: {
      deviceIds: [deviceId],
    },
  });

  const devices = useMemo<GadgetDeviceInfo[]>(
    () =>
      data?.getDevices?.map(({ deviceId: getDeviceId, name, sensors, groups }) => ({
        deviceId: getDeviceId,
        name,
        sensors,
        groups,
      })) || [],
    [data?.getDevices],
  );

  const showableSensors = useMemo(() => {
    const sensors = devices[0]?.sensors;
    const ownSensorIds = new Set(sensors ? sensors.map(({ sensorId }) => sensorId) : []);
    const subscribeSensorsList = subscribeSensorIds[DeviceType.ENVIRONMENT].filter((id) =>
      ownSensorIds.has(id),
    );
    return new Set(subscribeSensorsList);
  }, [devices]);

  const sensorValues = useSubscribeSensors(devices, showableSensors);

  const getSensorText = useCallback(
    (id: SensorId) => {
      const sensors = devices[0]?.sensors;
      if (!sensorValues?.[deviceId]) return '---';
      const value = sensorValues[deviceId]?.[id]?.value?.toString() || '---';
      const unit = sensors?.find(({ sensorId }) => sensorId === id)?.unit || '';
      return `${value}${unit}`;
    },
    [deviceId, devices, sensorValues],
  );

  const pm25Concentration = useMemo(() => {
    if (!sensorValues?.[deviceId]) return null;
    const value = sensorValues[deviceId]?.[SensorId.ENV_PM2_5]?.value;
    const time = sensorValues[deviceId]?.[SensorId.ENV_PM2_5]?.time;
    if (time) setUpdateTime(new Date(time));
    return isNumber(value) ? value : null;
  }, [deviceId, sensorValues]);

  const aqiInfo = useMemo(() => getAqiInfo(theme, pm25Concentration), [pm25Concentration, theme]);

  const isForbidden = useMemo(
    () =>
      [getDevicesError, sensorValues?.[deviceId]?.[SensorId.ENV_PM2_5]?.error].some((err) =>
        isGqlError(err, ErrorCode.FORBIDDEN),
      ),
    [deviceId, getDevicesError, sensorValues],
  );

  const humidity = getSensorText(SensorId.ENV_HUMIDITY);
  const temperature = getSensorText(SensorId.ENV_TEMPERATURE);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onUpdate={onUpdate}
      ConfigComponent={AqiMonitorConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container className={classes.container} spacing={4}>
          <Grid item xs={5}>
            <AspectRatio ratio={1}>
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                wrap="nowrap"
                className={classes.circle}
                style={{ backgroundColor: aqiInfo.color }}
              >
                <Typography variant="caption" className={classes.label}>
                  {t('column:PM2_5')}
                </Typography>
                <Typography
                  variant="h1"
                  className={classes.label}
                  style={{
                    fontSize: pm25Concentration && pm25Concentration > 99 ? 32 : 40,
                  }}
                >
                  {pm25Concentration || '---'}
                </Typography>
                <Typography variant="caption" align="center" className={classes.label}>
                  {aqiInfo.index === 'UNKNOWN' ? '---' : tAqi(aqiInfo.index)}
                </Typography>
              </Grid>
            </AspectRatio>
          </Grid>
          <Grid item xs={7} container direction="column" spacing={1} justify="space-around">
            <Grid item container alignContent="center">
              <Typography variant="h6" gutterBottom>
                {t('column:PM2_5 (Now)')}
              </Typography>
              <OverflowTooltip title={devices[0]?.name || deviceId}>
                <Typography variant="body1" noWrap>
                  {devices[0]?.name || deviceId}
                </Typography>
              </OverflowTooltip>
            </Grid>
            <Divider />
            <Grid item container spacing={1} alignContent="center">
              <Grid item container justify="space-between" alignItems="center">
                <Typography variant="caption">{t('column:Temperature')}</Typography>
                <Typography variant="body1" className={classes.value}>
                  {temperature}
                </Typography>
              </Grid>
              <Grid item container justify="space-between" alignItems="center">
                <Typography variant="caption">{t('column:Humidity')}</Typography>
                <Typography variant="body1" className={classes.value}>
                  {humidity}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(AqiMonitor);
