import gql from 'graphql-tag';

import { Building } from '../libs/typebuilding';

import { GPSPoint, IDevice } from 'city-os-common/libs/schema';

export interface DeviceFilter {
  deviceId: string;
}

export interface GPSPointInput {
  lat: number;
  lng: number;
}

export interface GetBuildingPayload {
  groupId: string | undefined;
  filter?: DeviceFilter;
}

export interface GetBuildingResponse {
  getBuildings: {
    edges: {
      deviceCount: number;
      node: Building;
    }[];
  };
}

/*
export type edges = {
      deviceCount: number;
      node: Building;      
}
*/

export const GET_BUILDINGINFO = gql`
  query getBuildings($groupId: ID!, $filter: DeviceFilter) {
    getBuildings(groupId: $groupId, filter: $filter) {
      edges {
        deviceCount
        node {
          deviceId
          name
          desc
          uri
          type
          groups {
            id
            name
          }
          status
          maintainstatus
          location {
            lat
            lng
          }
          address {
            language
            detail {
              country
              city
              formattedAddress
            }
          }
          attributes {
            key
            value
          }
          floors {
            id
            floorNum
            name
            devices {
              id
              deviceId
              name
              desc
              type
            }
            imageLeftTop
            imageRightBottom
          }
        }
      }
    }
  }
`;
