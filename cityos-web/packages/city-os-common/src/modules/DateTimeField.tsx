import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import { DateTimePicker, DateTimePickerProps } from '@material-ui/pickers';
import InputAdornment from '@material-ui/core/InputAdornment';

import useCommonTranslation from '../hooks/useCommonTranslation';

import DateRangeIcon from '../assets/icon/dateRange.svg';
import ScheduleIcon from '../assets/icon/schedule.svg';
import TimeIcon from '../assets/icon/time.svg';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1),
  },

  hiddenIndicator: {
    '& .MuiPickerDTTabs-tabs .MuiTabs-indicator': {
      maxWidth: 0,
    },
  },
}));

const DateTimeField: VoidFunctionComponent<DateTimePickerProps> = ({
  InputProps,
  InputLabelProps,
  PopoverProps,
  ...props
}: DateTimePickerProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('variables');

  return (
    <DateTimePicker
      ampm={false}
      variant="inline"
      inputVariant="outlined"
      format={t('dateFormat.common.dateTimeField')}
      InputProps={{
        placeholder: t('dateFormat.common.dateTimeField').toUpperCase(),
        endAdornment: (
          <InputAdornment position="end">
            <ScheduleIcon />
          </InputAdornment>
        ),
        ...InputProps,
      }}
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      PopoverProps={{
        onEntered: () => {
          // tabs indicator get wrong position when wrapped with <Grow />, resize to fix the issue
          // see https://github.com/mui-org/material-ui/issues/24824 for more information
          window.dispatchEvent(new CustomEvent('resize'));
        },
        ...PopoverProps,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
          ...PopoverProps?.anchorOrigin,
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left',
          ...PopoverProps?.transformOrigin,
        },
        classes: {
          paper: classes.paper,
          ...PopoverProps?.classes,
        },
      }}
      dateRangeIcon={<DateRangeIcon />}
      timeIcon={<TimeIcon />}
      {...props}
    />
  );
};

export default memo(DateTimeField);
