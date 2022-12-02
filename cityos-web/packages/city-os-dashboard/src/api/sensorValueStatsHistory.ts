import { DocumentNode } from 'graphql';
import capitalize from 'lodash/capitalize';
import gql from 'graphql-tag';

import { DeviceType, ISensorData, SensorId, SensorType } from 'city-os-common/src/libs/schema';

import { StatsOption } from '../libs/type';

interface SensorValueStatsHistoryInput {
  groupId: string;
  deviceType: DeviceType;
  sensorId: SensorId;
  start: number;
  end: number;
  option: StatsOption;
  interval?: number;
}

export interface SensorValueStatsHistoryPayload {
  input: SensorValueStatsHistoryInput;
}

export interface SensorValueStatsHistoryResponse<T extends SensorType> {
  sensorValueStatsHistory: ISensorData<T>[];
}

export const getSensorValueStatsHistory = (sensorType: SensorType): DocumentNode => gql`
  query sensorValueStatsHistory(
    $input: SensorValueStatsHistoryInput!
  ) {
    sensorValueStatsHistory(
      input: $input
    ) {
      type
      time
      ... on ${capitalize(sensorType)}SensorData {
          value
        }
    }
  }
`;
