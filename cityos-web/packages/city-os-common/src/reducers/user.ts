import { StorageKey, getItem, getValue, removeItem, setItem } from '../libs/storage';
import { isString, isStringRecord } from '../libs/validators';
import ReducerActionType from './actions';

export interface UserState {
  email?: string;
  refreshToken?: string;
  deviceToken?: string;
  accessToken?: string;
}

const initialState = {
  email: undefined,
  accessToken: undefined,
  refreshToken: undefined,
  deviceToken: undefined,
};

interface UserActionLogin {
  type: ReducerActionType.UserLogin;
  payload: Required<Pick<UserState, 'email' | 'refreshToken'>>;
}

interface UserActionLogout {
  type: ReducerActionType.UserLogout;
}

interface UserActionRefreshToken {
  type: ReducerActionType.RefreshToken;
  payload: Required<Pick<UserState, 'refreshToken' | 'accessToken'>>;
}

interface UserActionSetDeviceToken {
  type: ReducerActionType.SetDeviceToken;
  payload: Required<Pick<UserState, 'deviceToken'>>;
}
interface UserActionRemoveDeviceToken {
  type: ReducerActionType.RemoveDeviceToken;
}

export type UserAction =
  | UserActionLogin
  | UserActionLogout
  | UserActionRefreshToken
  | UserActionSetDeviceToken
  | UserActionRemoveDeviceToken;

function getInitialState(): UserState {
  try {
    const email = getValue(getItem(StorageKey.ID), isString);
    if (!email) {
      throw new Error('No Email');
    }

    const refreshToken = getValue(getItem(StorageKey.REFRESH), isString);
    if (!email) {
      throw new Error('No Refresh Token');
    }

    const deviceTokens = getValue(getItem(StorageKey.DEVICES), isStringRecord) ?? {};

    return {
      email,
      accessToken: getValue(getItem(StorageKey.ACCESS), isString),
      refreshToken,
      deviceToken: deviceTokens[email],
    };
  } catch {
    return {
      ...initialState,
    };
  }
}

export const userInitialState: UserState = getInitialState();

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case ReducerActionType.UserLogin: {
      setItem(StorageKey.ID, action.payload.email);
      setItem(StorageKey.REFRESH, action.payload.refreshToken);
      const deviceTokens = getValue(getItem(StorageKey.DEVICES), isStringRecord) || {};
      return {
        ...state,
        email: action.payload.email,
        refreshToken: action.payload.refreshToken,
        deviceToken: deviceTokens[action.payload.email],
      };
    }
    case ReducerActionType.UserLogout:
      removeItem(StorageKey.ID);
      removeItem(StorageKey.REFRESH);
      removeItem(StorageKey.ACCESS);
      return {
        ...state,
        email: undefined,
        refreshToken: undefined,
        deviceToken: undefined,
        accessToken: undefined,
      };
    case ReducerActionType.SetDeviceToken:
      if (!state.email) {
        return state;
      }
      setItem(StorageKey.DEVICES, {
        ...(getValue(getItem(StorageKey.DEVICES), isStringRecord) ?? {}),
        [state.email]: action.payload.deviceToken,
      });
      return { ...state, deviceToken: action.payload.deviceToken };
    case ReducerActionType.RemoveDeviceToken:
      // TODO: remove log
      console.log('remove device token', {
        tokenInStore: state.deviceToken,
        tokenInStorage: getValue(getItem(StorageKey.DEVICES), isStringRecord) ?? {},
      });
      setItem(
        StorageKey.DEVICES,
        Object.fromEntries(
          Object.entries(getValue(getItem(StorageKey.DEVICES), isStringRecord) ?? {}).filter(
            ([email]) => email !== state.email,
          ),
        ),
      );
      return {
        ...state,
        deviceToken: undefined,
      };
    case ReducerActionType.RefreshToken: {
      setItem(StorageKey.ACCESS, action.payload.accessToken);
      setItem(StorageKey.REFRESH, action.payload.refreshToken);
      return {
        ...state,
        refreshToken: action.payload.refreshToken,
        accessToken: action.payload.accessToken,
      };
    }
    default:
      return state;
  }
}
