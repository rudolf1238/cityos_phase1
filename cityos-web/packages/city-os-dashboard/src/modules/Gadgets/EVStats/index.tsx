import { ApolloError } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import { msOfHour, msOfWeek } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import {
  ConfigFormType,
  Curve,
  Duration,
  ExtremeOperation,
  GadgetConfig,
  GadgetSize,
} from '../../../libs/type';
import {
  SUBSCRIBE_VALUE_STATS,
  SubscribeValueStatsPayload,
  SubscribeValueStatsResponse,
} from '../../../api/subscribeValueStats';
import { resubscribeInterval } from '../../../libs/constants';
import { roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useGetEVStatsHistory from '../../../hooks/useGetEVStatsHistory';
import useResubscribeableSubscription from '../../../hooks/useResubscribeableSubscription';

import EVStatsConfig from './EVStatsConfig';
import GadgetBase from '../GadgetBase';
import LineCharts from '../../LineCharts';
import ResponsiveTypography from '../../ResponsiveTypography';

interface UseSubscribeEVStatsValueResult {
  value?: number;
  loading: boolean;
  error?: ApolloError;
}

const useSubscribeEVStatsValue = (
  groupId: string,
  sensorId: SensorId.CHARGING_METER | SensorId.CHARGING_AMOUNT,
  days: number,
  operation: ExtremeOperation.SUM | ExtremeOperation.COUNT,
): UseSubscribeEVStatsValueResult => {
  // resubscribe on division-related gadget in case of devices change
  const { data, error, loading, resubscribe } = useResubscribeableSubscription<
    SubscribeValueStatsResponse,
    SubscribeValueStatsPayload
  >(SUBSCRIBE_VALUE_STATS, {
    variables: {
      groupId,
      deviceType: DeviceType.CHARGING,
      sensorId,
      days,
      operation,
    },
  });

  const value = data?.sensorValueStatsChanged?.value;

  useEffect(() => {
    const timer = window.setInterval(() => {
      resubscribe();
    }, resubscribeInterval);
    return () => {
      window.clearInterval(timer);
    };
  }, [resubscribe]);

  return {
    value,
    loading,
    error,
  };
};

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
  },

  text: {
    width: '100%',
  },

  revenue: {
    color: theme.palette.gadget.revenue,
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

const getValueString = (value?: number, prefix?: string) => {
  if (prefix) return value !== undefined ? `${prefix}${value.toLocaleString('en-US')}` : '---';
  return value !== undefined ? value.toLocaleString('en-US') : '---';
};

interface EVStatsProps {
  config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
}

const EVStats: VoidFunctionComponent<EVStatsProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: EVStatsProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');
  const {
    setting: { groupId, size },
  } = config;
  const {
    userProfile: { joinedGroups },
  } = useStore();

  const [updateTime, setUpdateTime] = useState<Date>();
  const [endTime, setEndTime] = useState(roundUpNow(Duration.WEEK));

  const { data: currWeekData, error: currentError } = useGetEVStatsHistory(
    groupId,
    endTime - msOfWeek,
    endTime - 1, // query to end of the period
  );
  const { data: lastWeekData, error: pastError } = useGetEVStatsHistory(
    groupId,
    endTime - msOfWeek - msOfWeek,
    endTime - msOfWeek - 1, // query to end of the period
  );

  const curves = useMemo<Curve[]>(
    () => [
      {
        key: 'thisWeek',
        points: currWeekData,
        variant: 'areaClosed',
        color: 'available',
      },
    ],
    [currWeekData],
  );

  const pastCurve = useMemo<Curve>(
    () => ({
      key: 'lastWeek',
      points: lastWeekData,
    }),
    [lastWeekData],
  );

  const {
    value: revenueValue,
    loading: revenueLoading,
    error: revenueError,
  } = useSubscribeEVStatsValue(groupId, SensorId.CHARGING_AMOUNT, 7, ExtremeOperation.SUM);

  const {
    value: energyValue,
    loading: energyLoading,
    error: energyError,
  } = useSubscribeEVStatsValue(groupId, SensorId.CHARGING_METER, 7, ExtremeOperation.SUM);

  const {
    value: sessionValue,
    loading: sessionLoading,
    error: sessionError,
  } = useSubscribeEVStatsValue(groupId, SensorId.CHARGING_METER, 7, ExtremeOperation.COUNT);

  const divisionName = useMemo(
    () => joinedGroups?.find(({ id }) => id === groupId)?.name || '',
    [joinedGroups, groupId],
  );

  const revenueString = getValueString(revenueValue, '$');
  const energyString = getValueString(energyValue);
  const sessionString = getValueString(sessionValue);

  const isForbidden = useMemo(
    () =>
      [currentError, pastError, revenueError, sessionError, energyError].some(
        (err) => err && isGqlError(err, ErrorCode.FORBIDDEN),
      ),
    [currentError, pastError, revenueError, sessionError, energyError],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEndTime(roundUpNow(Duration.WEEK));
    }, msOfHour);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const currUpdateTime = currWeekData
      .concat(lastWeekData)
      .reduce<number>((max, { time }) => (time ? Math.max(max, time) : max), 0);
    setUpdateTime(new Date(currUpdateTime));
  }, [currWeekData, lastWeekData]);

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('You don_t have permission to access this division_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={EVStatsConfig}
    >
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
              <DeviceIcon type={DeviceType.CHARGING} width={30} height={30} />
            </Avatar>
          </Grid>
          <Grid item xs={5} container direction="column" className={classes.textWrapper}>
            <Typography variant="subtitle1" noWrap className={classes.text}>
              {t('EV Stats Last 7 Days')}
            </Typography>
            <OverflowTooltip title={divisionName}>
              <Typography variant="body2" noWrap className={classes.text}>
                {divisionName}
              </Typography>
            </OverflowTooltip>
          </Grid>
          <Grid item xs={5} container>
            <Grid item xs={12}>
              <Typography variant="body2" align="right" className={classes.subtitle}>
                {t('Revenue')}
              </Typography>
            </Grid>
            <Grid item xs={12} container justify="flex-end">
              {revenueLoading ? (
                <div className={classes.loading}>
                  <CircularProgress size={24} />
                </div>
              ) : (
                <ResponsiveTypography
                  variant="h4"
                  text={revenueString}
                  maxWidth={revenueString.length < 6 ? 80 : 120}
                  maxFontSize={40}
                  className={classes.revenue}
                />
              )}
            </Grid>
          </Grid>
          <Grid item xs={12} container className={clsx(classes.gridContainer, classes.values)}>
            <Grid item xs={6} container alignContent="center">
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  noWrap
                  align="right"
                  className={classes.subtitle}
                  paragraph
                >
                  {t('Energy Consumption')}
                </Typography>
              </Grid>
              <Grid item xs={12} container justify="flex-end" alignItems="center">
                {energyLoading ? (
                  <div className={classes.loading}>
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  <ResponsiveTypography
                    variant="subtitle1"
                    text={energyString}
                    maxWidth={120}
                    maxFontSize={20}
                    className={classes.value}
                  />
                )}
                <Typography variant="caption">{t('kWh')}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={6} container alignContent="center">
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  noWrap
                  align="right"
                  className={classes.subtitle}
                  paragraph
                >
                  {t('Charging Sessions')}
                </Typography>
              </Grid>
              <Grid item xs={12} container justify="flex-end" alignItems="center">
                {sessionLoading ? (
                  <div className={classes.loading}>
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  <ResponsiveTypography
                    variant="subtitle1"
                    text={sessionString}
                    maxWidth={120}
                    maxFontSize={20}
                    className={classes.value}
                  />
                )}
                <Typography variant="caption">
                  {t('Session', { count: sessionValue || 0 })}
                </Typography>
              </Grid>
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
          <LineCharts
            start={endTime - msOfWeek}
            curves={curves}
            pastCurve={pastCurve}
            duration={Duration.WEEK}
            valueParser={(value) => `$${value.toLocaleString('en-US')}`}
          />
        </Grid>
      </Grid>
    </GadgetBase>
  );
};

export default memo(EVStats);
