import { GPSPoint } from 'city-os-common/libs/schema';
import gql from 'graphql-tag';

export interface BuildingInput {
  name: string;
  desc?: string;
  buildingType?: string;
  floors: FloorInput[];
  location: GPSPointInput | undefined;
  x?: string | undefined;
  y?: string | undefined;
  degree?: string | undefined;
}

export interface GPSPointInput {
  lat: number;
  lng: number;
}
export interface FloorInput {
  id?: string | undefined;
  name: string;
  floorNum: number;
  devices: string[];
  imageLeftTop?: [string, string];
  imageRightBottom?: [string, string];
}

export interface UpdateBuildingInfoPayload {
  groupId?: string;
  deviceId: string;
  buildingInput: BuildingInput;
}

export interface UpdateBuildingInfoResponse {
  updateBuilding: boolean;
}

export const UPDATE_BUILDING = gql`
  mutation updateBuilding($groupId: ID!, $deviceId: String!, $buildingInput: BuildingInput!) {
    updateBuilding(groupId: $groupId, deviceId: $deviceId, buildingInput: $buildingInput)
  }
`;
