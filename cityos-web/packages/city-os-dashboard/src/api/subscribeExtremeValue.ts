import { DocumentNode } from 'graphql';
import capitalize from 'lodash/capitalize';
import gql from 'graphql-tag';

import { DeviceType, SensorId, SensorType } from 'city-os-common/libs/schema';

import { SensorResponse, StatsOption } from '../libs/type';

export interface SubscribeExtremeValuePayload {
  groupId: string;
  deviceType: DeviceType;
  sensorId: SensorId;
  option: StatsOption;
}

export interface SubscribeExtremeValueResponse<T extends SensorType> {
  extremeValueChanged: {
    response: SensorResponse<T>;
    total: number;
  };
}

export const getExtremeSensorValue = (sensorType: SensorType): DocumentNode => gql`
  subscription subscribeExtremeValue(
    $groupId: ID!
    $deviceType: DeviceType!
    $sensorId: String!
    $option: StatsOption!
  ) {
    extremeValueChanged(
      groupId: $groupId
      deviceType: $deviceType
      sensorId: $sensorId
      option: $option
    ) {
      response {
        deviceName
        deviceId
        sensorId
        data {
          type
          time
          ... on ${capitalize(sensorType)}SensorData {
            value
          }
        }
      }
      total
    }
  }
`;
