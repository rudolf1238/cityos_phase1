import { IDevice, MaintainStatus } from 'city-os-common/libs/schema';

export interface Query {
  groupId?: string;
  deviceId?: string;
  mode?: DetailMode;
  floorNumber?: string;
  pid?: string;
  gid?: string;
}

export enum DetailMode {
  DEVICE_MAP = 'device-map',
  HEATMAP = 'heatmap',
  SPLIT_SCREEN = 'split-screen',
}

export enum SplitMode {
  SINGLE = 'SINGLE',
  FOUR = 'FOUR',
  NINE = 'NINE',
  SIXTEEN = 'SIXTEEN',
}

export interface LiveViewDevice {
  deviceId: string;
  /** null value represent not fixed */
  fixedIndex: number | null;
}

export interface Floor {
  id: string;
  name: string;
  floorNum: number;
  devices: IDevice[];
  imageLeftTop: [string, string];
  imageRightBottom: [string, string];
}

export interface AddressDetail {
  country?: string | null;
  city?: string | null;
  formattedAddress?: string | null;
}

export interface Address {
  language?: string | null;
  detail?: AddressDetail | null;
}

// TODO: 拜託後端改一下命名
export interface Building extends IDevice {
  maintainstatus?: MaintainStatus;
  floors: Floor[];
  address?: Address[] | null;
}

export interface GetBuildings {
  edges: BuildingEdge[];
}

export interface BuildingEdge {
  node: Building;
  deviceCount: number;
}

export interface DeviceUnderFloor {
  id: string;
  name: string;
  floorNum: number;
  devices: IDevice[];
  imageLeftTop: [string, string];
  imageRightBottom: [string, string];
}

export interface LiveViewConfig {
  devices: LiveViewDevice[];
  splitMode: SplitMode | null;
  autoplay: boolean | null;
  autoplayInSeconds: number | null;
}
