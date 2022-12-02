import { fade, makeStyles } from '@material-ui/core/styles';
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

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Point, RecognitionType, SensorId } from 'city-os-common/libs/schema';
import {
  SENSOR_VALUES_HISTORY,
  SensorValuesHistoryPayload,
  SensorValuesHistoryResponse,
} from 'city-os-common/api/sensorValuesHistory';
import { minOfDay, minOfHour, msOfWeek } from 'city-os-common/libs/constants';
import { roundDownDate } from 'city-os-common/libs/roundDate';
import useCHTSnapshot from 'city-os-common/hooks/useCHTSnapshot';
import useSensorIdTranslation from 'city-os-common/hooks/useSensorIdTranslation';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import Snapshot from 'city-os-common/modules/Snapshot';

import {
  GET_SNAPSHOT_AT_TIME,
  GetSnapShotTimePayload,
  GetSnapShotTimeResponse,
} from '../../../api/getSnapShotAtTime';
import useEventsTranslation from '../../../hooks/useEventsTranslation';

import EventLineChart from './EventLineChart';
import PhotoIcon from '../../../assets/icon/photo.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: 'nowrap',
    gap: theme.spacing(3.5),
    margin: 'auto',
    padding: theme.spacing(7.5, 4.5, 6.5),
    width: 'fit-content',
  },

  infoContent: {
    flexShrink: 0,
    width: 220,
    textAlign: 'left',
  },

  textItem: {
    rowGap: theme.spacing(1),
  },

  snapShotWrapper: {
    width: '100%',
    textAlign: 'center',
  },

  snapshot: {
    width: '100%',
  },

  defaultPhoto: {
    border: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.light,
    color: fade(theme.palette.text.primary, 0.12),

    '& svg': {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      margin: 0,
      width: 'auto',
      height: 'auto',
    },
  },

  chartContent: {
    width: 740,
    rowGap: theme.spacing(3),
  },

  chart: {
    display: 'flex',
    height: 230,
  },

  chartTitle: {
    position: 'relative',
    textAlign: 'center',
  },

  lightTitle: {
    color: theme.palette.text.hint,
  },

  interval: {
    position: 'absolute',
    top: 0,
    right: theme.spacing(2.5),
  },

  loading: {
    margin: 'auto',
  },
}));

export interface SnapshotContentProps {
  deviceId: string;
  recognitionType: RecognitionType.HUMAN_FLOW | RecognitionType.CAR_FLOW;
  projectKey: string | null;
  time?: number;
}

const SnapshotContent: VoidFunctionComponent<SnapshotContentProps> = ({
  deviceId,
  recognitionType,
  time,
  projectKey,
}: SnapshotContentProps) => {
  const classes = useStyles();
  const { tSensorId } = useSensorIdTranslation();

  const { data: snapshotData, loading: snapshotLoading } = useQuery<
    GetSnapShotTimeResponse,
    GetSnapShotTimePayload
  >(GET_SNAPSHOT_AT_TIME, {
    skip: !time,
    variables: {
      deviceId,
      sensorId:
        recognitionType === RecognitionType.HUMAN_FLOW
          ? SensorId.CAMERA_HUMAN_IMAGE
          : SensorId.CAMERA_CAR_FLOW_STRAIGHT_IMAGE,
      time: new Date(time || 0),
    },
  });

  const imgUrl = snapshotData?.sensorValueAtTime?.value;

  const imgSrc = useCHTSnapshot(projectKey, imgUrl);

  if (!imgUrl && !snapshotLoading) {
    return (
      <div className={classes.defaultPhoto}>
        <AspectRatio ratio={16 / 9}>
          <PhotoIcon />
        </AspectRatio>
      </div>
    );
  }

  if (imgUrl && imgSrc) {
    return (
      <Snapshot
        src={imgSrc}
        alt={tSensorId(
          recognitionType === RecognitionType.HUMAN_FLOW
            ? SensorId.CAMERA_HUMAN_IMAGE
            : SensorId.CAMERA_CAR_FLOW_STRAIGHT_IMAGE,
        )}
        iconButtonPlacement="right-top"
        className={classes.snapshot}
      />
    );
  }

  return <CircularProgress className={classes.loading} />;
};

export interface FlowChartTableRowProps {
  deviceId: string;
  name: string;
  projectKey: string | null;
  recognitionType: RecognitionType.HUMAN_FLOW | RecognitionType.CAR_FLOW;
  start: number;
  end: number;
  maxY: number /** need to be multiples of four  */;
  onMaxValueChange: (deviceId: string, newValue: number) => void;
}

const FlowChartTableRow: VoidFunctionComponent<FlowChartTableRowProps> = ({
  deviceId,
  name,
  projectKey,
  recognitionType,
  start,
  end,
  maxY,
  onMaxValueChange,
}: FlowChartTableRowProps) => {
  const classes = useStyles();
  const { t } = useEventsTranslation(['column', 'events', 'variables']);
  const [tooltipTime, setTooltipTime] = useState<number>();

  const interval = end - start > msOfWeek ? 'day' : 'hour';

  const handleTooltipChange = useCallback((newTooltipData: Point) => {
    setTooltipTime(newTooltipData.time);
  }, []);

  const { data: sensorValuesData, loading: sensorValueLoading } = useQuery<
    SensorValuesHistoryResponse,
    SensorValuesHistoryPayload
  >(SENSOR_VALUES_HISTORY, {
    variables: {
      deviceId,
      sensorId:
        recognitionType === RecognitionType.HUMAN_FLOW
          ? SensorId.CAMERA_HUMAN_COUNT
          : SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT,
      start: new Date(start),
      end: new Date(end),
      interval: interval === 'day' ? minOfDay : minOfHour,
    },
  });

  const points = useMemo(() => {
    if (!sensorValuesData?.sensorValuesHistory) return null;

    const newPoints = sensorValuesData.sensorValuesHistory.reduce<Point[]>(
      (pointsArr, { time, value }) => {
        if (time !== undefined && value !== undefined) {
          pointsArr.push({ time, value: Math.round(value) });
        }
        return pointsArr;
      },
      [],
    );

    // correction for points time since elastic search round down all data time
    if (
      newPoints?.[0]?.time !== undefined &&
      newPoints[0].time === roundDownDate(start, interval).getTime()
    ) {
      newPoints[0] = { ...newPoints[0], time: start };
    }
    return newPoints;
  }, [interval, sensorValuesData?.sensorValuesHistory, start]);

  useEffect(() => {
    let maxValue = -Infinity;
    points?.forEach(({ value }) => {
      if (value > maxValue) {
        maxValue = value;
      }
    });
    onMaxValueChange(deviceId, maxValue);
  }, [points, deviceId, onMaxValueChange]);

  return (
    <Grid container className={classes.root}>
      <Grid item container direction="column" spacing={3} className={classes.infoContent}>
        <Grid item container direction="column" className={classes.textItem}>
          <Typography variant="body2" color="textSecondary">
            {t('column:Device ID')}
          </Typography>
          <Typography variant="body1">{deviceId}</Typography>
        </Grid>
        <Grid item container direction="column" className={classes.textItem}>
          <Typography variant="caption" className={classes.lightTitle}>
            {t('column:Device Name')}
          </Typography>
          <Typography variant="body1">{name}</Typography>
        </Grid>
        <Grid item className={classes.snapShotWrapper}>
          <SnapshotContent
            deviceId={deviceId}
            recognitionType={recognitionType}
            time={tooltipTime}
            projectKey={projectKey}
          />
        </Grid>
      </Grid>
      <Grid item container direction="column" className={classes.chartContent}>
        <Grid item className={classes.chart}>
          {!points && sensorValueLoading ? (
            <CircularProgress className={classes.loading} />
          ) : (
            <EventLineChart
              points={points || []}
              color={recognitionType === RecognitionType.HUMAN_FLOW ? 'crowd' : 'traffic'}
              start={start}
              end={end}
              maxY={maxY}
              interval={interval}
              onTooltipChange={handleTooltipChange}
            />
          )}
        </Grid>
        <Grid item className={classes.chartTitle}>
          <Typography variant="overline" className={clsx(classes.lightTitle, classes.interval)}>
            {interval === 'hour' ? t('events:SUBTOTALS BY HOUR') : t('events:SUBTOTALS BY DAY')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default memo(FlowChartTableRow);
