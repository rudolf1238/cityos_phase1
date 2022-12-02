import React, { VoidFunctionComponent, memo } from 'react';
import capitalize from 'lodash/capitalize';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { BaseSensorValueFieldProps } from './type';
import { SwitchValue } from '../../libs/type';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

export type SwitchTypeFieldProps = BaseSensorValueFieldProps;

const SwitchTypeField: VoidFunctionComponent<SwitchTypeFieldProps> = ({
  disabled,
  value,
  InputLabelProps,
  SelectProps,
  ...props
}: SwitchTypeFieldProps) => {
  const { t } = useAutomationTranslation('automation');

  return (
    <TextField
      fullWidth
      select
      type="text"
      variant="outlined"
      label={t('Boolean')}
      disabled={disabled}
      {...props}
      value={value || ''}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{
        IconComponent: ExpandMoreRoundedIcon,
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
        },
        displayEmpty: true,
        renderValue: () => capitalize(value) || '---',
      }}
    >
      {Object.values(SwitchValue).map((option) => (
        <MenuItem key={option} value={option}>
          {capitalize(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default memo(SwitchTypeField);
