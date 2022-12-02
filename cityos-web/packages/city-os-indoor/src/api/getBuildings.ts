import gql from 'graphql-tag';

import { GetBuildings } from '../libs/type';

export interface GetBuildingsPayload {
  groupId: string;
}

export interface GetBuildingsResponse {
  getBuildings: GetBuildings;
}

export const GET_BUILDINGS = gql`
  query getBuildings($groupId: ID!) {
    getBuildings(groupId: $groupId) {
      edges {
        deviceCount
        node {
          deviceId
          location {
            lat
            lng
          }
        }
      }
    }
  }
`;
