import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import { isGender } from 'city-os-common/libs/validators';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useCHTSnapshot from 'city-os-common/hooks/useCHTSnapshot';
import useGenderTranslation from 'city-os-common/hooks/useGenderTranslation';
import useSensorIdTranslation from 'city-os-common/hooks/useSensorIdTranslation';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import HumanShapeConfig from './HumanShapeConfig';

const useStyles = makeStyles((theme) => ({
  loading: {
    height: '100%',
  },

  gridContainer: {
    flex: 1,
    margin: 0,
    width: '100%',
    minHeight: 0,
  },

  imgWrapper: {
    maxHeight: '100%',
  },

  img: {
    margin: 'auto',
    borderRadius: theme.shape.borderRadius,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },

  name: {
    width: '100%',
  },

  sensorText: {
    color: theme.palette.gadget.value,
  },
}));

interface HumanShapeProps {
  config: GadgetConfig<ConfigFormType.DEVICE_ONLY>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
}

const HumanShape: VoidFunctionComponent<HumanShapeProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: HumanShapeProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');
  const { tGender } = useGenderTranslation();
  const { tSensorId } = useSensorIdTranslation();
  const {
    setting: { deviceId },
  } = config;

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
    const subscribeSensorsList = subscribeSensorIds[DeviceType.CAMERA].filter((sensorId) =>
      ownSensorIds.has(sensorId),
    );
    return new Set(subscribeSensorsList);
  }, [devices]);

  const sensorValues = useSubscribeSensors(devices, showableSensors);

  const sensorText = useMemo(() => {
    if (!sensorValues?.[deviceId]) return '---';
    const genderValue =
      sensorValues[deviceId]?.[SensorId.CAMERA_GENDER]?.value?.toString() || '---';
    const gender = isGender(genderValue) ? tGender(genderValue) : genderValue;
    const clothesColor =
      sensorValues[deviceId]?.[SensorId.CAMERA_CLOTHES_COLOR]?.value?.toString() || '---';
    return [gender, clothesColor].filter((item) => item.trim().length > 0).join('/ ');
  }, [sensorValues, deviceId, tGender]);

  const updateTime = useMemo(() => {
    if (!sensorValues?.[deviceId]) return undefined;
    const currUpdateTime = Object.values(sensorValues[deviceId]).reduce<number>(
      (max, curr) => (curr?.time ? Math.max(max, curr.time) : max),
      0,
    );
    return new Date(currUpdateTime);
  }, [sensorValues, deviceId]);

  const imgURL = useMemo(() => {
    const sensorValuesById = sensorValues?.[deviceId];
    if (sensorValuesById?.[SensorId.CAMERA_PEDESTRIAN])
      return sensorValuesById[SensorId.CAMERA_PEDESTRIAN]?.value?.toString();
    return undefined;
  }, [deviceId, sensorValues]);

  const isForbidden = useMemo(
    () =>
      isGqlError(getDevicesError, ErrorCode.FORBIDDEN) ||
      !!(
        sensorValues?.[deviceId] &&
        Object.values(sensorValues[deviceId]).some((sensor) =>
          isGqlError(sensor?.error, ErrorCode.FORBIDDEN),
        )
      ),
    [deviceId, getDevicesError, sensorValues],
  );

  const imgSrc = useCHTSnapshot(devices[0]?.groups[0]?.projectKey, imgURL);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={HumanShapeConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={2} className={classes.gridContainer}>
          <Grid item xs={6} container className={classes.imgWrapper}>
            {imgSrc && (
              <img
                src={imgSrc}
                className={classes.img}
                alt={tSensorId(SensorId.CAMERA_PEDESTRIAN)}
              />
            )}
          </Grid>
          <Grid item xs={6} container direction="column" justify="center">
            <OverflowTooltip title={devices[0]?.name || deviceId}>
              <Typography variant="body2" color="textSecondary" noWrap className={classes.name}>
                {devices[0]?.name || deviceId}
              </Typography>
            </OverflowTooltip>
            <Typography variant="h6" className={classes.sensorText}>
              {sensorText}
            </Typography>
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(HumanShape);
