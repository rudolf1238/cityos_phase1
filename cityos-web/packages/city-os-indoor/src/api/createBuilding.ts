import gql from 'graphql-tag';

export interface GPSPointInput {
  lat: number;
  lng: number;
}

export interface FloorInput {
  id: string;
  name: string;
  floorNum: number;
  devices: string[];
  imageLeftTop?: [string, string];
  imageRightBottom?: [string, string];
}

export interface BuildingInput {
  name: string;
  desc?: string;
  floors?: FloorInput[];
  location: GPSPointInput;
  buildingType?: string;
  x?: string;
  y?: string;
  degree?: string;
}

export interface CreateBuildingPayload {
  groupId: string;
  buildingInput: BuildingInput;
}

export interface CreateBuildingResponse {
  createBuilding: string;
}

export const CREATE_BUILDING = gql`
  mutation createBuilding($groupId: ID!, $buildingInput: BuildingInput!) {
    createBuilding(groupId: $groupId, buildingInput: $buildingInput)
  }
`;
