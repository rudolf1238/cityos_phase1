import gql from 'graphql-tag';

import { DeviceType, IDevice } from 'city-os-common/libs/schema';

export interface DevicesFromIOTPayload {
  groupId: string;
  type?: DeviceType | null;
  name?: string | null;
  desc?: string | null;
}

export type DevicesFromIOTResponse = {
  devicesFromIOT: (Omit<IDevice, 'hasLightSensor' | 'lightSchedule' | 'related'> | null)[] | null;
};

export type PartialNode = Pick<IDevice, 'deviceId' | 'name' | 'type' | 'groups' | 'desc'>;

export const DEVICES_FROM_IOT = gql`
  query devicesFromIOT($groupId: ID!, $type: DeviceType, $name: String, $desc: String) {
    devicesFromIOT(groupId: $groupId, type: $type, name: $name, desc: $desc) {
      deviceId
      name
      desc
      type
      groups {
        id
        name
      }
    }
  }
`;
