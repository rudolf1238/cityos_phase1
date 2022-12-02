import gql from 'graphql-tag';

import { DeviceType, ISensorData, SensorId, SensorType } from 'city-os-common/src/libs/schema';

import { ExtremeOperation } from '../libs/type';

export interface SubscribeValueStatsPayload {
  groupId: string;
  deviceType: DeviceType;
  sensorId: SensorId;
  days: number;
  operation: ExtremeOperation;
}

export interface SubscribeValueStatsResponse {
  sensorValueStatsChanged: ISensorData<SensorType.GAUGE>;
}

export const SUBSCRIBE_VALUE_STATS = gql`
  subscription subscribeValueStatsChanged(
    $groupId: ID!
    $deviceType: DeviceType!
    $sensorId: String!
    $days: Int!
    $operation: ExtremeOperation!
  ) {
    sensorValueStatsChanged(
      groupId: $groupId
      deviceType: $deviceType
      sensorId: $sensorId
      days: $days
      operation: $operation
    ) {
      type
      time
      ... on GaugeSensorData {
        value
      }
    }
  }
`;
