import gql from 'graphql-tag';

export interface UpdateFloorplanInput {
  deviceId: string;
  floorNum: number;
  imageId: string;
}

export interface UpdateFloorplanPayload {
  groupId?: string;
  deviceId: string;
  floorNum: number;
  imageId: string | undefined;
}

export interface UpdateFloorplanResponse {
  updateFloorplan: string;
}

export const UPDATE_FLOORPLAN = gql`
  mutation updateFloorplan($groupId: ID!, $deviceId: String!, $floorNum: Int!, $imageId: ID!) {
    updateFloorplan(groupId: $groupId, deviceId: $deviceId, floorNum: $floorNum, imageId: $imageId)
  }
`;
