import gql from 'graphql-tag';

export interface RestoreDevicesPayload {
  groupId: string;
  deviceIds: string[];
}

export interface RestoreDevicesResponse {
  restoreDevices: string[];
}

export const RESTORE_DEVICES = gql`
  mutation restoreDevices($groupId: ID!, $deviceIds: [String!]!) {
    restoreDevices(groupId: $groupId, deviceIds: $deviceIds)
  }
`;
