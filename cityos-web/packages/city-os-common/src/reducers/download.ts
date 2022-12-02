import { SingleDownload } from '../libs/schema';
import ReducerActionType from './actions';

export type DownloadState = Record<string, SingleDownload>;

interface DownloadStart {
  type: ReducerActionType.StartDownload;
  payload: {
    id: string;
    title: SingleDownload['title'];
    subtitle: SingleDownload['subtitle'];
    cancel: SingleDownload['cancel'];
  };
}

interface DownloadUpdate {
  type: ReducerActionType.UpdateDownload;
  payload: {
    id: string;
    progress: SingleDownload['progress'];
  };
}

interface DownloadCancel {
  type: ReducerActionType.CancelDownload;
  payload: {
    id: string;
  };
}

interface DownloadEnd {
  type: ReducerActionType.EndDownload;
  payload: {
    id: string;
  };
}

interface DownloadLogout {
  type: ReducerActionType.UserLogout;
}

export type DownloadAction =
  | DownloadStart
  | DownloadUpdate
  | DownloadCancel
  | DownloadEnd
  | DownloadLogout;

export const downloadInitialState: DownloadState = {};

export function downloadReducer(state: DownloadState, action: DownloadAction): DownloadState {
  switch (action.type) {
    case ReducerActionType.StartDownload: {
      const newState = { ...state };
      const { id, ...rest } = action.payload;
      newState[id] = { ...rest, progress: 0 };
      return newState;
    }
    case ReducerActionType.UpdateDownload: {
      const newState = { ...state };
      const { id, progress } = action.payload;
      newState[id].progress = progress;
      return newState;
    }
    case ReducerActionType.CancelDownload: {
      const newState = { ...state };
      newState?.[action.payload.id].cancel();
      return newState;
    }
    case ReducerActionType.EndDownload: {
      const newState = { ...state };
      delete newState[action.payload.id];
      return newState;
    }
    case ReducerActionType.UserLogout: {
      Object.values(state).forEach((download) => {
        download.cancel();
      });
      return {};
    }
    default:
      return state;
  }
}
