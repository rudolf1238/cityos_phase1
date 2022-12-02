import gql from 'graphql-tag';

import { DeviceType, Sensor } from 'city-os-common/libs/schema';

export interface GetGroupOnSensorIdSelectorPayload {
  groupId: string;
  deviceType?: DeviceType;
  deviceIds?: string[];
}

export interface GetGroupOnSensorIdSelectorResponse {
  getGroup: {
    sensors: Pick<Sensor, 'sensorId' | 'type' | 'unit'>[];
  };
}

export const GET_GROUP_ON_SENSOR_ID_SELECTOR = gql`
  query getGroup($groupId: ID!, $deviceType: DeviceType!, $deviceIds: [String!]) {
    getGroup(groupId: $groupId) {
      sensors(deviceType: $deviceType, deviceIds: $deviceIds) {
        sensorId
        type
        unit
      }
    }
  }
`;
