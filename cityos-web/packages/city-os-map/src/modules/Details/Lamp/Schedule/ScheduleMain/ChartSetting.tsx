import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback } from 'react';
import clsx from 'clsx';
import isEqual from 'lodash/isEqual';

import DoneIcon from '@material-ui/icons/Done';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { LightControl } from 'city-os-common/libs/schema';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import HourMinuteSelect from 'city-os-common/modules/timeSelect/HourMinuteSelect';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { HourMinute, useScheduleContext } from './ScheduleProvider';
import useMapTranslation from '../../../../../hooks/useMapTranslation';

import AddClockIcon from '../../../../../assets/icon/add-clock.svg';
import BrightnessSelect from '../../BrightnessSelect';
import ScheduleChart from '../ScheduleChart';

const useStyles = makeStyles((theme) => ({
  schedulePaper: {
    padding: theme.spacing(3),
  },

  buttonWrapper: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
  },

  scheduleChart: {
    height: theme.spacing(27.5),
  },

  select: {
    minWidth: theme.spacing(13.5),
  },

  brightness: {
    marginRight: 'auto',
  },
}));

const getNewControl = (time: HourMinute, brightness: number): LightControl => ({
  hour: time.hour,
  minute: time.minute,
  brightness,
});

const getControlListAfterDelete = (
  currentControlList: LightControl[],
  selectedControl: LightControl | null,
): LightControl[] => {
  const newControlList = [...currentControlList];
  const selectedIndex = newControlList.findIndex((control) => isEqual(control, selectedControl));
  newControlList.splice(selectedIndex, 1);
  return newControlList;
};

const getControlListAfterAdd = (
  currentControlList: LightControl[],
  time: HourMinute,
  brightness: number,
): LightControl[] => {
  const newControlList = [...currentControlList];
  const newControl = getNewControl(time, brightness);

  const index = newControlList.findIndex(
    (control) =>
      control.brightness === brightness ||
      (control.hour === time.hour && control.minute === time.minute),
  );

  if (index !== -1) {
    newControlList[index] = newControl;
  } else {
    newControlList.push(newControl);
  }
  return newControlList;
};

const ChartSetting: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useMapTranslation(['common', 'column', 'map']);

  const {
    time,
    brightness,
    controlList,
    selectedControl,
    setTime,
    setBrightness,
    setSelectedControl,
    resetControlList,
  } = useScheduleContext();

  const timeOnSelect = useCallback(
    ({ hour, minute }: { hour?: number; minute?: number }) => {
      setTime((prev) => ({
        hour: hour !== undefined ? hour : prev.hour,
        minute: minute !== undefined ? minute : prev.minute,
      }));
    },
    [setTime],
  );

  const brightnessOnSelect = useCallback(
    (newValue: number) => {
      setBrightness(newValue);
    },
    [setBrightness],
  );

  const schedulePointOnSelect = useCallback(
    (newValue: LightControl) => {
      setSelectedControl(newValue);
      setTime({ hour: newValue.hour, minute: newValue.minute });
      setBrightness(newValue.brightness);
    },
    [setSelectedControl, setTime, setBrightness],
  );

  const handleChartAdd = useCallback(() => {
    if (brightness !== undefined) {
      const newControlList = getControlListAfterAdd(controlList, time, brightness);
      resetControlList(newControlList);
    }
  }, [brightness, time, controlList, resetControlList]);

  const handleChartDone = useCallback(() => {
    if (brightness !== undefined) {
      const listAfterDelete = getControlListAfterDelete(controlList, selectedControl);
      const newControlList = getControlListAfterAdd(listAfterDelete, time, brightness);
      resetControlList(newControlList);
    }
  }, [brightness, controlList, time, selectedControl, resetControlList]);

  const handleChartDelete = useCallback(() => {
    const newControlList = getControlListAfterDelete(controlList, selectedControl);
    resetControlList(newControlList);
  }, [controlList, selectedControl, resetControlList]);

  return (
    <Paper className={classes.schedulePaper}>
      <Grid container wrap="wrap" spacing={1}>
        <Grid item xs={3} className={classes.select}>
          <HourMinuteSelect
            hourValue={time.hour}
            minuteValue={time.minute}
            popperSize="extended"
            label={t('map:Start at')}
            PopperProps={{
              placement: 'bottom-end',
            }}
            minutePerStep={5}
            onSelect={timeOnSelect}
          />
        </Grid>
        <Grid item xs={3} className={clsx(classes.select, classes.brightness)}>
          <BrightnessSelect
            label={t('column:Brightness')}
            value={brightness}
            baseNumber={20}
            onSelect={brightnessOnSelect}
          />
        </Grid>
        <Grid item className={classes.buttonWrapper}>
          {selectedControl ? (
            <>
              <ThemeIconButton color="primary" onClick={handleChartDone} tooltip={t('common:Save')}>
                <DoneIcon />
              </ThemeIconButton>
              <ThemeIconButton
                color="primary"
                onClick={handleChartDelete}
                tooltip={t('common:Delete')}
              >
                <DeleteIcon />
              </ThemeIconButton>
            </>
          ) : (
            <ThemeIconButton
              color="primary"
              disabled={brightness === null}
              onClick={handleChartAdd}
              tooltip={t('map:Add Time')}
            >
              <AddClockIcon />
            </ThemeIconButton>
          )}
        </Grid>
        <Grid item xs={12} className={classes.scheduleChart}>
          <ScheduleChart
            controlList={controlList}
            selectedPoint={selectedControl}
            onSelect={schedulePointOnSelect}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ChartSetting;
