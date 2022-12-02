import gql from 'graphql-tag';

import { IDevice, Sensor } from 'city-os-common/libs/schema';

export interface GetDevicePayload {
  deviceId: string;
}

export interface PartialDevice
  extends Pick<
    IDevice,
    | 'deviceId'
    | 'name'
    | 'groups'
    | 'desc'
    | 'type'
    | 'location'
    | 'attributes'
    | 'status'
    | 'maintainstatus'
  > {
  sensors: Omit<Sensor, 'attributes'>[];
}

export interface GetDeviceResponse {
  getDevices: PartialDevice[];
}

export const GET_DEVICE_ON_DEVICE_DETAIL = gql`
  query getDevicesOnDeviceDetail($deviceId: String!) {
    getDevices(deviceIds: [$deviceId]) {
      deviceId
      name
      desc
      maintainstatus
      groups {
        id
        name
        projectKey
      }
      type
      location {
        lat
        lng
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
        desc
      }
    }
  }
`;
