import gql from 'graphql-tag';

import { GetBuildings } from '../libs/type';

export interface DeviceFilter {
  deviceId: string;
}

export interface GetFullBuildingsPayload {
  groupId: string;
  filter?: DeviceFilter;
}

export interface GetFullBuildingsResponse {
  getBuildings: GetBuildings;
}

export const GET_FULL_BUILDINGS = gql`
  query getBuildings($groupId: ID!, $filter: DeviceFilter) {
    getBuildings(groupId: $groupId, filter: $filter) {
      edges {
        deviceCount
        node {
          deviceId
          name
          desc
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
          attributes {
            key
            value
          }
          address {
            language
            detail {
              country
              city
              formattedAddress
            }
          }
          floors {
            id
            name
            floorNum
            devices {
              id
              deviceId
              name
              desc
              type
              attributes {
                key
                value
              }
            }
            imageLeftTop
            imageRightBottom
          }
        }
      }
    }
  }
`;
