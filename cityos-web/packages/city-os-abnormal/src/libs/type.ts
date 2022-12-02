import { IDevice } from 'city-os-common/libs/schema';

export type StaffData = {
  photo: string;
  email: string;
  name: string;
  phone: string;
};

export type DevicePartial = Pick<IDevice, 'deviceId' | 'name' | 'type' | 'groups' | 'desc'>;
