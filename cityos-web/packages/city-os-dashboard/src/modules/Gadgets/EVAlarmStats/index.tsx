import { Palette } from '@material-ui/core/styles/createPalette';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { DeviceType, Point, SensorId, SensorType } from 'city-os-common/libs/schema';
import { msOfWeek } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';

import {
  ConfigFormType,
  Curve,
  Duration,
  ExtremeOperation,
  GadgetConfig,
} from '../../../libs/type';
import {
  SensorValueStatsHistoryPayload,
  SensorValueStatsHistoryResponse,
  getSensorValueStatsHistory,
} from '../../../api/sensorValueStatsHistory';
import {
  SubscribeExtremeValuePayload,
  SubscribeExtremeValueResponse,
  getExtremeSensorValue,
} from '../../../api/subscribeExtremeValue';
import { resubscribeInterval } from '../../../libs/constants';
import { roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useResubscribeableSubscription from '../../../hooks/useResubscribeableSubscription';

import EVAlarmStatsConfig from './EVAlarmStatsConfig';
import GadgetBase from '../GadgetBase';
import SingleFlowLineChart from '../SingleFlowLineChart';

const useStyles = makeStyles((theme) => ({
  loading: {
    margin: 'auto',
  },

  totalWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2.5),

    '& > hr': {
      margin: theme.spacing(1, 0),
      width: '100%',
    },
  },
}));

const getAlarmCurve = (
  id: string,
  sensorData: SensorValueStatsHistoryResponse<SensorType.GAUGE>['sensorValueStatsHistory'],
  color: keyof Palette['gadget'],
): Curve => ({
  key: id,
  points: sensorData.reduce<Point[]>((acc, { time, value }) => {
    if (time !== undefined && value !== undefined) acc.push({ time, value: Math.round(value) });
    return acc;
  }, []),
  variant: 'areaClosed',
  color,
});

const updateInterval = 60_000;
const duration = Duration.WEEK;
const timeInRange = msOfWeek;

// TODO: add disableGesture
interface EVAlarmStatsProps {
  config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
}

const EVAlarmStats: VoidFunctionComponent<EVAlarmStatsProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: EVAlarmStatsProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    id,
    setting: { groupId, size },
  } = config;
  const {
    userProfile: { joinedGroups },
  } = useStore();
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [curve, setCurve] = useState<Curve>();
  const [pastCurve, setPastCurve] = useState<Curve>();
  const [updateTime, setUpdateTime] = useState(new Date());

  const { loading, error: currentError } = useQuery<
    SensorValueStatsHistoryResponse<SensorType.GAUGE>,
    SensorValueStatsHistoryPayload
  >(getSensorValueStatsHistory(SensorType.GAUGE), {
    variables: {
      input: {
        groupId,
        deviceType: DeviceType.CHARGING,
        sensorId: SensorId.CHARGING_STATUS,
        start: endTime - timeInRange,
        end: endTime - 1, // query to end of the period
        option: {
          operation: ExtremeOperation.COUNT,
          text: 'alarm',
        },
      },
    },
    onCompleted: ({ sensorValueStatsHistory }) => {
      setCurve(getAlarmCurve(id, sensorValueStatsHistory, 'alarm'));
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
    SensorValueStatsHistoryResponse<SensorType.GAUGE>,
    SensorValueStatsHistoryPayload
  >(getSensorValueStatsHistory(SensorType.GAUGE), {
    variables: {
      input: {
        groupId,
        deviceType: DeviceType.CHARGING,
        sensorId: SensorId.CHARGING_STATUS,
        start: endTime - timeInRange - timeInRange,
        end: endTime - timeInRange - 1, // query to end of the period
        option: {
          operation: ExtremeOperation.COUNT,
          text: 'alarm',
        },
      },
    },
    onCompleted: ({ sensorValueStatsHistory }) => {
      setPastCurve(getAlarmCurve(`past-${id}`, sensorValueStatsHistory, 'alarm'));
      setUpdateTime(new Date());
    },
    onError: () => {
      setPastCurve({
        key: `past-${id}`,
        points: [],
      });
    },
  });

  // resubscribe on division-related gadget in case of devices change
  const { data: subscribeData, resubscribe } = useResubscribeableSubscription<
    SubscribeExtremeValueResponse<SensorType.GAUGE>,
    SubscribeExtremeValuePayload
  >(getExtremeSensorValue(SensorType.GAUGE), {
    variables: {
      groupId,
      deviceType: DeviceType.CHARGING,
      sensorId: SensorId.CHARGING_STATUS,
      option: {
        operation: ExtremeOperation.COUNT,
        text: 'alarm',
      },
    },
    skip: !groupId,
    onSubscriptionData: () => {
      setUpdateTime(new Date());
    },
  });

  const currentValue =
    subscribeData?.extremeValueChanged.response.data.value !== undefined
      ? subscribeData.extremeValueChanged.response.data.value.toString()
      : '---';

  const total = subscribeData?.extremeValueChanged.total || 0;

  const isForbidden = useMemo(
    () => [currentError, pastError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [currentError, pastError],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndTime(roundUpNow(duration));
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, []);

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
      ConfigComponent={EVAlarmStatsConfig}
    >
      {!curve && (loading || pastLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <SingleFlowLineChart
          setting={{
            duration,
            size,
            title: `${t('dashboard:EV Alarm Stats')} (${t('dashboard:Now')})`,
            subTitle: joinedGroups?.find((group) => group.id === groupId)?.name || '',
            unit: t('dashboard:DEVICE', {
              count: currentValue !== '---' ? parseInt(currentValue, 10) : 0,
            }),
            icon: <DeviceIcon type={DeviceType.CHARGING} />,
            colorKey: 'alarm',
          }}
          start={endTime - timeInRange}
          curve={curve}
          pastCurve={pastCurve}
          currentValue={currentValue}
          chartsOptions={{
            labelType: 'time',
          }}
          additionalContent={
            <div className={classes.totalWrapper}>
              <Divider />
              <Typography variant="caption" noWrap>
                {t('dashboard:Total')}
              </Typography>
              <Typography variant="h5" noWrap>
                {total}
              </Typography>
            </div>
          }
        />
      )}
    </GadgetBase>
  );
};

export default memo(EVAlarmStats);
