import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback } from 'react';
import isEqual from 'lodash/isEqual';

import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';

import { LightControl, Schedule } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import MonthDaySelect from 'city-os-common/modules/timeSelect/MonthDaySelect';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { MonthDay, sortSchedules, useScheduleContext } from './ScheduleProvider';
import useMapTranslation from '../../../../../hooks/useMapTranslation';

import CopyIcon from '../../../../../assets/icon/copy.svg';

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    display: 'flex',
    gap: theme.spacing(2),
    alignSelf: 'flex-end',
  },
}));

const getNewSchedule = (date: MonthDay, controlList: LightControl[]): Schedule => {
  const newSchedule: Schedule = {
    startMonth: date.month,
    startDay: date.day,
    lightControls: controlList,
  };
  return newSchedule;
};

const getSchedulesAfterDelete = (
  currentSchedules: Schedule[],
  selectedSchedule: Schedule | null,
): Schedule[] => currentSchedules.filter((schedule) => !isEqual(schedule, selectedSchedule));

const hasZeroBrightness = (currentControlList: LightControl[]) =>
  currentControlList.some((control) => control.brightness === 0);

const DateSetting: VoidFunctionComponent = () => {
  const { t } = useMapTranslation(['common', 'map', 'variables']);
  const classes = useStyles();
  const { dispatch } = useStore();
  const {
    date,
    controlList,
    schedules,
    selectedSchedule,
    setDate,
    setSchedules,
    setSelectedSchedule,
    resetControlList,
    resetSchedules,
  } = useScheduleContext();

  const dateOnSelect = useCallback(
    ({ month, day }: { month?: number; day?: number }) => {
      setDate((prev) => ({
        month: month !== undefined ? month : prev.month,
        day: day !== undefined ? day : prev.day,
      }));
    },
    [setDate],
  );

  const addWithOverwriteChecking = useCallback(
    (currentSchedules: Schedule[], currentDate: MonthDay, currentControlList: LightControl[]) => {
      const newSchedule = getNewSchedule(currentDate, currentControlList);
      const newSchedules = [...currentSchedules];
      const sameDateId = newSchedules.findIndex(
        (schedule) =>
          schedule.startMonth === currentDate.month && schedule.startDay === currentDate.day,
      );

      if (sameDateId === -1) {
        newSchedules.push(newSchedule);
      } else {
        newSchedules[sameDateId] = newSchedule;
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t('map:Overwrite the changes into the same date_'),
          },
        });
      }

      resetSchedules(newSchedules);
    },
    [dispatch, t, resetSchedules],
  );

  const handleDone = useCallback(() => {
    if (hasZeroBrightness(controlList)) {
      const newSchedules = getSchedulesAfterDelete(schedules, selectedSchedule);
      addWithOverwriteChecking(newSchedules, date, controlList);
    } else {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'warning',
          message: t(
            'map:To save these settings, please set a Brightness percentage of at least 0_',
          ),
        },
      });
    }
  }, [date, schedules, controlList, selectedSchedule, addWithOverwriteChecking, t, dispatch]);

  const handleCopy = useCallback(() => {
    if (selectedSchedule) {
      const newSchedule = getNewSchedule(date, selectedSchedule.lightControls);
      const newSchedules = [...schedules, newSchedule];

      resetControlList(newSchedule.lightControls);
      setSchedules(sortSchedules(newSchedules));
      setSelectedSchedule(newSchedule);
    }
  }, [date, schedules, selectedSchedule, setSelectedSchedule, setSchedules, resetControlList]);

  const handleDelete = useCallback(() => {
    const newSchedules = getSchedulesAfterDelete(schedules, selectedSchedule);
    resetSchedules(newSchedules);
  }, [schedules, selectedSchedule, resetSchedules]);

  const handleAdd = useCallback(() => {
    if (hasZeroBrightness(controlList)) {
      addWithOverwriteChecking(schedules, date, controlList);
    } else {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'warning',
          message: t(
            'map:To save these settings, please set a Brightness percentage of at least 0_',
          ),
        },
      });
    }
  }, [controlList, schedules, date, addWithOverwriteChecking, t, dispatch]);

  return (
    <>
      <MonthDaySelect
        label={t('map:Start at')}
        monthValue={date.month}
        dayValue={date.day}
        onSelect={dateOnSelect}
      />
      <div className={classes.buttonWrapper}>
        {selectedSchedule ? (
          <>
            <ThemeIconButton
              key="done"
              color="primary"
              variant="contained"
              tooltip={t('map:Done')}
              onClick={handleDone}
              disabled={isEqual(selectedSchedule, {
                startMonth: date.month,
                startDay: date.day,
                lightControls: controlList,
              })}
            >
              <DoneIcon />
            </ThemeIconButton>
            <ThemeIconButton
              key="duplicate"
              color="primary"
              variant="contained"
              tooltip={t('common:Duplicate')}
              onClick={handleCopy}
              disabled={
                selectedSchedule.startMonth === date.month && selectedSchedule.startDay === date.day
              }
            >
              <CopyIcon />
            </ThemeIconButton>
            <ThemeIconButton
              key="delete"
              color="primary"
              tooltip={t('common:Delete')}
              onClick={handleDelete}
            >
              <DeleteIcon />
            </ThemeIconButton>
          </>
        ) : (
          <ThemeIconButton
            key="add"
            color="primary"
            variant="contained"
            tooltip={t('common:Add')}
            onClick={handleAdd}
            disabled={controlList.length === 0}
          >
            <AddIcon />
          </ThemeIconButton>
        )}
      </div>
    </>
  );
};

export default DateSetting;
