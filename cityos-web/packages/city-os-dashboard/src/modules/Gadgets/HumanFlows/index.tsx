import { ApolloQueryResult, isApolloError, useApolloClient, useQuery } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import { Point, SensorId, SensorType } from 'city-os-common/libs/schema';
import {
  SENSOR_VALUES_HISTORY,
  SensorValuesHistoryPayload,
  SensorValuesHistoryResponse,
} from 'city-os-common/api/sensorValuesHistory';
import { isNumber } from 'city-os-common/libs/validators';
import { minOfDay, minOfHour, msOfDay, msOfWeek } from 'city-os-common/libs/constants';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import { ConfigFormType, Curve, Duration, GadgetConfig } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import { roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import CrowdIcon from '../../../assets/icon/crowd.svg';
import GadgetBase from '../GadgetBase';
import HumanFlowsConfig from './HumanFlowsConfig';
import MultiFlowsLineChart from '../MultiFlowsLineChart';

const updateInterval = 60_000;

const useStyles = makeStyles(() => ({
  loading: {
    margin: 'auto',
  },
}));

interface HumanFlowsProps {
  config: GadgetConfig<ConfigFormType.DEVICES_DURATION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICES_DURATION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICES_DURATION_LAYOUT>) => void;
}

const HumanFlows: VoidFunctionComponent<HumanFlowsProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: HumanFlowsProps) => {
  const classes = useStyles();
  const {
    setting: { duration, deviceIds, size },
  } = config;
  const { t } = useDashboardTranslation('dashboard');
  const client = useApolloClient();
  const isMountedRef = useIsMountedRef();
  const [curves, setCurves] = useState<Curve[]>();
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [updateTime, setUpdateTime] = useState(new Date());
  const [isForbidden, setIsForbidden] = useState(false);

  const timeInRange = duration === Duration.WEEK ? msOfWeek : msOfDay;

  const { data } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds,
      },
    },
  );

  const devices = useMemo(
    () => data?.getDevices?.map(({ deviceId, name }) => ({ deviceId, name })) || [],
    [data?.getDevices],
  );

  const subscribeDevices = useMemo(
    () =>
      deviceIds.map((deviceId) => ({
        deviceId,
        sensors: [{ sensorId: SensorId.CAMERA_HUMAN_COUNT, type: SensorType.GAUGE }],
      })),
    [deviceIds],
  );

  const sensorValues = useSubscribeSensors(
    subscribeDevices,
    new Set([SensorId.CAMERA_HUMAN_COUNT]),
  );

  const currentValues = useMemo(() => {
    const result: Record<string, number | undefined> = {};
    deviceIds.forEach((id) => {
      const currentValue = sensorValues?.[id]?.[SensorId.CAMERA_HUMAN_COUNT]?.value;
      result[id] = isNumber(currentValue) ? currentValue : undefined;
    });
    return result;
  }, [deviceIds, sensorValues]);

  const getSensorValueHistory = useCallback(
    async (deviceId: string, start: Date, end: Date) =>
      client.query<SensorValuesHistoryResponse, SensorValuesHistoryPayload>({
        query: SENSOR_VALUES_HISTORY,
        variables: {
          deviceId,
          sensorId: SensorId.CAMERA_HUMAN_COUNT,
          start,
          end,
          interval: duration === Duration.DAY ? minOfHour : minOfDay,
        },
      }),
    [client, duration],
  );

  const updateCurves = useCallback(async () => {
    const newEndTime = roundUpNow(duration);
    const newStart = new Date(newEndTime - timeInRange);
    setEndTime(newEndTime);
    setLoading(true);
    const results = await Promise.all<ApolloQueryResult<SensorValuesHistoryResponse> | null>(
      deviceIds.map(async (deviceId) => {
        try {
          if (isMountedRef.current) setIsForbidden(false);
          return await getSensorValueHistory(deviceId, newStart, new Date(newEndTime - 1)); // query to end of the period
        } catch (error) {
          if (isMountedRef.current) {
            setIsForbidden(
              error instanceof Error &&
                isApolloError(error) &&
                isGqlError(error, ErrorCode.FORBIDDEN),
            );
          }
          return null;
        }
      }),
    );
    if (!isMountedRef.current) return;
    setLoading(false);
    setCurves(
      results.map((result, idx) => ({
        key: deviceIds[idx],
        points: result
          ? result.data.sensorValuesHistory.reduce<Point[]>((acc, { time, value }) => {
              if (time && value) acc.push({ time, value: Math.round(value) });
              return acc;
            }, [])
          : [],
        label: devices?.find(({ deviceId: id }) => id === deviceIds[idx])?.name || deviceIds[idx],
      })),
    );
    setUpdateTime(new Date());
  }, [duration, timeInRange, deviceIds, isMountedRef, devices, getSensorValueHistory]);

  useEffect(() => {
    void updateCurves();
    const intervalId = setInterval(() => {
      void updateCurves();
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, [deviceIds, updateCurves]);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('You don_t have permission to access this device_', {
        count: curves?.length || 0,
      })}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={HumanFlowsConfig}
    >
      {!curves && loading ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <MultiFlowsLineChart
          setting={{
            duration,
            size,
            title: `${t('Crowd')} (${t('dashboard:Now')})`,
            icon: <CrowdIcon />,
          }}
          start={endTime - timeInRange}
          curves={curves}
          currentValues={currentValues}
        />
      )}
    </GadgetBase>
  );
};

export default memo(HumanFlows);
