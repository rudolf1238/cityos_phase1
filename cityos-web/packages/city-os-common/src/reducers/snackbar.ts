import { ComponentProps, ReactNode } from 'react';

import Alert from '@material-ui/lab/Alert';

import ReducerActionType from './actions';

export interface SnackbarState {
  open: boolean;
  message: ReactNode;
  severity: ComponentProps<typeof Alert>['severity'];
}

interface SnackbarActionShow {
  type: ReducerActionType.ShowSnackbar;
  payload: Pick<SnackbarState, 'message' | 'severity'>;
}

interface SnackbarActionHide {
  type: ReducerActionType.HideSnackbar;
}

export type SnackbarAction = SnackbarActionShow | SnackbarActionHide;

export const snackbarInitialState: SnackbarState = {
  open: false,
  message: null,
  severity: undefined,
};

export function snackbarReducer(state: SnackbarState, action: SnackbarAction): SnackbarState {
  switch (action.type) {
    case ReducerActionType.ShowSnackbar:
      return {
        ...snackbarInitialState,
        ...action.payload,
        open: true,
      };
    case ReducerActionType.HideSnackbar:
      return {
        ...state,
        open: false,
      };
    default:
      return state;
  }
}
