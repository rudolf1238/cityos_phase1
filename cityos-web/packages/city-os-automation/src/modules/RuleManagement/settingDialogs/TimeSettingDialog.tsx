import { makeStyles } from '@material-ui/core/styles';
import { rawTimeZones } from '@vvo/tzdb';
import { useForm } from 'react-hook-form';
import React, { VoidFunctionComponent, memo, useCallback, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { secOfMin } from 'city-os-common/libs/constants';
import getTimezoneString from 'city-os-common/libs/getTimezoneString';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import HourMinuteSelect from 'city-os-common/modules/timeSelect/HourMinuteSelect';
import MonthDaySelect from 'city-os-common/modules/timeSelect/MonthDaySelect';

import { EffectiveAt, EffectiveDate, EffectiveTime, WeekDay } from '../../../libs/type';
import WeekDayChips from '../../WeekDayChips';
import useAutomationTranslation from '../../../hooks/useAutomationTranslation';
import useWeekDayTranslation from '../../../hooks/useWeekDayTranslation';

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: theme.spacing(4, 8),
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },

  subtitleWrapper: {
    paddingTop: theme.spacing(1.5),
    color: theme.palette.text.subtitle,

    '& > h6': {
      padding: theme.spacing(0.5, 1),
    },
  },

  timezoneMenuList: {
    maxHeight: 275,
  },

  timeSelectSet: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  timeSelect: {
    width: 200,
  },

  helperText: {
    position: 'absolute',
    top: '100%',
  },

  weekDays: {
    gap: theme.spacing(1),
    padding: theme.spacing(0, 1),
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: theme.spacing(2),
  },
}));

export interface FormData
  extends Omit<EffectiveAt, 'effectiveDate' | 'effectiveTime'>,
    EffectiveDate,
    EffectiveTime {}

interface TimeSettingDialogProps {
  open: boolean;
  effectiveAt?: EffectiveAt;
  onClose: (submitData?: EffectiveAt) => void;
}

const TimeSettingDialog: VoidFunctionComponent<TimeSettingDialogProps> = ({
  open,
  effectiveAt,
  onClose,
}: TimeSettingDialogProps) => {
  const { t } = useAutomationTranslation(['common', 'automation']);
  const { tWeekDay } = useWeekDayTranslation();
  const classes = useStyles();

  const { handleSubmit, register, watch, setValue } = useForm<FormData>({
    mode: 'onChange',
  });

  const timezone = watch('timezone');
  const startMonth = watch('startMonth');
  const startDay = watch('startDay');
  const endMonth = watch('endMonth');
  const endDay = watch('endDay');
  const fromHour = watch('fromHour');
  const fromMinute = watch('fromMinute');
  const toHour = watch('toHour');
  const toMinute = watch('toMinute');
  const effectiveWeekday = watch('effectiveWeekday');

  const onStartDateSelect = useCallback(
    ({ month, day }: { month?: number; day?: number }) => {
      if (month !== undefined) setValue('startMonth', month);
      if (day !== undefined) setValue('startDay', day);
    },
    [setValue],
  );

  const onToDateSelect = useCallback(
    ({ month, day }: { month?: number; day?: number }) => {
      if (month !== undefined) setValue('endMonth', month);
      if (day !== undefined) setValue('endDay', day);
    },
    [setValue],
  );

  const onStartTimeSelect = useCallback(
    ({ hour, minute }: { hour?: number; minute?: number }) => {
      if (hour !== undefined) setValue('fromHour', hour);
      if (minute !== undefined) setValue('fromMinute', minute);
    },
    [setValue],
  );

  const onToTimeSelect = useCallback(
    ({ hour, minute }: { hour?: number; minute?: number }) => {
      if (hour !== undefined) setValue('toHour', hour);
      if (minute !== undefined) setValue('toMinute', minute);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (submitData: FormData) => {
      onClose({
        timezone: submitData.timezone,
        effectiveDate: {
          startMonth: submitData.startMonth,
          startDay: submitData.startDay,
          endMonth: submitData.endMonth,
          endDay: submitData.endDay,
        },
        effectiveTime: {
          fromHour: submitData.fromHour,
          fromMinute: submitData.fromMinute,
          toHour: submitData.toHour,
          toMinute: submitData.toMinute,
        },
        effectiveWeekday: submitData.effectiveWeekday,
      });
    },
    [onClose],
  );

  const onWeekDayClick = useCallback(
    (dayNumber: WeekDay) => {
      const isEffective = effectiveWeekday.includes(dayNumber);
      const newWeekDay = isEffective
        ? effectiveWeekday.filter((day) => day !== dayNumber)
        : [...effectiveWeekday, dayNumber];
      setValue('effectiveWeekday', newWeekDay);
    },
    [effectiveWeekday, setValue],
  );

  const weekDayFormatter = useCallback((dayNumber: WeekDay) => tWeekDay(dayNumber).slice(0, 2), [
    tWeekDay,
  ]);

  useEffect(() => {
    if (!open) return;
    const newTimezone = effectiveAt?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    setValue(
      'timezone',
      newTimezone && rawTimeZones.some(({ name }) => name === newTimezone) ? newTimezone : '',
    );
    setValue('startMonth', effectiveAt?.effectiveDate.startMonth ?? 1);
    setValue('startDay', effectiveAt?.effectiveDate.startDay ?? 1);
    setValue('endMonth', effectiveAt?.effectiveDate.endMonth ?? 12);
    setValue('endDay', effectiveAt?.effectiveDate.endDay ?? 31);
    setValue('fromHour', effectiveAt?.effectiveTime.fromHour ?? 0);
    setValue('fromMinute', effectiveAt?.effectiveTime.fromMinute ?? 0);
    setValue('toHour', effectiveAt?.effectiveTime.toHour ?? 23);
    setValue('toMinute', effectiveAt?.effectiveTime.toMinute ?? 59);
    setValue('effectiveWeekday', effectiveAt?.effectiveWeekday || [1, 2, 3, 4, 5, 6, 7]);
  }, [effectiveAt, open, setValue]);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose()}
      title={t('automation:Set Effective Date and Time')}
      classes={{
        dialog: classes.dialog,
      }}
      content={
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <div className={classes.subtitleWrapper}>
            <Typography variant="subtitle2">{t('common:Date')}</Typography>
            <Divider />
          </div>
          <TextField
            variant="outlined"
            type="text"
            label={t('common:Time Zone')}
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={timezone}
            inputProps={register('timezone', {
              required: true,
            })}
            select
            SelectProps={{
              IconComponent: ExpandMoreRoundedIcon,
              MenuProps: {
                getContentAnchorEl: null,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                MenuListProps: {
                  className: classes.timezoneMenuList,
                },
                PaperProps: {
                  variant: 'outlined',
                },
              },
            }}
          >
            {rawTimeZones.map(({ name, rawOffsetInMinutes }) => (
              <MenuItem key={name} value={name}>
                {getTimezoneString(name, rawOffsetInMinutes * secOfMin)}
              </MenuItem>
            ))}
          </TextField>
          <div className={classes.timeSelectSet}>
            <MonthDaySelect
              label={t('automation:Start Date')}
              monthValue={startMonth}
              dayValue={startDay}
              className={classes.timeSelect}
              PopperProps={{
                disablePortal: false,
                className: classes.timeSelect,
              }}
              onSelect={onStartDateSelect}
            />
            <div>~</div>
            <MonthDaySelect
              label={t('automation:To Date')}
              monthValue={endMonth}
              dayValue={endDay}
              className={classes.timeSelect}
              PopperProps={{
                disablePortal: false,
                className: classes.timeSelect,
              }}
              onSelect={onToDateSelect}
            />
          </div>
          <div className={classes.subtitleWrapper}>
            <Typography variant="subtitle2">{t('automation:Days of The Week')}</Typography>
            <Divider />
          </div>
          <WeekDayChips
            effectiveWeekday={effectiveWeekday}
            className={classes.weekDays}
            onClick={onWeekDayClick}
            formatter={weekDayFormatter}
          />
          <div className={classes.subtitleWrapper}>
            <Typography variant="subtitle2">{t('automation:Time')}</Typography>
            <Divider />
          </div>
          <div className={classes.timeSelectSet}>
            <HourMinuteSelect
              label={t('automation:Start Time')}
              hourValue={fromHour}
              minuteValue={fromMinute}
              className={classes.timeSelect}
              PopperProps={{
                disablePortal: false,
                className: classes.timeSelect,
              }}
              onSelect={onStartTimeSelect}
            />
            <div>~</div>
            <HourMinuteSelect
              label={t('automation:To Time')}
              hourValue={toHour}
              minuteValue={toMinute}
              className={classes.timeSelect}
              PopperProps={{
                disablePortal: false,
                className: classes.timeSelect,
              }}
              onSelect={onToTimeSelect}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            size="small"
            color="primary"
            className={classes.dialogButton}
          >
            {t('common:OK')}
          </Button>
        </form>
      }
    />
  );
};

export default memo(TimeSettingDialog);
