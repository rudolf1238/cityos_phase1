import { makeStyles } from '@material-ui/core/styles';
import { useQuery, useSubscription } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
// import lodash from 'lodash';

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { SensorId, SensorType } from 'city-os-common/libs/schema';
import { minOfDay, minOfHour, msOfDay, msOfWeek } from 'city-os-common/libs/constants';
import ErrorCode from 'city-os-common/libs/errorCode';
import getSensorValueChanged, {
  SubscribeValueChangedPayload,
  SubscribeValueChangedResponse,
} from 'city-os-common/api/getSensorValueChanged';
import isGqlError from 'city-os-common/libs/isGqlError';

import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { ConfigFormType, Curve, Duration, GadgetConfig, GadgetSize } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import {
  SENSOR_VALUES_AVG_HISTORY,
  SensorValuesAvgHistoryPayload,
  SensorValuesAvgHistoryResponse,
} from '../../../api/sensorValuesAvgHistory';
import {
  SENSOR_VALUES_METRIC_AGGREGATION,
  SensorValuesMetricAggregationPayload,
  SensorValuesMetricAggregationResponse,
} from '../../../api/sensorValuesMetricAggregation';
import { getCurve, roundUpNow } from '../../../libs/utils';

import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import IndoorTemperatureConfig from './IndoorTemperatureConfig';
import IndoorTemperatureIcon from '../../../assets/icon/gadget-indoor-temperature.svg';
import LineCharts from '../../LineCharts';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    minHeight: 0,
  },

  gridContainer: {
    margin: 0,
    width: '100%',
    overflow: 'hidden',
  },

  item: {
    width: '100%',
    minWidth: 0,
  },

  squareItem: {
    height: '50%',
  },

  rectangleItem: {
    height: '100%',
  },

  avatar: {
    backgroundColor: theme.palette.background.light,
    width: 56,
    height: 56,
    color: theme.palette.info.main,
  },

  textWrapper: {
    gap: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  subtitle: {
    marginBottom: 0,
    color: theme.palette.grey[600],
    fontSize: theme.typography.pxToRem(12),
  },

  text: {
    width: '100%',
  },

  revenue: {
    color: theme.palette.gadget.indoorTemperature,
  },

  values: {
    paddingTop: 0,
  },

  value: {
    paddingRight: theme.spacing(1),
    color: theme.palette.gadget.value,
  },

  loading: {
    padding: theme.spacing(1, 1, 0, 0),
  },
}));

const updateInterval = 60_000;

interface IndoorTemperatureProps {
  config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
}

const IndoorTemperature: VoidFunctionComponent<IndoorTemperatureProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: IndoorTemperatureProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    id,
    setting: { deviceId, duration, size },
  } = config;
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [curve, setCurve] = useState<Curve>();
  const [pastCurve, setPastCurve] = useState<Curve>();
  const [updateTime, setUpdateTime] = useState(new Date());

  const timeInRange = duration === Duration.WEEK ? msOfWeek : msOfDay;
  const interval = duration === Duration.DAY ? minOfHour / 4 : minOfDay / 24;

  const { data: getDevicesData, loading: getDevicesLoading, error: getDevicesError } = useQuery<
    GetDevicesOnDashboardResponse,
    GetDevicesOnDashboardPayload
  >(GET_DEVICES_ON_DASHBOARD, {
    variables: {
      deviceIds: [deviceId],
    },
  });

  const { loading, error: currentError } = useQuery<
    SensorValuesAvgHistoryResponse,
    SensorValuesAvgHistoryPayload
  >(SENSOR_VALUES_AVG_HISTORY, {
    variables: {
      deviceId,
      sensorId: SensorId.BANPU_INDOOR_METER_TEMPERATURE,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setCurve(getCurve(id, data.sensorValuesAvgHistory, 'indoorTemperature'));
      setUpdateTime(new Date());
    },
    onError: () => {
      setCurve({
        key: id,
        points: [],
      });
    },
  });

  const { loading: pastLoading, error: pastError } = useQuery<
    SensorValuesAvgHistoryResponse,
    SensorValuesAvgHistoryPayload
  >(SENSOR_VALUES_AVG_HISTORY, {
    variables: {
      deviceId,
      sensorId: SensorId.BANPU_INDOOR_METER_TEMPERATURE,
      start: new Date(endTime - timeInRange - timeInRange),
      end: new Date(endTime - timeInRange - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setPastCurve(getCurve(`past-${id}`, data.sensorValuesAvgHistory, 'notInService'));
    },
    onError: () => {
      setPastCurve({
        key: `past-${id}`,
        points: [],
      });
    },
  });

  const { data: subscribeData, loading: revenueLoading } = useSubscription<
    SubscribeValueChangedResponse<SensorType.GAUGE>,
    SubscribeValueChangedPayload
  >(getSensorValueChanged(SensorType.GAUGE), {
    variables: { deviceId, sensorId: SensorId.BANPU_INDOOR_METER_TEMPERATURE },
  });

  const deviceName = getDevicesData?.getDevices?.[0]?.name;

  const currentValue =
    subscribeData?.sensorValueChanged.data.value !== undefined
      ? subscribeData.sensorValueChanged.data.value.toLocaleString('en-US')
      : '---';

  const isForbidden = useMemo(
    () =>
      [getDevicesError, currentError, pastError].some((err) =>
        isGqlError(err, ErrorCode.FORBIDDEN),
      ),
    [currentError, getDevicesError, pastError],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndTime(roundUpNow(duration));
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, [duration]);

  const curves = useMemo(() => (curve ? [curve] : []), [curve]);

  const [minDataValue, setMinDataValue] = useState<number>(0);
  const [maxDataValue, setMaxDataValue] = useState<number>(0);
  const [avgDataValue, setAvgDataValue] = useState<number>(0);

  useQuery<SensorValuesMetricAggregationResponse, SensorValuesMetricAggregationPayload>(
    SENSOR_VALUES_METRIC_AGGREGATION,
    {
      variables: {
        deviceId,
        sensorId: SensorId.BANPU_INDOOR_METER_TEMPERATURE,
        // start: new Date(endTime - msOfHour * 2 + (duration === Duration.WEEK ? -msOfHour * 10 : 0)),
        // end: new Date(endTime + (duration === Duration.WEEK ? -msOfHour * 10 + msOfHour : 0)),
        start: new Date(endTime - timeInRange),
        end: new Date(endTime - 1),
      },
      onCompleted: (data) => {
        if (data.sensorValuesMetricAggregation !== undefined) {
          setMinDataValue(data.sensorValuesMetricAggregation.min);
          setMaxDataValue(data.sensorValuesMetricAggregation.max);
          setAvgDataValue(Math.round(data.sensorValuesMetricAggregation.avg));
        }
      },
    },
  );

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={IndoorTemperatureConfig}
    >
      {!curve && (loading || pastLoading || getDevicesLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
          className={classes.root}
        >
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            container
            spacing={1}
            alignItems="center"
            className={clsx(
              classes.gridContainer,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
          >
            <Grid item xs={2} container justify="center" alignItems="center" wrap="nowrap">
              <Avatar className={classes.avatar}>
                <IndoorTemperatureIcon width={24} height={24} />
              </Avatar>
            </Grid>
            <Grid item xs={5} container direction="column" className={classes.textWrapper}>
              <Typography variant="subtitle1" noWrap className={classes.text}>
                {`${t('dashboard:Temperature')} (${t('dashboard:Now')})`}
              </Typography>
              <OverflowTooltip title={deviceName || ''}>
                <Typography variant="caption" noWrap className={classes.text}>
                  {deviceName}
                </Typography>
              </OverflowTooltip>
            </Grid>
            <Grid item xs={5} container>
              <Grid item xs={12} container justify="flex-end">
                {revenueLoading ? (
                  <div className={classes.loading}>
                    <CircularProgress size={24} />
                  </div>
                ) : (
                  <Typography variant="h4" className={classes.revenue}>
                    {currentValue}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography align="right" className={classes.subtitle}>
                  {`${t('dashboard:TEMPERATURE_C')} / `}
                  <span style={{ fontWeight: 600 }}>{t('dashboard:Room Temperature')}</span>
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid
              item
              xs={12}
              container
              spacing={1}
              className={clsx(classes.gridContainer, classes.values)}
            >
              <Grid
                item
                xs={4}
                container
                alignContent="center"
                direction="column"
                style={{ gap: '0.25rem' }}
              >
                <span style={{ fontWeight: 600 }}>{t('dashboard:Min')}</span>
                <span>
                  {minDataValue} {t('dashboard:TEMPERATURE_C')}
                </span>
              </Grid>
              <Grid
                item
                xs={4}
                container
                alignContent="center"
                direction="column"
                alignItems="center"
                style={{ gap: '0.25rem' }}
              >
                <span style={{ fontWeight: 600 }}>{t('dashboard:Max')}</span>
                <span>
                  {maxDataValue} {t('dashboard:TEMPERATURE_C')}
                </span>
              </Grid>
              <Grid
                item
                xs={4}
                container
                alignContent="center"
                direction="column"
                alignItems="flex-end"
                style={{ gap: '0.25rem' }}
              >
                <span style={{ fontWeight: 600 }}>{t('dashboard:Avg')}</span>
                <span>
                  {avgDataValue} {t('dashboard:TEMPERATURE_C')}
                </span>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            className={clsx(
              classes.item,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
          >
            <span
              style={{
                position: 'absolute',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.26)',
                top: size === GadgetSize.SQUARE ? '19.75em' : '4em',
              }}
            >
              Temp. ({t('dashboard:TEMPERATURE_C')})
            </span>
            <LineCharts
              start={endTime - (duration === Duration.WEEK ? msOfWeek - msOfDay : msOfDay)}
              curves={curves}
              pastCurve={pastCurve}
              duration={duration}
              valueParser={(value) =>
                `${value.toLocaleString('en-US')} ${t('dashboard:TEMPERATURE_C')}`
              }
              labelType="default"
            />
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(IndoorTemperature);
