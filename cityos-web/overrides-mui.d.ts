import { AlertClassKey } from '@material-ui/lab/Alert';
import { AlertTitleClassKey } from '@material-ui/lab/AlertTitle';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';

interface MuiAlertClasses {
  MuiAlert: AlertClassKey;
}

interface MuiAlertTitleClasses {
  MuiAlertTitle: AlertTitleClassKey;
}

type OverridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
} &
  {
    [P in keyof MuiAlertClasses]: MuiAlertClasses[P];
  } &
  {
    [P in keyof MuiAlertTitleClasses]: MuiAlertTitleClasses[P];
  };

declare module '@material-ui/core/styles/overrides' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ComponentNameToClassKey extends OverridesNameToClassKey {}
}

export {};
