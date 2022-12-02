import gql from 'graphql-tag';

export interface DeleteDevicesPayload {
  groupId: string;
  deviceIds: string[];
}

export interface DeleteDevicesResponse {
  deleteDevices: string[];
}

export const DELETE_DEVICES = gql`
  mutation deleteDevices($groupId: ID!, $deviceIds: [String!]!) {
    deleteDevices(groupId: $groupId, deviceIds: $deviceIds)
  }
`;
