import { ReactNode } from 'react';

import ReducerActionType from './actions';

export interface ExitDialogState {
  disable: boolean;
  open: boolean;
  title: string;
  message: ReactNode;
}

interface ExitDialogShow {
  type: ReducerActionType.ShowExitDialog;
  payload: Pick<ExitDialogState, 'title' | 'message'>;
}

interface ExitDialogHide {
  type: ReducerActionType.HideExitDialog;
}

interface ExitDialogDisable {
  type: ReducerActionType.DisableExitDialog;
}

interface ExitDialogEnable {
  type: ReducerActionType.EnableExitDialog;
}

export type ExitDialogAction =
  | ExitDialogShow
  | ExitDialogHide
  | ExitDialogDisable
  | ExitDialogEnable;

export const exitDialogInitialState: ExitDialogState = {
  disable: true,
  open: false,
  title: '',
  message: null,
};

export function exitDialogReducer(
  state: ExitDialogState,
  action: ExitDialogAction,
): ExitDialogState {
  switch (action.type) {
    case ReducerActionType.ShowExitDialog:
      return {
        ...exitDialogInitialState,
        ...action.payload,
        open: true,
      };
    case ReducerActionType.HideExitDialog:
      return {
        ...state,
        open: false,
      };
    case ReducerActionType.DisableExitDialog:
      return {
        ...state,
        open: false,
        disable: true,
      };
    case ReducerActionType.EnableExitDialog:
      return {
        ...state,
        disable: false,
      };
    default:
      return state;
  }
}
