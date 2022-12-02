import gql from 'graphql-tag';

export interface MalDevicePayload {
  groupId: string;
  MalDeviceInput: MalDeviceInput;
}

export interface MalDeviceInput {
  name: string;
  deviceType: string[];
  notifyType: string[];
  division_id: string[];
  status: string;
}

export interface MalDeviceResponse {
  addMlDevices: boolean;
}

export const ADD_MALDEVICES = gql`
  mutation addMlDevices($groupId: ID!, $MalDeviceInput: MalDeviceInput!) {
    addMlDevices(groupId: $groupId, MalDeviceInput: $MalDeviceInput)
  }
`;
