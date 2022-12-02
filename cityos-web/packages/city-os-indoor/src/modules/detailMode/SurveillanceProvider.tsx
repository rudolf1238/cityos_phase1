import { Map } from 'leaflet';
import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { DeviceConnection } from 'city-os-common/libs/schema';

import { LiveViewDevice, SplitMode } from '../../libs/type';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export type ListType = 'SELECTED' | 'PENDING';

export interface SurveillanceContextValue {
  map: Map | null;
  keyword: string | null;
  selectedDevices: LiveViewDevice[];
  currentPageDevices: (LiveViewDevice | undefined)[];
  activeDevice: LiveViewDevice | undefined;
  page: number;
  splitMode: SplitMode;
  autoplay: boolean;
  autoplayInSeconds: number;
  fixSelectingDevice: LiveViewDevice | undefined;
  setMap: Dispatch<SetStateAction<Map | null>>;
  setSelectedDevices: Dispatch<SetStateAction<LiveViewDevice[]>>;
  setActiveDevice: Dispatch<SetStateAction<LiveViewDevice | undefined>>;
  clearAllSelected: () => void;
  setPage: Dispatch<SetStateAction<number>>;
  setSplitMode: Dispatch<SetStateAction<SplitMode>>;
  setAutoplay: Dispatch<SetStateAction<boolean>>;
  setAutoplayInSeconds: Dispatch<SetStateAction<number>>;
  setFixSelectingDevice: Dispatch<SetStateAction<LiveViewDevice | undefined>>;
}

const SurveillanceContext = createContext<SurveillanceContextValue>({
  map: null,
  keyword: null,
  selectedDevices: [],
  currentPageDevices: [],
  activeDevice: undefined,
  page: 0,
  splitMode: SplitMode.SINGLE,
  autoplay: false,
  autoplayInSeconds: 5,
  fixSelectingDevice: undefined,
  setMap: () => {},
  setSelectedDevices: () => {},
  setActiveDevice: () => {},
  clearAllSelected: () => {},
  setPage: () => {},
  setSplitMode: () => {},
  setAutoplay: () => {},
  setAutoplayInSeconds: () => {},
  setFixSelectingDevice: () => {},
});

function SurveillanceProvider({
  value,
  children,
}: ProviderProps<SurveillanceContextValue>): ReactElement | null {
  return <SurveillanceContext.Provider value={value}>{children}</SurveillanceContext.Provider>;
}

export default SurveillanceProvider;

export function useSurveillanceContext(): SurveillanceContextValue {
  return useContext(SurveillanceContext);
}
