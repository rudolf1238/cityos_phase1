import gql from 'graphql-tag';

// import { GPSPoint } from 'city-os-common/libs/schema';

export interface FloorInput {
  id: string | undefined;
  name: string;
  floorNum: number;
  devices: string[];
  imageLeftTop?: [string, string];
  imageRightBottom?: [string, string];
}

export interface GPSPointInput {
  lat: number;
  lng: number;
}

export interface BuildingInput {
  name: string;
  desc?: string;
  floors?: FloorInput[];
  location?: GPSPointInput | undefined;
  buildingType?: string;
  x?: string;
  y?: string;
  degree?: string;
}

export interface UpdateBuildingPayload {
  groupId: string;
  deviceId: string;
  buildingInput: BuildingInput;
}

export interface UpdateBuildingResponse {
  updateBuilding: boolean;
}

export const UPDATE_BUILDING = gql`
  mutation updateBuilding($groupId: ID!, $deviceId: String!, $buildingInput: BuildingInput!) {
    updateBuilding(groupId: $groupId, deviceId: $deviceId, buildingInput: $buildingInput)
  }
`;
