import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { Map as LeafletMapClass } from 'leaflet';

import { DeviceConnection } from 'city-os-common/libs/schema';

import { Building } from '../../libs/type';

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export interface Uploading {
  id: string;
  time: number;
  fileName: string;
  size: number;
  progress: number;
  file: File;
  url: string;
  abortController: AbortController;
}

// export interface Uploaded {
//   imageId: string;
//   name: string;
//   floorNum: number;
// }

export interface DialogContextValue {
  building: Building | null;
  setBuilding: Dispatch<SetStateAction<Building | null>>;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  map: LeafletMapClass | null;
  setMap: Dispatch<SetStateAction<LeafletMapClass | null>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  uploadingList: Uploading[];
  setUploadingList: Dispatch<SetStateAction<Uploading[]>>;
}

const DialogContext = createContext<DialogContextValue>({
  building: null,
  setBuilding: () => {},
  activeStep: 0,
  setActiveStep: () => {},
  map: null,
  setMap: () => {},
  address: '',
  setAddress: () => {},
  uploadingList: [],
  setUploadingList: () => {},
});

function DialogProvider({
  value,
  children,
}: ProviderProps<DialogContextValue>): ReactElement | null {
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export default DialogProvider;

export function useDialogContext(): DialogContextValue {
  return useContext(DialogContext);
}
