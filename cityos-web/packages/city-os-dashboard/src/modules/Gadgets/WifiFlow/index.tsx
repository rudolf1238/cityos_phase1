import { makeStyles } from '@material-ui/core/styles';
import { useQuery, useSubscription } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import { DeviceType, SensorId, SensorType } from 'city-os-common/libs/schema';
import {
  SENSOR_VALUES_HISTORY,
  SensorValuesHistoryPayload,
  SensorValuesHistoryResponse,
} from 'city-os-common/api/sensorValuesHistory';
import { minOfDay, minOfHour, msOfDay, msOfWeek } from 'city-os-common/libs/constants';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ErrorCode from 'city-os-common/libs/errorCode';
import getSensorValueChanged, {
  SubscribeValueChangedPayload,
  SubscribeValueChangedResponse,
} from 'city-os-common/api/getSensorValueChanged';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ConfigFormType, Curve, Duration, GadgetConfig } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import { getCurve, roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import SingleFlowLineChart from '../SingleFlowLineChart';
import WifiFlowConfig from './WifiFlowConfig';

const useStyles = makeStyles(() => ({
  loading: {
    margin: 'auto',
  },
}));

const updateInterval = 60_000;

interface WifiFlowProps {
  config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
}

const WifiFlow: VoidFunctionComponent<WifiFlowProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: WifiFlowProps) => {
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
  const interval = duration === Duration.DAY ? minOfHour : minOfDay;

  const { data: getDevicesData, loading: getDevicesLoading, error: getDevicesError } = useQuery<
    GetDevicesOnDashboardResponse,
    GetDevicesOnDashboardPayload
  >(GET_DEVICES_ON_DASHBOARD, {
    variables: {
      deviceIds: [deviceId],
    },
  });

  const { loading, error: currentError } = useQuery<
    SensorValuesHistoryResponse,
    SensorValuesHistoryPayload
  >(SENSOR_VALUES_HISTORY, {
    variables: {
      deviceId,
      sensorId: SensorId.WIFI_CONN_USER_COUNT,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setCurve(getCurve(id, data.sensorValuesHistory, 'default'));
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
    SensorValuesHistoryResponse,
    SensorValuesHistoryPayload
  >(SENSOR_VALUES_HISTORY, {
    variables: {
      deviceId,
      sensorId: SensorId.WIFI_CONN_USER_COUNT,
      start: new Date(endTime - timeInRange - timeInRange),
      end: new Date(endTime - timeInRange - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setPastCurve(getCurve(`past-${id}`, data.sensorValuesHistory, 'default'));
    },
    onError: () => {
      setPastCurve({
        key: `past-${id}`,
        points: [],
      });
    },
  });

  const { data: subscribeData } = useSubscription<
    SubscribeValueChangedResponse<SensorType.GAUGE>,
    SubscribeValueChangedPayload
  >(getSensorValueChanged(SensorType.GAUGE), {
    variables: { deviceId, sensorId: SensorId.WIFI_CONN_USER_COUNT },
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
      ConfigComponent={WifiFlowConfig}
    >
      {!curve && (loading || pastLoading || getDevicesLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <SingleFlowLineChart
          setting={{
            duration,
            size,
            title: `${t('dashboard:Wifi Connection')} (${t('dashboard:Now')})`,
            subTitle: deviceName || deviceId,
            unit: t('dashboard:DEVICE', {
              count: currentValue !== '---' ? parseInt(currentValue, 10) : 0,
            }),
            icon: <DeviceIcon type={DeviceType.WIFI} />,
            colorKey: 'default',
          }}
          start={endTime - timeInRange}
          curve={curve}
          pastCurve={pastCurve}
          currentValue={currentValue}
        />
      )}
    </GadgetBase>
  );
};

export default memo(WifiFlow);
