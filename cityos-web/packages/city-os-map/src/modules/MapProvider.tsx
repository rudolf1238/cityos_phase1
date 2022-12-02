import { Map } from 'leaflet';
import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { DeviceConnection, IDevice } from 'city-os-common/libs/schema';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export type ListType = 'SELECTED' | 'PENDING';

export enum FilterType {
  ALL = 'ALL',
  ERROR = 'ERROR',
  NO_SCHEDULE = 'NO_SCHEDULE',
}

export interface MapContextValue {
  map: Map | null;
  keyword: string | undefined;
  filterType: FilterType;
  selectedIdList: Set<string>;
  showDetails: boolean;
  showMore: boolean;
  showPoleMenu: boolean;
  showCluster: boolean;
  disableClick: boolean;
  deviceList: IDevice[];
  setMap: Dispatch<SetStateAction<Map | null>>;
  setSelectedIdList: Dispatch<SetStateAction<Set<string>>>;
  setIsSelectAll: (value: boolean) => void;
  clearAllSelected: () => void;
  setShowDetails: Dispatch<SetStateAction<boolean>>;
  setShowMore: Dispatch<SetStateAction<boolean>>;
  setShowPoleMenu: Dispatch<SetStateAction<boolean>>;
  setShowCluster: Dispatch<SetStateAction<boolean>>;
  setDisableClick: Dispatch<SetStateAction<boolean>>;
  setDeviceList: Dispatch<SetStateAction<IDevice[]>>;
}

const MapContext = createContext<MapContextValue>({
  map: null,
  keyword: undefined,
  filterType: FilterType.ALL,
  selectedIdList: new Set(),
  showDetails: false,
  showMore: false,
  showPoleMenu: false,
  showCluster: false,
  disableClick: false,
  deviceList: [],
  setMap: () => {},
  setSelectedIdList: () => {},
  setIsSelectAll: () => {},
  clearAllSelected: () => {},
  setShowDetails: () => {},
  setShowMore: () => {},
  setShowPoleMenu: () => {},
  setShowCluster: () => {},
  setDisableClick: () => {},
  setDeviceList: () => {},
});

function MapProvider({ value, children }: ProviderProps<MapContextValue>): ReactElement | null {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export default MapProvider;

export function useMapContext(): MapContextValue {
  return useContext(MapContext);
}
