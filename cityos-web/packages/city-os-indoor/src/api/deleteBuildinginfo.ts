import gql from 'graphql-tag';

export interface DeleteBuildingInfoPayload {
  groupId?: string;
  deviceId: string;
}

export interface DeleteBuildingInfoResponse {
  deleteBuilding: boolean;
}

export const DELETE_BUILDING = gql`
  mutation deleteBuilding($groupId: ID!, $deviceId: String!) {
    deleteBuilding(groupId: $groupId, deviceId: $deviceId)
  }
`;
