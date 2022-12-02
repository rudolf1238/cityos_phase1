import { DocumentNode } from 'graphql';
import capitalize from 'lodash/capitalize';
import gql from 'graphql-tag';

import { ISensorData, SensorId, SensorType } from '../libs/schema';

export interface SubscribeValueChangedPayload {
  deviceId: string;
  sensorId: SensorId;
}

export interface SubscribeValueChangedResponse<T extends SensorType> {
  sensorValueChanged: {
    deviceId: string;
    sensorId: SensorId;
    data: ISensorData<T>;
  };
}

const getSensorValueChanged = (sensorType: SensorType): DocumentNode => gql`
  subscription sensorValueChanged(
    $deviceId: String!
    $sensorId: String!
  ) {
    sensorValueChanged(deviceId: $deviceId, sensorId: $sensorId) {
      deviceId
      sensorId
      data {
        ... on ${capitalize(sensorType)}SensorData  {
          type
          time
          value
        }
      }
    }
  }
`;

export default getSensorValueChanged;
