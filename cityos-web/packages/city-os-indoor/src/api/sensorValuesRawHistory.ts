import gql from 'graphql-tag';

import { ISensorData, SensorType } from 'city-os-common/libs/schema';

export interface SensorValuesRawHistoryPayload {
  deviceId: string;
  sensorId: string;
  start: Date;
  end: Date;
}

interface SingleISensorData extends Omit<ISensorData<SensorType.GAUGE>, 'time'> {
  time?: number;
}

export interface SensorValuesRawHistoryResponse {
  sensorValuesRawHistory: SingleISensorData[];
}

export const SENSOR_VALUES_RAW_HISTORY = gql`
  query sensorValuesRawHistory($deviceId: String!, $sensorId: String!, $start: Date!, $end: Date!) {
    sensorValuesRawHistory(deviceId: $deviceId, sensorId: $sensorId, start: $start, end: $end) {
      ... on GaugeSensorData {
        type
        time
        value
      }
    }
  }
`;
