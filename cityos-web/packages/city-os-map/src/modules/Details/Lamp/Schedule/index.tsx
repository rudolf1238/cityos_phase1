import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo } from 'react';
import isEqual from 'lodash/isEqual';

import { Schedule as ScheduleType } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import { ScheduleInput } from '../types';
import { ScheduleInputItem } from './ScheduleMain/ScheduleProvider';
import {
  UPDATE_LAMP_SCHEDULE,
  UpdateLampSchedulePayload,
  UpdateLampScheduleResponse,
} from '../../../../api/updateLampSchedule';
import useMapTranslation from '../../../../hooks/useMapTranslation';

import Alignment from './Alignment';
import ScheduleMain from './ScheduleMain';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    minWidth: theme.spacing(85),

    [theme.breakpoints.down('sm')]: {
      width: '100%',
      minWidth: 'auto',
    },
  },
}));

interface ScheduleProps {
  scheduleInputs: ScheduleInputItem[];
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

const Schedule: VoidFunctionComponent<ScheduleProps> = ({
  scheduleInputs,
  onChanged,
  onUpdating,
}: ScheduleProps) => {
  const classes = useStyles();
  const { t } = useMapTranslation('common');
  const { dispatch } = useStore();
  const [updateLampSchedule, { loading }] = useMutation<
    UpdateLampScheduleResponse,
    UpdateLampSchedulePayload
  >(UPDATE_LAMP_SCHEDULE);

  const isConflict = useMemo<boolean>(() => {
    const baseItem = scheduleInputs[0].manualSchedule;
    for (let i = 1; i <= scheduleInputs.length - 1; i += 1) {
      const compareItem = scheduleInputs[i].manualSchedule;
      if (
        compareItem.enableManualSchedule !== baseItem.enableManualSchedule ||
        (compareItem.enableManualSchedule && !isEqual(compareItem.schedules, baseItem.schedules))
      ) {
        return true;
      }
    }
    return false;
  }, [scheduleInputs]);

  const isAllDisable = useMemo(
    () =>
      scheduleInputs.length === 1
        ? false
        : scheduleInputs.every(({ manualSchedule }) => !manualSchedule.enableManualSchedule),
    [scheduleInputs],
  );

  const alignManualSchedule = useMemo(
    () =>
      !isConflict
        ? {
            enableManualSchedule: scheduleInputs[0].manualSchedule.enableManualSchedule,
            schedules: isAllDisable ? [] : scheduleInputs[0].manualSchedule.schedules,
          }
        : {
            enableManualSchedule: true,
            schedules: [],
          },
    [isConflict, isAllDisable, scheduleInputs],
  );

  const callUpdateLampSchedule = useCallback(
    async (
      newSchedules: ScheduleType[] | null,
      newEnable: boolean,
      targetSchedules: ScheduleInputItem[],
    ) => {
      // covert to updateLampSchedule schema
      const schedulesSetting: ScheduleInput[] | undefined = newSchedules
        ? newSchedules.map(({ startMonth, startDay, lightControls }) => ({
            startMonth,
            startDay,
            lightControlInputs: lightControls.map(
              ({ hour, minute, brightness: controlBrightness }) => ({
                hour,
                minute,
                brightness: controlBrightness,
              }),
            ),
          }))
        : undefined;

      const updateResult = await Promise.allSettled(
        targetSchedules.map(async ({ deviceId }) => {
          await updateLampSchedule({
            variables: {
              deviceId,
              lightScheduleInput: {
                manualScheduleInput: {
                  enableManualSchedule: newEnable,
                  // only save schedules if enable
                  schedules: newEnable ? schedulesSetting : undefined,
                },
              },
            },
          });
        }),
      );
      const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
      if (rejectedResults.length === 0) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('The value has been set successfully_'),
          },
        });
        onChanged();
      } else {
        if (D_DEBUG) console.log(rejectedResults);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('Failed to save_ Please try again_'),
          },
        });
      }
      onChanged();
    },
    [updateLampSchedule, onChanged, dispatch, t],
  );

  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);

  return (
    <div className={classes.root}>
      <ScheduleMain
        scheduleInputs={scheduleInputs}
        alignManualSchedule={alignManualSchedule}
        callUpdateLampSchedule={callUpdateLampSchedule}
      />
      {isConflict && (
        <Alignment
          scheduleInputs={scheduleInputs}
          callUpdateLampSchedule={callUpdateLampSchedule}
        />
      )}
    </div>
  );
};

export default Schedule;
