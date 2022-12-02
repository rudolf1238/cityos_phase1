import { TextFieldProps } from '@material-ui/core';

export interface BaseSensorValueFieldProps
  extends Omit<
    TextFieldProps,
    'type' | 'children' | 'value' | 'variant' | 'autoComplete' | 'multiline' | 'rows' | 'rowsMax'
  > {
  value?: string;
}
