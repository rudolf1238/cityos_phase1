import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { DeviceConnection, DeviceType, IDevice } from 'city-os-common/libs/schema';

import { Building, DetailMode, Floor } from '../libs/type';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export interface ViewerPageContextValue {
  deviceList: IDevice[];
  setDeviceList: Dispatch<SetStateAction<IDevice[]>>;
  selectedIdList: string[];
  setSelectedIdList: Dispatch<SetStateAction<string[]>>;
  mode: DetailMode | null;
  setMode: Dispatch<SetStateAction<DetailMode | null>>;
  selectedFloorNumber: number | null;
  setSelectedFloorNumber: Dispatch<SetStateAction<number | null>>;
  building: Building | null;
  setBuilding: Dispatch<SetStateAction<Building | null>>;
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  floor: Floor | null;
  setFloor: Dispatch<SetStateAction<Floor | null>>;
  deviceTypeFilter: DeviceType | null;
  setDeviceTypeFilter: Dispatch<SetStateAction<DeviceType | null>>;
}

const ViewerPageContext = createContext<ViewerPageContextValue>({
  deviceList: [],
  setDeviceList: () => {},
  selectedIdList: [],
  setSelectedIdList: () => {},
  mode: null,
  setMode: () => {},
  selectedFloorNumber: null,
  setSelectedFloorNumber: () => {},
  building: null,
  setBuilding: () => {},
  activeId: null,
  setActiveId: () => {},
  floor: null,
  setFloor: () => {},
  deviceTypeFilter: null,
  setDeviceTypeFilter: () => {},
});

function ViewerPageProvider({
  value,
  children,
}: ProviderProps<ViewerPageContextValue>): ReactElement | null {
  return <ViewerPageContext.Provider value={value}>{children}</ViewerPageContext.Provider>;
}

export default ViewerPageProvider;

export function useViewerPageContext(): ViewerPageContextValue {
  return useContext(ViewerPageContext);
}
