import gql from 'graphql-tag';

import { IDevice } from 'city-os-common/libs/schema';

export interface GetDevicesOnSurveillancePayload {
  deviceIds: string[];
}

export interface GetDevicesOnSurveillanceResponse {
  getDevices: Pick<IDevice, 'deviceId' | 'name' | 'uri' | 'type' | 'groups'>[] | null;
}

export const GET_DEVICES_ON_SURVEILLANCE = gql`
  query getDevicesOnSurveillance($deviceIds: [String!]!) {
    getDevices(deviceIds: $deviceIds) {
      deviceId
      name
      uri
      type
      groups {
        id
        name
      }
    }
  }
`;
