import gql from 'graphql-tag';

import { ISensorData, SensorType } from 'city-os-common/libs/schema';

export interface GetSnapShotTimePayload {
  deviceId: string;
  sensorId: string;
  time: Date;
}

export interface GetSnapShotTimeResponse {
  sensorValueAtTime: ISensorData<SensorType.SNAPSHOT>;
}

export const GET_SNAPSHOT_AT_TIME = gql`
  query getSnapShotAtTime($deviceId: String!, $sensorId: String!, $time: Date!) {
    sensorValueAtTime(deviceId: $deviceId, sensorId: $sensorId, time: $time) {
      ... on SnapshotSensorData {
        type
        time
        value
      }
    }
  }
`;
