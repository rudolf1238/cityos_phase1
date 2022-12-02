import gql from 'graphql-tag';

export interface AddDevicesPayload {
  groupId: string;
  deviceIds: string[];
}

export interface AddDevicesResponse {
  addDevices: boolean;
}

export const ADD_DEVICES = gql`
  mutation addDevices($groupId: ID!, $deviceIds: [String!]!) {
    addDevices(groupId: $groupId, deviceIds: $deviceIds)
  }
`;
