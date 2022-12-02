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
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

export type TextTypeFieldProps = Omit<BaseSensorValueFieldProps, 'select' | 'SelectProps'>;

const TextTypeField: VoidFunctionComponent<TextTypeFieldProps> = ({
  value: initValue,
  disabled,
  inputProps,
  InputLabelProps,
  error,
  helperText,
  onChange,
  ...props
}: TextTypeFieldProps) => {
  const { t } = useAutomationTranslation('automation');
  const [value, setValue] = useState<string>();
  const [isValid, setIsValid] = useState(true);

  const handleOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const newIsValid = newValue.trim() !== '';

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
      setIsValid(initValue === undefined || initValue.trim() !== '');
    }
  }, [initValue]);

  return (
    <TextField
      fullWidth
      type="text"
      variant="outlined"
      label={t('Text')}
      disabled={disabled}
      placeholder={t('text')}
      {...props}
      value={value || ''}
      error={error || (!disabled && !isValid)}
      helperText={disabled || isValid ? helperText : t('automation:Invalid text')}
      inputProps={{
        ...inputProps,
        onChange: handleOnChange,
      }}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
    />
  );
};

export default memo(TextTypeField);
