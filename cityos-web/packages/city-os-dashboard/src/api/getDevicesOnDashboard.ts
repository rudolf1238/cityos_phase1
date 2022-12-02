import gql from 'graphql-tag';

import { IDevice } from 'city-os-common/libs/schema';

export interface GetDevicesOnDashboardPayload {
  deviceIds: string[];
}

export interface GetDevicesOnDashboardResponse {
  getDevices:
    | Pick<
        IDevice,
        'deviceId' | 'name' | 'uri' | 'type' | 'groups' | 'attributes' | 'sensors' | 'imageIds'
      >[]
    | null;
}

export const GET_DEVICES_ON_DASHBOARD = gql`
  query getDevicesOnDashboard($deviceIds: [String!]!) {
    getDevices(deviceIds: $deviceIds) {
      deviceId
      name
      uri
      type
      groups {
        id
        name
        projectKey
      }
      attributes {
        key
        value
      }
      sensors {
        sensorId
        name
        type
        unit
      }
      imageIds
    }
  }
`;
