import { makeStyles } from '@material-ui/core/styles';
import React, { ChangeEvent, VoidFunctionComponent, memo, useCallback } from 'react';
import clsx from 'clsx';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import { SensorType } from 'city-os-common/libs/schema';

import { TriggerOperator } from '../../../../libs/type';
import { isTriggerOperator } from '../../../../libs/validators';
import { triggerOperatorGroup } from '../../../../libs/constants';
import useAutomationTranslation from '../../../../hooks/useAutomationTranslation';
import useTriggerOperatorTranslation from '../../../../hooks/useTriggerOperatorTranslation';

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: 280,
  },
}));

interface TriggerOperatorSelectorProps
  extends Omit<TextFieldProps, 'select' | 'type' | 'children' | 'value' | 'onChange'> {
  sensorType: SensorType;
  value?: TriggerOperator;
  onChange: (operator: TriggerOperator) => void;
}

const TriggerOperatorSelector: VoidFunctionComponent<TriggerOperatorSelectorProps> = ({
  sensorType,
  value,
  disabled,
  SelectProps,
  InputLabelProps,
  onChange,
  ...props
}: TriggerOperatorSelectorProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation('automation');
  const { tTriggerOperator } = useTriggerOperatorTranslation();

  const onChangeOperator = useCallback(
    (
      event: ChangeEvent<{
        name?: string | undefined;
        value: unknown;
      }>,
    ) => {
      const newValue = event.target.value;
      if (isTriggerOperator(newValue)) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <TextField
      type="text"
      variant="outlined"
      label={t('Operator')}
      select
      fullWidth
      value={value || ''}
      {...props}
      disabled={disabled}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{
        displayEmpty: true,
        IconComponent: ExpandMoreRoundedIcon,
        onChange: onChangeOperator,
        renderValue: () => (value ? tTriggerOperator(value) : '---'),
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
      {triggerOperatorGroup[sensorType]?.map((type) => (
        <MenuItem key={type} value={type}>
          {tTriggerOperator(type)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default memo(TriggerOperatorSelector);
