import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import { DeviceType } from 'city-os-common/libs/schema';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';

import useAutomationTranslation from '../hooks/useAutomationTranslation';

const useStyles = makeStyles((theme) => ({
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  deviceIcon: {
    color: theme.palette.background.miniTab,
  },

  list: {
    maxHeight: 280,
  },
}));

interface DeviceTypeSelectorProps
  extends Omit<TextFieldProps, 'select' | 'type' | 'children' | 'value'> {
  value?: DeviceType;
}

const DeviceTypeSelector: VoidFunctionComponent<DeviceTypeSelectorProps> = ({
  value,
  SelectProps,
  InputLabelProps,
  ...props
}: DeviceTypeSelectorProps) => {
  const { t } = useAutomationTranslation('common');
  const { tDevice } = useDeviceTranslation();
  const classes = useStyles();

  return (
    <TextField
      type="text"
      variant="outlined"
      label={t('Device Type')}
      select
      fullWidth
      value={value || ''}
      {...props}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{
        displayEmpty: true,
        IconComponent: ExpandMoreRoundedIcon,
        renderValue: () => (value ? tDevice(value) : '---'),
        ...SelectProps,
        MenuProps: {
          getContentAnchorEl: null,
          ...SelectProps?.MenuProps,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
            ...SelectProps?.MenuProps?.anchorOrigin,
          },
          PaperProps: {
            variant: 'outlined',
            ...SelectProps?.MenuProps?.PaperProps,
          },
          MenuListProps: {
            ...SelectProps?.MenuProps?.MenuListProps,
            className: clsx(classes.list, SelectProps?.MenuProps?.MenuListProps?.className),
          },
        },
      }}
    >
      {Object.values(DeviceType).map((type) => (
        <MenuItem key={type} value={type} className={classes.menuItem}>
          {tDevice(type)}
          <DeviceIcon type={type} className={classes.deviceIcon} />
        </MenuItem>
      ))}
    </TextField>
  );
};

export default memo(DeviceTypeSelector);
