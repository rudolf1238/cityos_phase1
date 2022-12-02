import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';

import TextField from '@material-ui/core/TextField';

import { BaseSensorValueFieldProps } from './type';
import { gaugeSensorThresholdRegex } from '../../libs/constants';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

export type GaugeTypeFieldProps = Omit<BaseSensorValueFieldProps, 'select' | 'SelectProps'>;

const GaugeTypeField: VoidFunctionComponent<GaugeTypeFieldProps> = ({
  value: initValue,
  disabled,
  inputProps,
  InputLabelProps,
  error,
  helperText,
  onChange,
  ...props
}: GaugeTypeFieldProps) => {
  const { t } = useAutomationTranslation('automation');
  const [value, setValue] = useState<string>();
  const [isValid, setIsValid] = useState(true);

  const handleOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const newIsValid = !!newValue && gaugeSensorThresholdRegex.test(newValue);

      setValue(newValue);
      setIsValid(newIsValid);
      e.target.value = newIsValid ? newValue : '';

      if (inputProps?.onChange) {
        inputProps.onChange(e);
      } else if (onChange) {
        onChange(e);
      }
    },
    [inputProps, onChange],
  );

  useEffect(() => {
    if (initValue !== '') {
      setValue(initValue);
      setIsValid(initValue === undefined || gaugeSensorThresholdRegex.test(initValue));
    }
  }, [initValue]);

  return (
    <TextField
      fullWidth
      type="text"
      variant="outlined"
      label={t('Number')}
      disabled={disabled}
      placeholder="92.123"
      {...props}
      value={value || ''}
      error={error || (!disabled && !isValid)}
      helperText={disabled || isValid ? helperText : t('automation:Invalid number')}
      inputProps={{
        ...inputProps,
        onChange: handleOnChange,
      }}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
    />
  );
};

export default memo(GaugeTypeField);
