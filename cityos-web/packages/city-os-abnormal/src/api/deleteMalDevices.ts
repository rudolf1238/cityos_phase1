import gql from 'graphql-tag';

export interface DeleteMalDevicesPayload {
  groupId: string;
  names: string[];
}

export interface DeleteMalDevicesResponse {
  deleteMlDevices: string[];
}

export const DELETE_MALDEVICES = gql`
  mutation deleteMlDevices($groupId: ID!, $names: [String!]!) {
    deleteMlDevices(groupId: $groupId, names: $names)
  }
`;
