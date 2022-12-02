import gql from 'graphql-tag';

import { ISensorData, SensorType } from 'city-os-common/libs/schema';

export interface MultiSensorValuesRawHistoryPayload {
  deviceId: string;
  sensorIds: string[];
  start: Date;
  end: Date;
  from?: number;
  size?: number;
}

interface SingleISensorData extends Omit<ISensorData<SensorType.GAUGE>, 'time'> {
  time?: number;
}

export interface MultiISensorData {
  sensorId: string;
  sensorData: SingleISensorData[];
}

export interface MultiSensorValuesRawHistoryResponse {
  multiSensorValuesRawHistory: MultiISensorData[];
}

export const MULTI_SENSOR_VALUES_RAW_HISTORY = gql`
  query multiSensorValuesRawHistory(
    $deviceId: String!
    $sensorIds: [String]!
    $start: Date!
    $end: Date!
    $from: Int
    $size: Int
  ) {
    multiSensorValuesRawHistory(
      deviceId: $deviceId
      sensorIds: $sensorIds
      start: $start
      end: $end
      from: $from
      size: $size
    ) {
      sensorId
      sensorData {
        ... on GaugeSensorData {
          time
          type
          value
        }
      }
    }
  }
`;
