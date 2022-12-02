import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId, SensorType } from 'city-os-common/libs/schema';
import { isNumber } from 'city-os-common/libs/validators';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import {
  ConfigFormType,
  ExtremeOperation,
  GadgetConfig,
  GadgetDeviceInfo,
} from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import {
  SubscribeExtremeValuePayload,
  SubscribeExtremeValueResponse,
  getExtremeSensorValue,
} from '../../../api/subscribeExtremeValue';
import { getAqiInfo } from '../../../libs/utils';
import { resubscribeInterval } from '../../../libs/constants';
import useAqiTranslation from '../../../hooks/useAqiLevelTranslation';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useResubscribeableSubscription from '../../../hooks/useResubscribeableSubscription';

import ExtremeAqiDivisionConfig from './ExtremeAqiDivisionConfig';
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

  nameWrapper: {
    overflow: 'hidden',
  },

  title: {
    paddingRight: theme.spacing(1),
  },

  values: {
    flex: 1,
    padding: theme.spacing(0, 1),
  },

  value: {
    lineHeight: 1,
    color: theme.palette.gadget.value,
    fontWeight: theme.typography.h6.fontWeight,
  },
}));

interface ExtremeAqiDivisionProps {
  config: GadgetConfig<ConfigFormType.DIVISION_ONLY>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_ONLY>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_ONLY>) => void;
}

const ExtremeAqiDivision: VoidFunctionComponent<ExtremeAqiDivisionProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: ExtremeAqiDivisionProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const { tAqi } = useAqiTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { groupId },
  } = config;
  const {
    userProfile: { joinedGroups },
  } = useStore();

  const [updateTime, setUpdateTime] = useState(new Date());
  const [deviceId, setDeviceId] = useState('');

  // resubscribe on division-related gadget in case of devices change
  const {
    loading: extremeValueLoading,
    error: extremeValueError,
    resubscribe,
  } = useResubscribeableSubscription<
    SubscribeExtremeValueResponse<SensorType.GAUGE>,
    SubscribeExtremeValuePayload
  >(getExtremeSensorValue(SensorType.GAUGE), {
    variables: {
      groupId: groupId || '',
      deviceType: DeviceType.ENVIRONMENT,
      sensorId: SensorId.ENV_PM2_5,
      option: { operation: ExtremeOperation.MAX },
    },
    skip: !groupId,
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      setDeviceId(data?.extremeValueChanged?.response.deviceId || '');
      setUpdateTime(new Date());
    },
  });

  const { data, loading, error: getDevicesError } = useQuery<
    GetDevicesOnDashboardResponse,
    GetDevicesOnDashboardPayload
  >(GET_DEVICES_ON_DASHBOARD, {
    skip: !deviceId,
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

  const groupName = useMemo(() => joinedGroups?.find(({ id }) => id === groupId)?.name, [
    groupId,
    joinedGroups,
  ]);

  const pm25Concentration = useMemo(() => {
    if (!sensorValues?.[deviceId]) return null;
    const value = sensorValues[deviceId]?.[SensorId.ENV_PM2_5]?.value;
    return isNumber(value) ? value : null;
  }, [deviceId, sensorValues]);

  const aqiInfo = useMemo(() => getAqiInfo(theme, pm25Concentration), [pm25Concentration, theme]);

  const humidity = getSensorText(SensorId.ENV_HUMIDITY);
  const temperature = getSensorText(SensorId.ENV_TEMPERATURE);

  const isForbidden = useMemo(
    () =>
      [
        getDevicesError,
        extremeValueError,
        sensorValues?.[deviceId]?.[SensorId.ENV_PM2_5]?.error,
      ].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [deviceId, extremeValueError, getDevicesError, sensorValues],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      resubscribe();
    }, resubscribeInterval);
    return () => {
      window.clearInterval(timer);
    };
  }, [resubscribe]);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this division_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={ExtremeAqiDivisionConfig}
    >
      {loading || extremeValueLoading ? (
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
            <Grid item container>
              <Grid item container wrap="nowrap" alignItems="center">
                <Grid item>
                  <Typography variant="h6" noWrap className={classes.title}>
                    {`${t('column:PM2_5')} |`}
                  </Typography>
                </Grid>
                <Grid item className={classes.nameWrapper}>
                  <OverflowTooltip title={groupName || ''}>
                    <Typography variant="body1" noWrap>
                      {groupName || '---'}
                    </Typography>
                  </OverflowTooltip>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <OverflowTooltip title={devices[0]?.name || deviceId}>
                  <Typography variant="body1" noWrap>
                    {devices[0]?.name || deviceId}
                  </Typography>
                </OverflowTooltip>
              </Grid>
            </Grid>
            <Divider />
            <Grid item container direction="column" justify="center" className={classes.values}>
              <Grid item container justify="space-between" alignItems="center">
                <Typography variant="caption" gutterBottom>
                  {t('column:Temperature')}
                </Typography>
                <Typography variant="body1" gutterBottom className={classes.value}>
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

export default memo(ExtremeAqiDivision);
