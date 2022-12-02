import gql from 'graphql-tag';

import { AttributeInput } from 'city-os-common/libs/schema';

export interface GPSPointInput {
  lat: number;
  lng: number;
}

export interface EditDeviceInput {
  name?: string | null;
  desc?: string | null;
  location?: GPSPointInput | null; // null would set empty location; undefined would set original location
  attributes?: AttributeInput[] | null;
  imageIds?: string[] | null;
}

export interface EditDevicePayload {
  deviceId: string;
  editDeviceInput: EditDeviceInput;
}

export interface EditDeviceResponse {
  editDevice: boolean;
}

export const EDIT_DEVICE = gql`
  mutation editDevice($deviceId: String!, $editDeviceInput: EditDeviceInput!) {
    editDevice(deviceId: $deviceId, editDeviceInput: $editDeviceInput)
  }
`;
