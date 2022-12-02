import { DeviceType, SortOrder, UserSortField } from 'city-os-common/libs/schema';

export interface ResponseMSG {
  deviceId: string;
  updatedAt: Date;
  content?: string;
  name: string;
  id: string;
  pictureId: string;
  status: string;
  photo: string;
}

export interface ResponseMSGSon {
  updatedAt: Date;
  content: string;
  name: string;
  id: string;
  pictureId: string;
  status: string;
  photo: string;
}

export interface UserFilter {
  keyword?: string;
  userSortField?: UserSortField;
  sortOrder?: SortOrder;
  Maintenance?: boolean;
}

export enum MalDeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
}

export enum NotifyType {
  EMAIL = 'EMAIL',
  LINE = 'LINE',
  SMS = 'SMS',
}

export interface ResponseMaintenceUser {
  id: string;
  name: string;
  email: string;
}

export enum MaldeviceSortField {
  NAME = 'NAME',
  STATUS = 'STATUS',
}

export interface MaldeviceFilter {
  keyword?: string;
  maldeviceSortField?: MaldeviceSortField;
  sortOrder?: SortOrder;
}

export interface MalDevice {
  name: string;
  deviceType: DeviceType[];
  notifyType: NotifyType[];
  division_id: string[];
  status: MalDeviceStatus;
}

// export interface ResponseMSG {
//   deviceId: string;
//   updatedAt: Date;
//   content?: string;
//   name: string;
//   id: string
//   pictureId:string[]
// }
