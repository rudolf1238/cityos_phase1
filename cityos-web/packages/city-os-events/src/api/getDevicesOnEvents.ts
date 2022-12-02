import gql from 'graphql-tag';

import { IDevice } from 'city-os-common/libs/schema';

export interface GetDevicesOnEventsPayload {
  deviceIds: string[];
}

export interface GetDevicesOnEventsResponse {
  getDevices: Pick<IDevice, 'deviceId' | 'name' | 'uri' | 'type' | 'location' | 'groups'>[] | null;
}

export const GET_DEVICES_ON_EVENTS = gql`
  query getDevicesOnEvents($deviceIds: [String!]!) {
    getDevices(deviceIds: $deviceIds) {
      deviceId
      name
      uri
      type
      location {
        lat
        lng
      }
      groups {
        id
        name
        projectKey
      }
    }
  }
`;
