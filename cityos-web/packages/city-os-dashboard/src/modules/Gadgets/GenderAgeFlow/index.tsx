import { makeStyles, useTheme } from '@material-ui/core/styles';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useQuery } from '@apollo/client';
import React, { Fragment, VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Gender, ageGroup } from 'city-os-common/libs/schema';
import { minOfDay, minOfHour, msOfDay, msOfWeek } from 'city-os-common/libs/constants';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useAgeGroupTranslation from 'city-os-common/hooks/useAgeGroupTranslation';
import useGenderTranslation from 'city-os-common/hooks/useGenderTranslation';

import GenderIcon from 'city-os-common/modules/GenderIcon';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import {
  AgeHistogram,
  ConfigFormType,
  Duration,
  GadgetConfig,
  GadgetSize,
  GadgetType,
} from '../../../libs/type';
import {
  GADGET_FOR_GENDER_AND_AGE,
  GadgetForGenderAndAgePayload,
  GadgetForGenderAndAgeResponse,
} from '../../../api/gadgetForGenderAndAge';
import { getCurve, roundUpNow } from '../../../libs/utils';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useGadgetTranslation from '../../../hooks/useGadgetTranslation';

import GadgetBase from '../GadgetBase';
import GenderAgeFlowConfig from './GenderAgeFlowConfig';
import GenderAgeIcon from '../../../assets/icon/genderAge.svg';
import LineCharts from '../../LineCharts';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    minHeight: 0,
  },

  item: {
    width: '100%',
    minWidth: 0,
  },

  infoItem: {
    paddingLeft: theme.spacing(1),
  },

  squareItem: {
    height: '50%',
  },

  rectangleItem: {
    height: '100%',
  },

  titleWrapper: {
    gap: theme.spacing(1),
    padding: theme.spacing(2, 0, 3),
    color: theme.palette.grey[700],
  },

  avatar: {
    backgroundColor: theme.palette.background.light,
    width: 56,
    height: 56,
    color: theme.palette.info.main,

    '& > svg': {
      width: 30,
      height: 30,
    },
  },

  textWrapper: {
    gap: theme.spacing(0.5),
    overflow: 'hidden',
  },

  deviceName: {
    width: '100%',
  },

  genderPercentage: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',

    '& > p': {
      color: theme.palette.pageContainer.title,
    },

    '& > span': {
      color: theme.palette.grey[700],
    },
  },

  loading: {
    margin: 'auto',
  },

  barLabel: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'normal',
    fill: theme.palette.gadget.offline,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  },

  tick: {
    ...theme.typography.overline,
    fill: theme.palette.grey[700],
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  },
}));

const updateInterval = 60_000;

// barChart settings
const width = 185;
const singleChartHeight = 70;
const textHeight = 24;
const axisHeight = 24;
const height = singleChartHeight * 2 + axisHeight;
const r = 8;
const defaultMaxValue = 10;

interface BarChartProps {
  chartId: string;
  ageHistogram: AgeHistogram;
}

const BarChart: VoidFunctionComponent<BarChartProps> = ({
  chartId,
  ageHistogram,
}: BarChartProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { tAgeGroup } = useAgeGroupTranslation();

  const xMax = width;
  const yMax = singleChartHeight - textHeight;

  const maxValue = useMemo(
    () =>
      [...ageHistogram.female, ...ageHistogram.male].reduce(
        (currMax, number) => (number > currMax ? number : currMax),
        0,
      ),
    [ageHistogram],
  );

  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        round: true,
        domain: Object.values(ageGroup),
        paddingInner: 0.65,
        paddingOuter: 0.3,
      }),
    [xMax],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, yMax],
        round: true,
        domain: [0, maxValue || defaultMaxValue],
      }),
    [yMax, maxValue],
  );

  return (
    <svg width={width} height={height}>
      {Object.values(ageGroup).map((group) => {
        const barWidth = xScale.bandwidth();
        const barX = xScale(group) || 0;
        const labelX = barX + barWidth / 2;
        const axisY = singleChartHeight + axisHeight / 2;

        return (
          <Fragment key={group}>
            {Object.values(Gender).map((gender) => {
              const count = ageHistogram[gender === Gender.MALE ? 'male' : 'female'][group];
              const barHeight = yScale(count);
              const groupY = gender === Gender.MALE ? textHeight : singleChartHeight + axisHeight;
              const barY = gender === Gender.MALE ? yMax - barHeight : 0;
              const labelY =
                gender === Gender.MALE ? barY - textHeight / 2 : barY + barHeight + textHeight / 2;
              const clipY = gender === Gender.MALE ? barY : barY - r;

              return (
                <Group key={gender} top={groupY}>
                  <defs>
                    <clipPath id={`${chartId}-${gender}-${group}-round-corner`}>
                      <rect
                        x={barX}
                        y={clipY}
                        width={barWidth}
                        height={barHeight + r}
                        rx={r}
                        ry={r}
                      />
                    </clipPath>
                  </defs>
                  <text x={labelX} y={labelY} className={classes.barLabel}>
                    {count}
                  </text>
                  <Bar
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={
                      gender === Gender.MALE
                        ? theme.palette.gadget.male
                        : theme.palette.gadget.female
                    }
                    clipPath={`url(#${chartId}-${gender}-${group}-round-corner)`}
                  />
                </Group>
              );
            })}
            <text x={labelX} y={axisY} className={classes.tick}>
              {tAgeGroup(group)}
            </text>
          </Fragment>
        );
      })}
    </svg>
  );
};

interface GenderAgeFlowProps {
  config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>) => void;
}

const GenderAgeFlow: VoidFunctionComponent<GenderAgeFlowProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: GenderAgeFlowProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const { tGender } = useGenderTranslation();
  const { tGadget } = useGadgetTranslation();
  const {
    setting: { deviceId, duration, size },
  } = config;
  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [updateTime, setUpdateTime] = useState(new Date());

  const timeInRange = duration === Duration.WEEK ? msOfWeek : msOfDay;
  const interval = duration === Duration.DAY ? minOfHour : minOfDay;

  const { data: genderAgeData, error, loading } = useQuery<
    GadgetForGenderAndAgeResponse,
    GadgetForGenderAndAgePayload
  >(GADGET_FOR_GENDER_AND_AGE, {
    variables: {
      input: {
        deviceId,
        start: new Date(endTime - timeInRange),
        end: new Date(endTime - 1), // query to end of the period
        interval,
      },
    },
    onCompleted: () => {
      setUpdateTime(new Date());
    },
  });

  const curves = useMemo(
    () => [
      getCurve(
        Gender.FEMALE,
        genderAgeData?.gadgetForGenderAndAge.history.female || [],
        'female',
        'curve',
      ),
      getCurve(
        Gender.MALE,
        genderAgeData?.gadgetForGenderAndAge.history.male || [],
        'male',
        'curve',
      ),
    ],
    [genderAgeData],
  );

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

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
      ConfigComponent={GenderAgeFlowConfig}
    >
      {!genderAgeData && loading ? (
        <CircularProgress className={classes.loading} />
      ) : (
        <Grid
          container
          wrap="nowrap"
          direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
          className={classes.root}
        >
          <Grid
            item
            container
            alignItems="center"
            wrap="nowrap"
            className={clsx(
              classes.item,
              classes.infoItem,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
          >
            <Grid item container xs={6} direction="column">
              <Grid item container wrap="nowrap" className={classes.titleWrapper}>
                <Avatar className={classes.avatar}>
                  <GenderAgeIcon />
                </Avatar>
                <Grid container direction="column" justify="center" className={classes.textWrapper}>
                  <Typography variant="subtitle1" noWrap>
                    {tGadget(GadgetType.GENDER_AGE_FLOW)}
                  </Typography>
                  <OverflowTooltip title={genderAgeData?.gadgetForGenderAndAge.deviceName || ''}>
                    <Typography variant="body1" noWrap className={classes.deviceName}>
                      {genderAgeData?.gadgetForGenderAndAge.deviceName}
                    </Typography>
                  </OverflowTooltip>
                </Grid>
              </Grid>
              <Grid item container direction="column">
                {Object.values(Gender).map((gender) => (
                  <div key={gender} className={classes.genderPercentage}>
                    <GenderIcon gender={gender} />
                    <Typography variant="body2">
                      {genderAgeData
                        ? (
                            genderAgeData.gadgetForGenderAndAge.percent[
                              gender === Gender.MALE ? 'percentForMale' : 'percentForFemale'
                            ] / 100
                          ).toLocaleString('en-US', { style: 'percent' })
                        : '---'}
                    </Typography>
                    <Typography variant="caption">{tGender(gender)}</Typography>
                  </div>
                ))}
              </Grid>
            </Grid>
            <Grid item container xs={6} justify="center">
              <BarChart
                chartId={config.id}
                ageHistogram={
                  genderAgeData?.gadgetForGenderAndAge.histogram || {
                    female: [],
                    male: [],
                  }
                }
              />
            </Grid>
          </Grid>
          <Grid
            item
            className={clsx(
              classes.item,
              size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
            )}
          >
            <LineCharts start={endTime - timeInRange} curves={curves || []} duration={duration} />
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(GenderAgeFlow);
