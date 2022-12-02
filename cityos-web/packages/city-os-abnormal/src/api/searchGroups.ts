import gql from 'graphql-tag';

import { Group } from 'city-os-common/libs/schema';

export interface SearchGroupsResponse {
  searchGroups: Required<Group>[];
}

export const SEARCH_GROUPS = gql`
  query searchGroups {
    searchGroups {
      id
      name
      ancestors
      projectKey
      sensorMask {
        enable
        sensors {
          deviceType
          sensorId
        }
      }
      subGroups
      sensors {
        sensorId
        name
        desc
        type
        unit
        attributes {
          key
          value
        }
      }
      deviceCount
      userCount
      level
    }
  }
`;
