import { CSSProperties } from 'react';

declare module '@material-ui/pickers/typings/overrides' {
  export interface MuiPickersOverrides {
    MuiPickersBasePicker?: {
      container: CSSProperties | undefined;
      pickerView: CSSProperties | undefined;
    };
  }
}

export {};
