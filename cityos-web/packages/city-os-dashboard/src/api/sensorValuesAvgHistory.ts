import gql from 'graphql-tag';

import { ISensorData, SensorType } from 'city-os-common/src/libs/schema';

export interface SensorValuesAvgHistoryPayload {
  deviceId: string;
  sensorId: string;
  start: Date;
  end: Date;
  interval?: number | null;
}

export interface SingleISensorData extends Omit<ISensorData<SensorType.GAUGE>, 'time'> {
  time?: number;
}

export interface SensorValuesAvgHistoryResponse {
  sensorValuesAvgHistory: SingleISensorData[];
}

export const SENSOR_VALUES_AVG_HISTORY = gql`
  query sensorValuesAvgHistory(
    $deviceId: String!
    $sensorId: String!
    $start: Date!
    $end: Date!
    $interval: Int
  ) {
    sensorValuesAvgHistory(
      deviceId: $deviceId
      sensorId: $sensorId
      start: $start
      end: $end
      interval: $interval
    ) {
      ... on GaugeSensorData {
        type
        time
        value
      }
    }
  }
`;
