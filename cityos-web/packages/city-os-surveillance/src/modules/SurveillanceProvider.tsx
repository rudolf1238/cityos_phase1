import { Map } from 'leaflet';
import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { CameraEventHistoryResponse } from 'city-os-common/api/cameraEventHistory';
import { DeviceConnection } from 'city-os-common/libs/schema';

import { LiveViewDevice, PlaybackRange, SplitMode, VideoStatusRecord } from '../libs/type';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export type ListType = 'SELECTED' | 'PENDING';

export interface SurveillanceContextValue {
  map: Map | null;
  keyword: string | null;
  selectedDevices: LiveViewDevice[];
  pageDeviceIds: (string | undefined)[];
  cursorIndex: number;
  splitMode: SplitMode;
  autoplay: boolean;
  autoplayInSeconds: number;
  fixSelectingDevice: LiveViewDevice | undefined;
  playbackRange: PlaybackRange | undefined;
  isUpdating: boolean;
  /** Date number in milliseconds */
  playbackTime: number | null;
  isPlaybackPaused: boolean;
  /** Manage state of Playback VideoPlayers on current page to get Leader which can update playbackTime */
  videoStatusRecord: VideoStatusRecord;
  cameraEvents: CameraEventHistoryResponse['cameraEventHistory'] | undefined;
  eventDeviceIds: string[];
  setMap: Dispatch<SetStateAction<Map | null>>;
  setSelectedDevices: Dispatch<SetStateAction<LiveViewDevice[]>>;
  clearAllSelected: () => void;
  setCursorIndex: Dispatch<SetStateAction<number>>;
  setSplitMode: Dispatch<SetStateAction<SplitMode>>;
  setAutoplay: Dispatch<SetStateAction<boolean>>;
  setAutoplayInSeconds: Dispatch<SetStateAction<number>>;
  setFixSelectingDevice: Dispatch<SetStateAction<LiveViewDevice | undefined>>;
  setPlaybackRange: Dispatch<SetStateAction<PlaybackRange | undefined>>;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
  setPlaybackTime: Dispatch<SetStateAction<number | null>>;
  setIsPlaybackPaused: Dispatch<SetStateAction<boolean>>;
  setVideoStatusRecord: Dispatch<SetStateAction<VideoStatusRecord>>;
  setCameraEvents: Dispatch<
    SetStateAction<CameraEventHistoryResponse['cameraEventHistory'] | undefined>
  >;
  setEventDeviceIds: Dispatch<SetStateAction<string[]>>;
}

const SurveillanceContext = createContext<SurveillanceContextValue>({
  map: null,
  keyword: null,
  selectedDevices: [],
  pageDeviceIds: [],
  cursorIndex: 0,
  splitMode: SplitMode.SINGLE,
  autoplay: false,
  autoplayInSeconds: 5,
  fixSelectingDevice: undefined,
  playbackRange: undefined,
  isUpdating: false,
  playbackTime: null,
  isPlaybackPaused: false,
  videoStatusRecord: {},
  cameraEvents: undefined,
  eventDeviceIds: [],
  setMap: () => {},
  setSelectedDevices: () => {},
  clearAllSelected: () => {},
  setCursorIndex: () => {},
  setSplitMode: () => {},
  setAutoplay: () => {},
  setAutoplayInSeconds: () => {},
  setFixSelectingDevice: () => {},
  setPlaybackRange: () => {},
  setIsUpdating: () => {},
  setPlaybackTime: () => {},
  setIsPlaybackPaused: () => {},
  setVideoStatusRecord: () => {},
  setCameraEvents: () => {},
  setEventDeviceIds: () => {},
});

const SurveillanceProvider = function ({
  value,
  children,
}: ProviderProps<SurveillanceContextValue>): ReactElement | null {
  return <SurveillanceContext.Provider value={value}>{children}</SurveillanceContext.Provider>;
};

export default SurveillanceProvider;

export function useSurveillanceContext(): SurveillanceContextValue {
  return useContext(SurveillanceContext);
}
