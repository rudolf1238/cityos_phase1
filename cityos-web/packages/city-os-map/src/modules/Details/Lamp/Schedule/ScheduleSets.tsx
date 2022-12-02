import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import isEqual from 'lodash/isEqual';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { Schedule } from 'city-os-common/libs/schema';
import formatDate from 'city-os-common/libs/formatDate';

import CircleCheckbox from 'city-os-common/modules/Checkbox';

import useMapTranslation from '../../../../hooks/useMapTranslation';

import ScheduleChart from './ScheduleChart';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2, 2, 2.5),
    overflow: 'auto',
  },

  scheduleWrapper: {
    flexShrink: 0,
  },

  schedule: {
    cursor: 'pointer',
    padding: theme.spacing(0.5),
    height: theme.spacing(20),
    overflow: 'visible',
    textAlign: 'center',
  },

  checkedSchedule: {
    backgroundColor: theme.palette.action.selected,
  },

  typography: {
    height: theme.spacing(2),
  },

  chart: {
    height: `calc(100% - ${theme.spacing(2)}px)`,
  },

  checkbox: {
    transform: 'translateY(-50%)',
    backgroundColor: theme.palette.background.paper,

    '&:hover': {
      backgroundColor: ` !important ${theme.palette.background.paper}`,
    },
  },
}));

interface ScheduleOptionProps {
  schedule: Schedule;
  checked: boolean;
  onSelect: (selected: Schedule | null) => void;
}

const ScheduleOption: VoidFunctionComponent<ScheduleOptionProps> = ({
  schedule,
  checked,
  onSelect,
}: ScheduleOptionProps) => {
  const { t } = useMapTranslation('variables');
  const classes = useStyles();

  const handleClick = useCallback(() => {
    onSelect(checked ? null : schedule);
  }, [schedule, checked, onSelect]);

  return (
    <Card
      onClick={handleClick}
      className={clsx(classes.schedule, checked && classes.checkedSchedule)}
      elevation={0}
    >
      <Typography variant="caption" component="div" className={classes.typography}>
        {formatDate(
          {
            month: schedule.startMonth - 1,
            date: schedule.startDay,
          },
          t('dateFormat.map.schedule.sets'),
        )}
      </Typography>
      <div className={classes.chart}>
        <ScheduleChart controlList={schedule.lightControls} variant="simple" editable={false} />
      </div>
      {checked && <CircleCheckbox className={classes.checkbox} checked />}
    </Card>
  );
};

interface ScheduleSetsProps {
  schedules: Schedule[];
  selectedSchedule?: Schedule | null;
  onSelect?: (schedule: Schedule | null) => void;
}

const ScheduleSets: VoidFunctionComponent<ScheduleSetsProps> = ({
  schedules,
  selectedSchedule: initialSelected,
  onSelect,
}: ScheduleSetsProps) => {
  const classes = useStyles();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>();

  const optionOnSelect = useCallback(
    (selected) => {
      setSelectedSchedule(selected);
      if (onSelect) {
        onSelect(selected);
      }
    },
    [onSelect],
  );

  useEffect(() => {
    setSelectedSchedule(initialSelected);
  }, [initialSelected]);

  return (
    <Paper variant="outlined" className={classes.paper}>
      <Grid container wrap="nowrap" spacing={2}>
        {schedules.map((schedule) => (
          <Grid
            item
            md={3}
            sm={4}
            xs={4}
            key={`${schedule.startMonth}/${schedule.startDay}`}
            className={classes.scheduleWrapper}
          >
            <ScheduleOption
              schedule={schedule}
              checked={isEqual(schedule, selectedSchedule)}
              onSelect={optionOnSelect}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ScheduleSets;
