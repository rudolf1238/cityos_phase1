import gql from 'graphql-tag';

import { AttributeInput, SensorType } from 'city-os-common/libs/schema';

export interface EditSensorInput {
  name?: string | null;
  desc?: string | null;
  type?: SensorType | null;
  unit?: string | null;
  attributes?: AttributeInput[] | null;
}

export interface EditSensorPayload {
  deviceId: string;
  sensorId: string;
  editSensorInput: EditSensorInput;
}

export interface EditSensorResponse {
  editSensor: boolean;
}

export const EDIT_SENSOR = gql`
  mutation updateSensor(
    $deviceId: String!
    $sensorId: String!
    $editSensorInput: EditSensorInput!
  ) {
    editSensor(deviceId: $deviceId, sensorId: $sensorId, editSensorInput: $editSensorInput)
  }
`;
