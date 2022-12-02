import {
  Attribute,
  DeviceStatus,
  DeviceType,
  GPSPoint,
  Group,
  IDevice,
  MaintainStatus,
  Sensor,
  Timezone,
} from 'city-os-common/libs/schema';

export interface Query {
  groupId?: string;
  deviceId?: string;
  mode?: DetailMode;
}

export enum DetailMode {
  DEVICE_MAP = 'device-map',
  HEATMAP = 'heatmap',
  SPLIT_SCREEN = 'split-screen',
}
/*
export interface Floor {
id: string;
name: string;
floorNum: number;
devices?: IDevice[];
timezone?: Timezone;
}
*/

export interface Building {
  deviceId: string;
  name: string;
  desc?: string;
  uri: string;
  type: DeviceType;
  location: GPSPoint;
  groups: Group[];
  sensors?: Sensor[];
  status?: DeviceStatus;
  attributes: Attribute[];
  timezone?: Timezone;
  floors: Floor[];
  address: Address[];
  maintainstatus?: MaintainStatus;
  floorsdetail: DeviceUnderFloor[];
}

export interface Floor {
  id: string;
  name: string;
  floorNum: number;
  devices: IDevice[];
  imageLeftTop: [string, string];
  imageRightBottom: [string, string];
}

export interface Address {
  language: string;
  detail: AddressDetail;
}

export interface AddressDetail {
  country: string;
  city: string;
  formattedAddress: string;
}

export interface Device extends IDevice {
  floors?: Floor[];
}
export interface DeviceUnderFloor {
  id: string;
  name: string;
  floorNum: number;
  devices: Device[];
  imageLeftTop?: string[] | null;
  imageRightBottom?: string[] | null;
}
