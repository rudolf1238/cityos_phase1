import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';
import Typography from '@material-ui/core/Typography';

import { SensorId } from 'city-os-common/libs/schema';
import { minOfHour, msOfWeek } from 'city-os-common/libs/constants';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ConfigFormType, Duration, GadgetConfig, GadgetSize } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import {
  SENSOR_VALUES_AVG_HISTORY,
  SensorValuesAvgHistoryPayload,
  SensorValuesAvgHistoryResponse,
  SingleISensorData,
} from '../../../api/sensorValuesAvgHistory';
import { roundUpNow } from '../../../libs/utils';
import PowerConsumptionConfig from './PowerConsumptionConfig';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import HeatMapCharts, { HeatMapBin, HeatMapBins } from '../../HeatMapCharts';
import PowerConsumptionIcon from '../../../assets/icon/gadget-power-consumption.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    minHeight: 0,
  },

  avatar: {
    backgroundColor: theme.palette.background.light,
    width: 56,
    height: 56,
    color: theme.palette.info.main,
  },

  gridContainer: {
    margin: 0,
    width: '100%',
    overflow: 'hidden',
  },

  squareItem: {
    height: '50%',
  },

  graphSquareItem: {
    height: '40%',
  },

  rectangleItem: {
    height: '100%',
  },

  textWrapper: {
    gap: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  text: {
    width: '100%',
  },

  item: {
    width: '100%',
    minWidth: 0,
  },

  loading: {
    padding: theme.spacing(1, 1, 0, 0),
  },
}));

interface ScaleBarProps {
  styles?: {
    root: React.CSSProperties;
  };
}

const ScaleBar: VoidFunctionComponent<ScaleBarProps> = ({ styles }: ScaleBarProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(0, 2),
        width: '100%',
        ...styles?.root,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: theme.spacing(0.5),
        }}
      >
        <div
          style={{
            width: theme.spacing(2),
            height: theme.spacing(2),
            backgroundColor: theme.palette.heatmap.color[0],
          }}
        />
        <div style={{ fontSize: theme.spacing(1.5), color: '#2176c5' }}>{'<'}300</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: theme.spacing(0.5),
        }}
      >
        <div
          style={{
            width: theme.spacing(2),
            height: theme.spacing(2),
            backgroundColor: theme.palette.heatmap.color[300],
          }}
        />
        <div style={{ fontSize: theme.spacing(1.5), color: '#2176c5' }}>300~400</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: theme.spacing(0.5),
        }}
      >
        <div
          style={{
            width: theme.spacing(2),
            height: theme.spacing(2),
            backgroundColor: theme.palette.heatmap.color[400],
          }}
        />
        <div style={{ fontSize: theme.spacing(1.5), color: '#2176c5' }}>400~500</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: theme.spacing(0.5),
        }}
      >
        <div
          style={{
            width: theme.spacing(2),
            height: theme.spacing(2),
            backgroundColor: theme.palette.heatmap.color[500],
          }}
        />
        <div style={{ fontSize: theme.spacing(1.5), color: '#2176c5' }}>500~600</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: theme.spacing(0.5),
        }}
      >
        <div
          style={{
            width: theme.spacing(2),
            height: theme.spacing(2),
            backgroundColor: theme.palette.heatmap.color[600],
          }}
        />
        <div style={{ fontSize: theme.spacing(1.5), color: '#2176c5' }}>{'>'}600 (kW)</div>
      </div>
    </div>
  );
};

const updateInterval = 60_000;

interface IndoorTemperatureProps {
  config: GadgetConfig<ConfigFormType.DEVICE_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_LAYOUT>) => void;
}

const IndoorTemperature: VoidFunctionComponent<IndoorTemperatureProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: IndoorTemperatureProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'dashboard']);
  const {
    setting: { deviceId, size },
  } = config;

  const duration = Duration.WEEK;

  const [endTime, setEndTime] = useState<number>(roundUpNow(duration));
  const [sensorValuesAvgHistory, setSensorValuesAvgHistory] = useState<SingleISensorData[]>([]);
  const [updateTime, setUpdateTime] = useState(new Date());

  const timeInRange = msOfWeek;
  const interval = minOfHour;

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
      sensorId: SensorId.POWER_METER_POWER_CONSUMPTION,
      start: new Date(endTime - timeInRange),
      end: new Date(endTime - 1), // query to end of the period
      interval,
    },
    onCompleted: (data) => {
      setSensorValuesAvgHistory(data.sensorValuesAvgHistory);
      setUpdateTime(new Date());
    },
    onError: () => {
      setSensorValuesAvgHistory([]);
    },
  });

  const deviceName = getDevicesData?.getDevices?.[0]?.name;

  const isForbidden = useMemo(
    () => [getDevicesError, currentError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [currentError, getDevicesError],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndTime(roundUpNow(duration));
    }, updateInterval);
    return () => clearInterval(intervalId);
  }, [duration]);

  const binData: HeatMapBins[] = useMemo(() => {
    const valueMap = new Map<number, number | undefined>();

    sensorValuesAvgHistory.map((value) => {
      if (value.time !== undefined) {
        valueMap.set(value.time, value.value);
      }
      return null;
    });

    const res: HeatMapBins[] = [];

    const startTimeStamp: number = new Date(endTime - timeInRange).getTime();

    for (let i = 0; i < 24; i += 1) {
      const temp: HeatMapBin[] = [];
      for (let j = 0; j < 7; j += 1) {
        const timeIndex = startTimeStamp + 3600000 * i + 86400000 * j;
        temp.push({
          bin: 0,
          count: valueMap.has(timeIndex) ? valueMap.get(timeIndex) : undefined,
        });
      }

      res.push({
        bin: i,
        bins: temp,
      });
    }

    return res;
  }, [endTime, sensorValuesAvgHistory, timeInRange]);

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
      ConfigComponent={PowerConsumptionConfig}
    >
      {loading || getDevicesLoading ? (
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
            <Grid item xs={3} container justify="center" alignItems="center" wrap="nowrap">
              <Avatar className={classes.avatar}>
                <PowerConsumptionIcon width={24} height={24} />
              </Avatar>
            </Grid>
            <Grid item xs={9} container direction="column" className={classes.textWrapper}>
              <Typography variant="subtitle1" noWrap className={classes.text}>
                {`${t('dashboard:Indoor power consumption')}`}
              </Typography>
              <OverflowTooltip title={deviceName || ''}>
                <Typography variant="caption" noWrap className={classes.text}>
                  {deviceName}
                </Typography>
              </OverflowTooltip>
            </Grid>
            {size === GadgetSize.RECTANGLE && <ScaleBar />}
          </Grid>
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 12 : 6}
            className={clsx(
              classes.item,
              size === GadgetSize.SQUARE ? classes.graphSquareItem : classes.rectangleItem,
            )}
          >
            <HeatMapCharts startDate={new Date(endTime - timeInRange)} binData={binData} />
          </Grid>
          {size === GadgetSize.SQUARE && (
            <ScaleBar styles={{ root: { padding: theme.spacing(2, 2, 4, 2) } }} />
          )}
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(IndoorTemperature);
