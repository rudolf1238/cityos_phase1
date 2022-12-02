import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { Map as LeafletMapClass } from 'leaflet';

import { DeviceConnection, IDevice } from 'city-os-common/libs/schema';

import { Building, Floor } from '../libs/type';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export interface EditorPageContextValue {
  deviceList: IDevice[];
  setDeviceList: Dispatch<SetStateAction<IDevice[]>>;
  selectedFloorNumber: number | null;
  setSelectedFloorNumber: Dispatch<SetStateAction<number | null>>;
  building: Building | null;
  setBuilding: Dispatch<SetStateAction<Building | null>>;
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  floor: Floor | null;
  setFloor: Dispatch<SetStateAction<Floor | null>>;
  isMapEdit: boolean;
  setIsMapEdit: Dispatch<SetStateAction<boolean>>;
  map: LeafletMapClass | null;
  setMap: Dispatch<SetStateAction<LeafletMapClass | null>>;
}

const EditorPageContext = createContext<EditorPageContextValue>({
  deviceList: [],
  setDeviceList: () => {},
  selectedFloorNumber: null,
  setSelectedFloorNumber: () => {},
  building: null,
  setBuilding: () => {},
  activeId: null,
  setActiveId: () => {},
  floor: null,
  setFloor: () => {},
  isMapEdit: false,
  setIsMapEdit: () => {},
  map: null,
  setMap: () => {},
});

function EditorPageProvider({
  value,
  children,
}: ProviderProps<EditorPageContextValue>): ReactElement | null {
  return <EditorPageContext.Provider value={value}>{children}</EditorPageContext.Provider>;
}

export default EditorPageProvider;

export function useEditorPageContext(): EditorPageContextValue {
  return useContext(EditorPageContext);
}
