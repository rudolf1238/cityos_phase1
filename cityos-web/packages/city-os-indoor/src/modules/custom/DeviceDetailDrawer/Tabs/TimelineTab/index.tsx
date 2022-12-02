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
import update from 'immutability-helper';

import { DateTimePicker } from '@material-ui/pickers';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import Chip from '@material-ui/core/Chip';

import { Sensor, SensorType } from 'city-os-common/libs/schema';
import { SingleDeviceResponse } from 'city-os-common/api/getMapDevices';

import {
  MULTI_SENSOR_VALUES_RAW_HISTORY,
  MultiISensorData,
  MultiSensorValuesRawHistoryPayload,
  MultiSensorValuesRawHistoryResponse,
} from '../../../../../api/sensorsValuesRawHistory';
import useIndoorTranslation from '../../../../../hooks/useIndoorTranslation';

import MultiScaleLineCharts, {
  Color,
  Line,
  color as colorTheme,
} from '../../../Charts/MultiScaleLineCharts';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    display: 'flex',
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'start',
    gap: theme.spacing(4),
    backgroundColor: theme.palette.background.light,
    marginTop: -theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },

  body: {
    flexGrow: 1,
    flexShrink: 1,
    maxHeight: 'calc(100% - 96px)',
  },

  footer: {
    padding: theme.spacing(1.5, 1),
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0,
    backgroundColor: theme.palette.background.light,
  },
}));

interface CustomClasses {
  root?: string;
}

interface TimelineTabProps {
  singleDevice: SingleDeviceResponse;
  styles?: CustomClasses;
}

const TimelineTab: VoidFunctionComponent<TimelineTabProps> = (props: TimelineTabProps) => {
  const { singleDevice, styles } = props;

  const theme = useTheme();
  const classes = useStyles();
  const { t } = useIndoorTranslation(['indoor']);

  const [selectedSensorList, setSelectedSensorList] = useState<Sensor['sensorId'][]>([]);

  const handleChipClick = useCallback(
    (sensorId: Sensor['sensorId']) => {
      const index = selectedSensorList.indexOf(sensorId);
      if (index === -1) {
        setSelectedSensorList(update(selectedSensorList, { $push: [sensorId] }));
      } else {
        setSelectedSensorList(update(selectedSensorList, { $splice: [[index, 1]] }));
      }
    },
    [selectedSensorList, setSelectedSensorList],
  );

  const nowDate = new Date();
  const nowTime = nowDate.getTime();
  const [startTime, setStartTime] = useState<Date>(new Date(nowTime - 86400000));
  const [endTime, setEndTime] = useState<Date>(nowDate);

  const getSensorUnit = useCallback(
    (sensorId) => {
      const targetSensor = singleDevice.sensors.filter((sensor) => sensor.sensorId === sensorId);
      if (targetSensor.length > 0) {
        return targetSensor[0].unit || '';
      }
      return undefined;
    },
    [singleDevice.sensors],
  );

  const formatLine = useCallback(
    (multiISensorData: MultiISensorData, color: Color) => ({
      id: multiISensorData.sensorId,
      color,
      pointList: multiISensorData.sensorData
        .map((data) => ({
          time: (data.time || 0) * 1000,
          value: data.value || 0,
        }))
        .sort((a, b) => a.time - b.time),
      unit: getSensorUnit(multiISensorData.sensorId),
    }),
    [getSensorUnit],
  );

  const gaugeSensorList = useMemo(
    () => singleDevice.sensors.filter((sensor) => sensor.type === SensorType.GAUGE),
    [singleDevice.sensors],
  );

  const { data: multiSensorValuesRawHistoryData } = useQuery<
    MultiSensorValuesRawHistoryResponse,
    MultiSensorValuesRawHistoryPayload
  >(MULTI_SENSOR_VALUES_RAW_HISTORY, {
    variables: {
      start: startTime,
      end: endTime,
      deviceId: singleDevice.deviceId,
      sensorIds: gaugeSensorList.map((sensor) => sensor.sensorId),
    },
    onError: (error) => {
      console.error('multiSensorValuesRawHistoryData', error);
    },
  });

  const lineList: Line[] = useMemo(
    () =>
      multiSensorValuesRawHistoryData?.multiSensorValuesRawHistory.map((data, index) =>
        formatLine(data, colorTheme[index % colorTheme.length]),
      ) || [],
    [formatLine, multiSensorValuesRawHistoryData?.multiSensorValuesRawHistory],
  );

  const filteredLineList = useMemo(
    () => lineList.filter((line) => selectedSensorList.indexOf(line.id) === -1),
    [lineList, selectedSensorList],
  );

  useEffect(() => {
    let temp = gaugeSensorList.map((gaugeSensor) => gaugeSensor.sensorId);
    if (temp.length > 1) temp = temp.slice(1);
    setSelectedSensorList(temp);
  }, [singleDevice, gaugeSensorList]);

  return (
    <div className={clsx(classes.root, styles?.root)}>
      <div className={classes.header}>
        <DateTimePicker
          inputVariant="filled"
          value={startTime}
          ampm={false}
          label={t('indoor:Start time')}
          variant="inline"
          onChange={(date) => {
            setStartTime(date || nowDate);
          }}
          format="yyyy-MM-dd HH:mm:ss"
        />
        <ArrowRightAltIcon />
        <DateTimePicker
          inputVariant="filled"
          value={endTime}
          ampm={false}
          label={t('indoor:End time')}
          variant="inline"
          onChange={(date) => {
            setEndTime(date || nowDate);
          }}
          format="yyyy-MM-dd HH:mm:ss"
        />
      </div>
      <div className={classes.body}>
        <MultiScaleLineCharts
          lineList={filteredLineList}
          startTime={startTime.getTime()}
          endTime={endTime.getTime()}
        />
      </div>
      <div className={classes.footer}>
        {gaugeSensorList.map((sensor, index) => (
          <Chip
            size="small"
            label={sensor.name}
            {...(selectedSensorList.indexOf(sensor.sensorId) === -1
              ? {
                  color: 'primary',
                  style: {
                    backgroundColor: colorTheme[index % colorTheme.length].value,
                    lineHeight: '24px',
                  },
                }
              : {
                  variant: 'outlined',
                  style: {
                    color: theme.palette.text.primary,
                    lineHeight: '24px',
                  },
                })}
            onClick={() => {
              handleChipClick(sensor.sensorId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(TimelineTab);
