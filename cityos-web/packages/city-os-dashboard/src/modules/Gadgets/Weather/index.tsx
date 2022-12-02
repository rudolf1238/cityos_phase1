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

import clsx from 'clsx';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import { DeviceType } from 'city-os-common/libs/schema';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import {
  ConfigFormType,
  GadgetConfig,
  GadgetDeviceInfo,
  GadgetSize,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherConditionTime,
} from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import { isWeatherConditionCode, isWeatherConditionTime } from '../../../libs/validators';
import { weatherConditionInfo, weatherWindDirectionInfoList } from './weatherInfo';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import HumidityIcon from '../../../assets/icon/humidity.svg';
import UnknownWeatherIcon from '../../../assets/icon/weather/unknown.svg';
import UvIcon from '../../../assets/icon/uv.svg';
import WeatherChart, { WeatherUnit } from '../../WeatherChart';
import WeatherConfig from './WeatherConfig';
import WindDirection0 from '../../../assets/icon/wind/direction-0.svg';

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

  loading: {
    padding: theme.spacing(1, 1, 0, 0),
  },
}));

interface WeatherProps {
  config: GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>) => void;
}

const Weather: VoidFunctionComponent<WeatherProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: WeatherProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    setting: { deviceId, unit, size },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>();

  const {
    data: getDevicesData,
    loading: getDevicesLoading,
    error: getDevicesError,
  } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds: [deviceId],
      },
    },
  );

  const devices = useMemo<GadgetDeviceInfo[]>(
    () =>
      getDevicesData?.getDevices?.map(({ deviceId: getDeviceId, name, sensors, groups }) => ({
        deviceId: getDeviceId,
        name,
        sensors,
        groups,
      })) || [],
    [getDevicesData?.getDevices],
  );

  const showableSensors = useMemo(() => {
    const sensors = devices[0]?.sensors;
    const ownSensorIds = new Set(sensors ? sensors.map(({ sensorId }) => sensorId) : []);
    const subscribeSensorsList = subscribeSensorIds[DeviceType.OPEN_DATA_WEATHER].filter((id) =>
      ownSensorIds.has(id),
    );
    return new Set(subscribeSensorsList);
  }, [devices]);

  const sensorValues = useSubscribeSensors(devices, showableSensors);

  const isForbidden = useMemo(
    () => [getDevicesError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [getDevicesError],
  );

  const [sensorValueMap, setSensorValueMap] = useState<Map<string, string | number | boolean>>(
    new Map(),
  );

  useEffect(() => {
    if (!sensorValues) return;
    if (Object.keys(sensorValues).indexOf(deviceId) === -1) return;
    Object.entries(sensorValues[deviceId]).forEach(([sensorId, value]) => {
      if (value.value !== undefined) {
        sensorValueMap.set(sensorId, value.value);
      }
    });

    setUpdateTime(new Date());
    setSensorValueMap(sensorValueMap);

    // log.info(sensorValueMap);
  }, [deviceId, sensorValueMap, sensorValues]);

  const getTemperature = useCallback(
    (temperatureC: number) => {
      switch (unit) {
        case TemperatureUnit.C:
          return temperatureC;
        case TemperatureUnit.F:
          return (temperatureC * 9) / 5 + 32;
        default:
          return temperatureC;
      }
    },
    [unit],
  );

  const fixFloat = useCallback((value: number, n = 1) => {
    const pow = 10 ** n;
    return Math.round(value * pow) / pow;
  }, []);

  const getWindSpeed = useCallback(
    (value: unknown) => (typeof value === 'number' ? fixFloat((value * 1000) / 3600) : value),
    [fixFloat],
  );

  const getWeatherConditionCode = useCallback(
    (value: unknown) => (isWeatherConditionCode(value) ? value : WeatherConditionCode.UNKNOWN),
    [],
  );

  const getWeatherConditionTime = useCallback(
    (value: unknown) => (isWeatherConditionTime(value) ? value : WeatherConditionTime.DAY),
    [],
  );

  const getWeatherWindDirection = useCallback(
    (value: unknown) =>
      typeof value === 'number'
        ? weatherWindDirectionInfoList[fixFloat(value / 22.5, 0) % 16]
        : weatherWindDirectionInfoList[0],
    [fixFloat],
  );

  const weatherChartData: WeatherUnit[] = useMemo(() => {
    const updateHour = updateTime?.getHours() || new Date().getHours();

    const now: WeatherUnit = {
      hour: updateHour,
      temperature: sensorValueMap.has('temp_c')
        ? getTemperature(sensorValueMap.get('temp_c') as number)
        : undefined,
      humidity: sensorValueMap.has('humidity')
        ? (sensorValueMap.get('humidity') as number)
        : undefined,
      windSpeed: sensorValueMap.has('wind_kph')
        ? (getWindSpeed(sensorValueMap.get('wind_kph')) as number)
        : undefined,
      condition:
        sensorValueMap.has('condition_code') && sensorValueMap.has('is_day')
          ? weatherConditionInfo[getWeatherConditionCode(sensorValueMap.get('condition_code'))][
              getWeatherConditionTime(sensorValueMap.get('is_day'))
            ]
          : undefined,
    };

    const forecast: WeatherUnit[] = Array.from(Array(5).keys()).map((i) => {
      const offset = i + 1;
      return {
        hour: updateHour + offset,
        temperature: sensorValueMap.has(`temp_c_${offset}`)
          ? Math.round(getTemperature(sensorValueMap.get(`temp_c_${offset}`) as number))
          : undefined,
        humidity: sensorValueMap.has(`humidity_${offset}`)
          ? (sensorValueMap.get(`humidity_${offset}`) as number)
          : undefined,
        windSpeed: sensorValueMap.has(`wind_kph_${offset}`)
          ? (getWindSpeed(sensorValueMap.get(`wind_kph_${offset}`)) as number)
          : undefined,
        condition:
          sensorValueMap.has(`condition_code_${offset}`) && sensorValueMap.has(`is_day_${offset}`)
            ? weatherConditionInfo[
                getWeatherConditionCode(sensorValueMap.get(`condition_code_${offset}`))
              ][getWeatherConditionTime(sensorValueMap.get(`is_day_${offset}`))]
            : undefined,
      };
    });

    const response: WeatherUnit[] = [now, ...forecast];
    return response;
  }, [
    getTemperature,
    getWeatherConditionCode,
    getWeatherConditionTime,
    getWindSpeed,
    sensorValueMap,
    updateTime,
  ]);

  const cityName = useMemo(
    () => (devices.length > 0 ? devices[0]?.name || '---' : '---'),
    [devices],
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
      ConfigComponent={WeatherConfig}
    >
      {getDevicesLoading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '46px',
          }}
        >
          <CircularProgress className={classes.loading} />
        </div>
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
            <Box
              style={{
                padding: theme.spacing(1, 7, 2, 7),
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: theme.spacing(3),
              }}
            >
              <Box style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(2) }}>
                <Box
                  style={{
                    width: theme.spacing(10),
                    height: theme.spacing(10),
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sensorValueMap.has('condition_code') && sensorValueMap.has('is_day') ? (
                    <Box style={{ height: 56, width: 56 }}>
                      {
                        weatherConditionInfo[
                          getWeatherConditionCode(sensorValueMap.get('condition_code'))
                        ][getWeatherConditionTime(sensorValueMap.get('is_day'))].icon
                      }
                    </Box>
                  ) : (
                    <UnknownWeatherIcon style={{ height: 56, width: 56 }} />
                  )}
                </Box>
                <Box
                  style={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'flex-end',
                    gap: theme.spacing(0.75),
                  }}
                >
                  <Box
                    component="span"
                    style={{
                      fontSize: '56px',
                      fontWeight: 'bold',
                      marginBottom: theme.spacing(0.5),
                    }}
                  >
                    {sensorValueMap.has('temp_c')
                      ? Math.round(getTemperature(sensorValueMap.get('temp_c') as number))
                      : '---'}
                  </Box>
                  <Box
                    component="span"
                    style={{
                      fontSize: '20px',
                      marginBottom: theme.spacing(1.6),
                    }}
                  >
                    {unit === TemperatureUnit.C
                      ? t('dashboard:TEMPERATURE_C')
                      : t('dashboard:TEMPERATURE_F')}
                  </Box>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: theme.spacing(0.75),
                    marginTop: theme.spacing(1.5),
                  }}
                >
                  <Box component="span">
                    {sensorValueMap.has('condition_code') && sensorValueMap.has('is_day')
                      ? weatherConditionInfo[
                          getWeatherConditionCode(sensorValueMap.get('condition_code'))
                        ][getWeatherConditionTime(sensorValueMap.get('is_day'))].name
                      : '---'}
                  </Box>
                  <Box
                    component="span"
                    style={{
                      color: theme.palette.pageContainer.title,
                      fontWeight: 'bold',
                      fontSize: theme.spacing(2),
                    }}
                  >
                    {cityName}
                  </Box>
                </Box>
              </Box>
              <Box
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.5) }}>
                    {sensorValueMap.has('wind_degree') ? (
                      <Box
                        style={{
                          color: theme.palette.type === 'dark' ? '#114292' : '#9EADBD',
                        }}
                      >
                        <Box>{getWeatherWindDirection(sensorValueMap.get('wind_degree')).icon}</Box>
                      </Box>
                    ) : (
                      <WindDirection0
                        style={{ color: theme.palette.type === 'dark' ? '#114292' : '#9EADBD' }}
                      />
                    )}
                    <span style={{ color: theme.palette.pageContainer.title }}>
                      {sensorValueMap.has('wind_kph')
                        ? getWindSpeed(sensorValueMap.get('wind_kph'))
                        : '---'}
                      {' m/s '}
                      {sensorValueMap.has('wind_degree')
                        ? getWeatherWindDirection(sensorValueMap.get('wind_degree')).name
                        : '---'}
                    </span>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.5) }}>
                  <HumidityIcon
                    style={{ color: theme.palette.type === 'dark' ? '#114292' : '#9EADBD' }}
                  />
                  <span style={{ color: theme.palette.pageContainer.title }}>
                    {sensorValueMap.has('humidity') ? sensorValueMap.get('humidity') : '---'}%
                  </span>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.5) }}>
                  <UvIcon
                    style={{ color: theme.palette.type === 'dark' ? '#114292' : '#9EADBD' }}
                  />
                  <span style={{ color: theme.palette.pageContainer.title }}>
                    {sensorValueMap.has('uv') ? sensorValueMap.get('uv') : '---'}
                  </span>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            className={clsx(
              classes.item,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
            style={{ marginTop: size === GadgetSize.RECTANGLE ? theme.spacing(-1.25) : 0 }}
          >
            <WeatherChart data={weatherChartData} />
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(Weather);
