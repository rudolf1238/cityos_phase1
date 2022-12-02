import gql from 'graphql-tag';

import { Group } from 'city-os-common/libs/schema';

export interface GetGroupPayload {
  groupId: string;
}

export interface GetGroupResponse {
  getGroup: Group;
}

export const GET_GROUP = gql`
  query getGroup($groupId: ID!) {
    getGroup(groupId: $groupId) {
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
