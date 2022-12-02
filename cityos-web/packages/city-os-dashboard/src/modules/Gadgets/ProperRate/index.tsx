import { Palette } from '@material-ui/core/styles/createPalette';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import { Point } from 'city-os-common/libs/schema';
import { msOfWeek } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import DeviceIcon from 'city-os-common/assets/icon/devices.svg';

import { ConfigFormType, Curve, Duration, GadgetConfig } from '../../../libs/type';
import {
  PROPER_RATE_HISTORY,
  ProperRateHistoryPayload,
  ProperRateHistoryResponse,
} from '../../../api/properRateHistory';
import {
  SUBSCRIBE_PROPER_RATE,
  SubscribeProperRatePayload,
  SubscribeProperRateResponse,
} from '../../../api/properRateChanged';
import { resubscribeInterval } from '../../../libs/constants';
import { roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useResubscribeableSubscription from '../../../hooks/useResubscribeableSubscription';

import GadgetBase from '../GadgetBase';
import ProperRateConfig from './ProperRateConfig';
import ResponsiveTypography from '../../ResponsiveTypography';
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

const getProperRateCurve = (
  id: string,
  sensorData: ProperRateHistoryResponse['properRateHistory'],
  color: keyof Palette['gadget'],
): Curve => ({
  key: id,
  points: sensorData.reduce<Point[]>((acc, { time, properRate }) => {
    acc.push({ time, value: properRate });
    return acc;
  }, []),
  variant: 'areaClosed',
  color,
});

const updateInterval = 3600_000;
const duration = Duration.WEEK;
const timeInRange = msOfWeek;

interface ProperRateProps {
  config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
}

const ProperRate: VoidFunctionComponent<ProperRateProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: ProperRateProps) => {
  const classes = useStyles();
  const theme = useTheme();
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
    ProperRateHistoryResponse,
    ProperRateHistoryPayload
  >(PROPER_RATE_HISTORY, {
    variables: {
      groupId,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
    },
    onCompleted: ({ properRateHistory }) => {
      setCurve(getProperRateCurve(id, properRateHistory, 'available'));
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
    ProperRateHistoryResponse,
    ProperRateHistoryPayload
  >(PROPER_RATE_HISTORY, {
    variables: {
      groupId,
      start: new Date(endTime - timeInRange - timeInRange),
      end: new Date(endTime - timeInRange - 1), // query to end of the period
    },
    onCompleted: (data) => {
      setPastCurve(getProperRateCurve(`past-${id}`, data.properRateHistory, 'available'));
    },
    onError: () => {
      setPastCurve({
        key: `past-${id}`,
        points: [],
      });
    },
  });

  // resubscribe on division-related gadget in case of devices change
  const { data: subscribeProperRateData, resubscribe } = useResubscribeableSubscription<
    SubscribeProperRateResponse,
    SubscribeProperRatePayload
  >(SUBSCRIBE_PROPER_RATE, {
    variables: { groupId },
  });

  const currentValue =
    subscribeProperRateData?.properRateChanged.properRate !== undefined
      ? subscribeProperRateData.properRateChanged.properRate.toString()
      : '---';

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
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      updateTime={updateTime}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={ProperRateConfig}
    >
      {!curve && (loading || pastLoading) ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <SingleFlowLineChart
          setting={{
            duration,
            size,
            title: `${t('dashboard:Availability Rate')} (${t('dashboard:Now')})`,
            subTitle: joinedGroups?.find((group) => group.id === groupId)?.name || '',
            icon: <DeviceIcon />,
            colorKey: 'available',
          }}
          start={endTime - timeInRange}
          curve={curve}
          pastCurve={pastCurve}
          currentValue={
            <ResponsiveTypography
              variant="h2"
              text={currentValue}
              maxWidth={120}
              maxFontSize={50}
              suffix=" %"
              suffixScale={0.5}
              style={{ color: theme.palette.gadget.available }}
            />
          }
          chartsOptions={{
            valueParser: (value) => (value / 100).toLocaleString('en-US', { style: 'percent' }),
          }}
        />
      )}
    </GadgetBase>
  );
};

export default memo(ProperRate);
