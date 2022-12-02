import gql from 'graphql-tag';

export interface MalDeviceUpdatePayload {
  groupId: string;
  MalDeviceUpdate: MalDeviceUpdate;
}

export interface MalDeviceUpdate {
  queryname: string;
  name?: string;
  deviceType?: string[];
  notifyType?: string[];
  division_id?: string[];
  status?: string;
}

export interface MalDeviceUpdateResponse {
  updateMlDevices: boolean;
}

export const UPDATE_MALDEVICES = gql`
  mutation updateMlDevices($groupId: ID!, $MalDeviceUpdate: MalDeviceUpdate!) {
    updateMlDevices(groupId: $groupId, MalDeviceUpdate: $MalDeviceUpdate)
  }
`;
