import gql from 'graphql-tag';

export interface UpdateSensorPayload {
  deviceId: string;
  sensorId: string;
  value: number;
}

export interface UpdateSensorResponse {
  updateSensor: boolean;
}

export const UPDATE_SENSOR = gql`
  mutation updateSensor($deviceId: String!, $sensorId: String!, $value: Any!) {
    updateSensor(deviceId: $deviceId, sensorId: $sensorId, value: $value)
  }
`;
