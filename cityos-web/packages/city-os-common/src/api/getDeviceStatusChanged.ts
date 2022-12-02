import gql from 'graphql-tag';

import { DeviceStatus } from '../libs/schema';

interface DevicesStatusResponse {
  deviceId: string;
  status: DeviceStatus;
  time: number;
}

export interface GetDevicesStatusChangedResponse {
  devicesStatusChanged: DevicesStatusResponse;
}

export interface GetDevicesStatusChangedPayload {
  deviceIds: string[];
}

export const GET_DEVICES_STATUS_CHANGED = gql`
  subscription deviceStatusChanged($deviceIds: [String!]!) {
    devicesStatusChanged(deviceIds: $deviceIds) {
      deviceId
      status
      time
    }
  }
`;
