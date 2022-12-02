import React, {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { DownloadAction, DownloadState, downloadInitialState, downloadReducer } from './download';
import {
  ExitDialogAction,
  ExitDialogState,
  exitDialogInitialState,
  exitDialogReducer,
} from './exitDialog';
import { SnackbarAction, SnackbarState, snackbarInitialState, snackbarReducer } from './snackbar';
import { UserAction, UserState, userInitialState, userReducer } from './user';
import {
  UserProfileAction,
  UserProfileState,
  userProfileInitialState,
  userProfileReducer,
} from './userProfile';

type RootAction =
  | UserAction
  | SnackbarAction
  | ExitDialogAction
  | UserProfileAction
  | DownloadAction;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function combineDispatches(...dispatches: Dispatch<any>[]): Dispatch<RootAction> {
  return (value) => {
    dispatches.forEach((dispatch) => {
      dispatch(value);
    });
  };
}

interface RootState {
  user: UserState;
  snackbar: SnackbarState;
  exitDialog: ExitDialogState;
  userProfile: UserProfileState;
  download: DownloadState;
  dispatch: Dispatch<RootAction>;
}

export const store: RootState = {
  user: userInitialState,
  snackbar: snackbarInitialState,
  exitDialog: exitDialogInitialState,
  userProfile: userProfileInitialState,
  download: downloadInitialState,
  dispatch: () => {
    throw new Error('dispatch before initialize');
  },
};

export const StoreContext = createContext<RootState>(store);

type StoreProviderProps = Record<never, never>;

export const StoreProvider: FunctionComponent<StoreProviderProps> = ({
  children,
}: PropsWithChildren<StoreProviderProps>) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [exitDialogState, exitDialogDispatch] = useReducer(
    exitDialogReducer,
    exitDialogInitialState,
  );
  const [userProfileState, userProfileDispatch] = useReducer(
    userProfileReducer,
    userProfileInitialState,
  );
  const [downloadState, downloadDispatch] = useReducer(downloadReducer, downloadInitialState);

  store.user = userState;
  store.snackbar = snackbarState;
  store.exitDialog = exitDialogState;
  store.userProfile = userProfileState;
  store.download = downloadState;
  store.dispatch = useMemo(
    () =>
      combineDispatches(
        userDispatch,
        snackbarDispatch,
        exitDialogDispatch,
        userProfileDispatch,
        downloadDispatch,
      ),
    [],
  );

  return <StoreContext.Provider value={{ ...store }}>{children}</StoreContext.Provider>;
};

export function useStore(): RootState {
  return useContext(StoreContext);
}
