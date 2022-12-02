import { differenceInDays, subDays } from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { ErrorType } from 'city-os-common/modules/videoPlayer/type';
import { isDate } from 'city-os-common/libs/validators';
import { roundDownDate } from 'city-os-common/libs/roundDate';
import formatDate from 'city-os-common/libs/formatDate';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import DateTimeField from 'city-os-common/modules/DateTimeField';
import ScheduleIcon from 'city-os-common/assets/icon/schedule.svg';

import { VideoStatusRecord } from '../../libs/type';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';

const useStyles = makeStyles((theme) => ({
  timeButton: {
    flex: 1,
    justifyContent: 'flex-start',
    height: 54,
  },

  time: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'flex-start',
    paddingLeft: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.pageContainer.title,
  },

  dialog: {
    padding: theme.spacing(6, 9, 5),
  },

  dialogTitle: {
    padding: 0,
  },

  durationField: {
    display: 'flex',
    flex: 0,
    gap: theme.spacing(1),
    padding: theme.spacing(9, 0),
  },

  field: {
    minWidth: 220,
  },

  tilde: {
    display: 'flex',
    alignItems: 'center',
    height: 56,
  },

  buttons: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',

    '& button:first-of-type': {
      position: 'absolute',
      left: 0,
    },
  },
}));

const maxDayDuration = 3;

interface DatetimeForm {
  fromDate: Date;
  toDate: Date;
}

const PlaybackTimePicker: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useSurveillanceTranslation(['common', 'surveillance', 'variables']);
  const {
    playbackRange,
    pageDeviceIds,
    setPlaybackRange,
    setPlaybackTime,
    setAutoplay,
    setVideoStatusRecord,
  } = useSurveillanceContext();
  const [openSetting, setOpenSetting] = useState(false);

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useForm<DatetimeForm>({
    mode: 'onChange',
    defaultValues: {
      fromDate: roundDownDate(subDays(new Date(), 1), 'minute'),
      toDate: roundDownDate(new Date(), 'minute'),
    },
  });

  const fromDate = watch('fromDate');
  const toDate = watch('toDate');

  const handleOpenDialog = useCallback(() => {
    setValue('fromDate', roundDownDate(playbackRange?.from || subDays(new Date(), 1), 'minute'), {
      shouldValidate: true,
    });
    setValue('toDate', roundDownDate(playbackRange?.to || new Date(), 'minute'), {
      shouldValidate: true,
    });
    void trigger(['fromDate', 'toDate']); // HACK: deps cannot update formState.errors
    setOpenSetting(true);
  }, [playbackRange, setValue, trigger]);

  const handleCloseDialog = useCallback(() => {
    setOpenSetting(false);
  }, []);

  const handleNowClick = useCallback(() => {
    setPlaybackRange(undefined);
    setPlaybackTime(null);
    handleCloseDialog();
  }, [handleCloseDialog, setPlaybackRange, setPlaybackTime]);

  const onSubmit = useCallback(
    (submitData: DatetimeForm) => {
      setPlaybackRange({ from: submitData.fromDate, to: submitData.toDate });
      setPlaybackTime(submitData.fromDate.getTime());
      setVideoStatusRecord((prev) =>
        pageDeviceIds.reduce<VideoStatusRecord>(
          (record, deviceId) =>
            deviceId
              ? {
                  ...record,
                  [deviceId]: {
                    canPlay: record[deviceId]?.canPlay ?? false,
                    nextClipStartTime: record[deviceId]?.nextClipStartTime ?? null,
                    changingStartTime:
                      record[deviceId]?.errorType === ErrorType.NO_CAMERA_ID
                        ? undefined
                        : submitData.fromDate.getTime(),
                    errorType: record[deviceId]?.errorType,
                  },
                }
              : record,
          prev,
        ),
      );
      setAutoplay(false);
      handleCloseDialog();
    },
    [
      handleCloseDialog,
      pageDeviceIds,
      setAutoplay,
      setPlaybackRange,
      setPlaybackTime,
      setVideoStatusRecord,
    ],
  );

  useEffect(() => {
    register('fromDate', {
      required: true,
      validate: {
        minDate: (value) => {
          const message = t('common:It should be an earlier date time_');
          const currentToDate = getValues('toDate');
          return value < currentToDate || message;
        },
      },
      deps: 'toDate',
    });
    register('toDate', {
      required: true,
      validate: (value) => {
        const message = t('common:The period cannot be over {{count}} day_', {
          count: maxDayDuration,
        });
        const currentFromDate = getValues('fromDate');
        return differenceInDays(value, currentFromDate) < maxDayDuration || message;
      },
      deps: 'fromDate',
    });
  }, [getValues, register, t]);

  return (
    <>
      <Button
        startIcon={<ScheduleIcon />}
        onClick={handleOpenDialog}
        className={classes.timeButton}
      >
        <div className={classes.time}>
          {playbackRange ? (
            <>
              <Typography variant="body2">
                {formatDate(playbackRange.from, t('variables:dateFormat.common.dateTimeField'))} ~
              </Typography>
              <Typography variant="body2">
                {formatDate(playbackRange.to, t('variables:dateFormat.common.dateTimeField'))}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">{t('common:Now')}</Typography>
          )}
        </div>
      </Button>
      <BaseDialog
        open={openSetting}
        title={t('surveillance:Set Date and Time')}
        titleAlign="center"
        classes={{ dialog: classes.dialog, title: classes.dialogTitle }}
        onClose={handleCloseDialog}
        content={
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={classes.durationField}>
              <div className={classes.field}>
                <DateTimeField
                  disableFuture
                  label={t('common:From Datetime')}
                  value={fromDate}
                  maxDate={toDate}
                  onChange={(date) => {
                    if (!isDate(date)) return;
                    setValue('fromDate', date, { shouldValidate: true });
                    void trigger('toDate');
                  }}
                  error={!!errors.fromDate}
                  helperText={errors.fromDate?.message}
                />
              </div>
              <div className={classes.tilde}>~</div>
              <div className={classes.field}>
                <DateTimeField
                  disableFuture
                  minDate={fromDate}
                  label={t('common:To Datetime')}
                  value={toDate}
                  onChange={(date) => {
                    if (!isDate(date)) return;
                    const now = new Date();
                    setValue('toDate', date > now ? now : date, { shouldValidate: true });
                    void trigger('fromDate');
                  }}
                  error={!!errors.toDate}
                  helperText={errors.toDate?.message}
                />
              </div>
            </div>
            <div className={classes.buttons}>
              <Button color="primary" onClick={handleNowClick}>
                {t('common:Now')}
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={!isValid}>
                {t('common:OK')}
              </Button>
            </div>
          </form>
        }
      />
    </>
  );
};

export default memo(PlaybackTimePicker);
