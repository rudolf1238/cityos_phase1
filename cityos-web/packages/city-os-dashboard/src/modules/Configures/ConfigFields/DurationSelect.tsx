import { makeStyles } from '@material-ui/core/styles';
import React, { ChangeEvent, VoidFunctionComponent, memo, useCallback } from 'react';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { Duration } from '../../../libs/type';
import { isDurationType } from '../../../libs/validators';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useDurationTranslation from '../../../hooks/useDurationTranslation';

const useStyles = makeStyles((theme) => ({
  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },

  popover: {
    marginTop: theme.spacing(2),
  },
}));

interface DurationSelectProps {
  duration?: Duration;
  onChange: (duration: Duration) => void;
}

const DurationSelect: VoidFunctionComponent<DurationSelectProps> = ({
  duration = Duration.DAY,
  onChange,
}: DurationSelectProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');
  const { tDuration } = useDurationTranslation();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (isDurationType(value)) {
        onChange(value);
      }
    },
    [onChange],
  );

  return (
    <TextField
      variant="outlined"
      type="text"
      select
      value={duration}
      onChange={handleChange}
      fullWidth
      label={t('Duration')}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        IconComponent: ExpandMoreRoundedIcon,
        MenuProps: {
          getContentAnchorEl: null,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          className: classes.menu,
          MenuListProps: {
            className: classes.menuList,
          },
          PaperProps: {
            variant: 'outlined',
          },
          PopoverClasses: {
            root: classes.popover,
          },
        },
      }}
    >
      {Object.values(Duration).map((value) => (
        <MenuItem key={value} value={value}>
          {tDuration(value)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default memo(DurationSelect);
