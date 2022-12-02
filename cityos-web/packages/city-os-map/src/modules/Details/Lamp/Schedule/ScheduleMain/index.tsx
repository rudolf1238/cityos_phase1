import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import isEqual from 'lodash/isEqual';

import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { LightControl, ManualSchedule, Schedule, Timezone } from 'city-os-common/libs/schema';
import useHiddenStyles from 'city-os-common/styles/hidden';

import ScheduleProvider, {
  BrightnessValue,
  HourMinute,
  MonthDay,
  ScheduleContextValue,
  ScheduleInputItem,
  getTimezoneListString,
  sortSchedules,
} from './ScheduleProvider';
import useMapTranslation from '../../../../../hooks/useMapTranslation';

import ChartSetting from './ChartSetting';
import DateSetting from './DateSetting';
import EnableController from '../../EnableController';
import ScheduleSets from '../ScheduleSets';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',

    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  content: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    backgroundColor: theme.palette.background.lightContainer,
    padding: theme.spacing(2, 7.5),
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  dateSetting: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
  },

  setsTitle: {
    marginBottom: theme.spacing(1),
  },

  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },

  button: {
    width: 272,
  },
}));

interface ScheduleMainProps {
  alignManualSchedule: Required<ManualSchedule>;
  scheduleInputs: ScheduleInputItem[];
  callUpdateLampSchedule: (
    newSchedules: Schedule[],
    newEnable: boolean,
    targetSchedules: ScheduleInputItem[],
  ) => Promise<void>;
}

const ScheduleMain: VoidFunctionComponent<ScheduleMainProps> = ({
  alignManualSchedule: initialSchedule,
  scheduleInputs,
  callUpdateLampSchedule,
}: ScheduleMainProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { t } = useMapTranslation(['common', 'map', 'map']);

  const [enabled, setEnabled] = useState<boolean>(initialSchedule.enableManualSchedule || false);
  const [schedules, setSchedules] = useState<Schedule[]>(
    sortSchedules(initialSchedule.schedules || []),
  );

  const [date, setDate] = useState<MonthDay>({ month: 1, day: 1 });
  const [time, setTime] = useState<HourMinute>({ hour: 0, minute: 0 });
  const [brightness, setBrightness] = useState<BrightnessValue>();
  const [controlList, setControlList] = useState<LightControl[]>([]);

  const [selectedControl, setSelectedControl] = useState<LightControl | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const handleEnabled = useCallback(() => setEnabled((prev) => !prev), []);

  useEffect(() => {
    setEnabled(initialSchedule.enableManualSchedule || false);
    setSchedules(sortSchedules(initialSchedule.schedules || []));
  }, [initialSchedule]);

  const resetControlList = useCallback((newControlList: LightControl[]) => {
    setControlList(newControlList);
    setTime({ hour: 0, minute: 0 });
    setBrightness(undefined);
    setSelectedControl(null);
  }, []);

  const resetSchedules = useCallback(
    (newSchedules: Schedule[]) => {
      resetControlList([]);
      setSchedules(sortSchedules(newSchedules));
      setDate({ month: 1, day: 1 });
      setSelectedSchedule(null);
    },
    [resetControlList],
  );

  const scheduleSetOnSelect = useCallback(
    (selected: Schedule | null) => {
      setSelectedSchedule(selected);
      if (selected) {
        setDate({ month: selected.startMonth, day: selected.startDay });
        resetControlList(selected.lightControls);
      } else {
        setDate({ month: 1, day: 1 });
        resetControlList([]);
      }
    },
    [resetControlList],
  );

  const handleSave = useCallback(async () => {
    if (typeof enabled !== 'boolean') return;
    await callUpdateLampSchedule(schedules, enabled, scheduleInputs);
  }, [scheduleInputs, schedules, enabled, callUpdateLampSchedule]);

  const handleCancel = useCallback(() => {
    setEnabled(initialSchedule.enableManualSchedule || false);
    resetSchedules(initialSchedule.schedules || []);
  }, [initialSchedule, resetSchedules]);

  const contextValue = useMemo<ScheduleContextValue>(
    () => ({
      date,
      time,
      brightness,
      controlList,
      schedules,
      selectedControl,
      selectedSchedule,
      setDate,
      setTime,
      setBrightness,
      setControlList,
      setSchedules,
      setSelectedControl,
      setSelectedSchedule,
      resetControlList,
      resetSchedules,
    }),
    [
      date,
      time,
      brightness,
      controlList,
      schedules,
      selectedControl,
      selectedSchedule,
      resetControlList,
      resetSchedules,
    ],
  );

  const timezoneString = useMemo(
    () =>
      getTimezoneListString(
        scheduleInputs.reduce<Timezone[]>(
          (acc, curr) => (curr.timezone ? acc.concat(curr.timezone) : acc),
          [],
        ),
      ),
    [scheduleInputs],
  );

  return (
    <ScheduleProvider value={contextValue}>
      <Container maxWidth="md" disableGutters className={classes.root}>
        <EnableController
          isEnabled={enabled || false}
          item={t('map:Schedule')}
          timezone={timezoneString}
          onChange={handleEnabled}
        />
        <Collapse in={enabled}>
          <div className={classes.content}>
            <Grid container spacing={3}>
              <Grid item md={7} sm={12} xs={12}>
                <ChartSetting />
              </Grid>
              <Grid item sm={4} className={hiddenClasses.mdUpHidden} />
              <Grid item md={5} sm={8} xs={12} className={classes.dateSetting}>
                <DateSetting />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" align="left" className={classes.setsTitle}>
                  {t('map:Schedule Lists')}
                </Typography>
                <ScheduleSets
                  schedules={schedules}
                  selectedSchedule={selectedSchedule}
                  onSelect={scheduleSetOnSelect}
                />
              </Grid>
            </Grid>
          </div>
        </Collapse>
        <div className={classes.buttons}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleCancel}
          >
            {t('common:Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            // Save button should be disabled when current values is same as initial values
            disabled={
              (isEqual(initialSchedule.schedules, schedules) &&
                initialSchedule.enableManualSchedule === enabled) ||
              schedules.length === 0
            }
            className={classes.button}
            onClick={handleSave}
          >
            {t('common:Save')}
          </Button>
        </div>
      </Container>
    </ScheduleProvider>
  );
};

export default ScheduleMain;
