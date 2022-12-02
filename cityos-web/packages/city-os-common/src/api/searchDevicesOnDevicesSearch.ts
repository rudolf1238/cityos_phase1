import gql from 'graphql-tag';

import { DeviceFilter, IDevice } from '../libs/schema';

export interface SearchDevicesOnDevicesSearchPayload {
  groupId: string;
  filter?: DeviceFilter | null;
  size?: number | null;
  after?: string | null;
}

export interface SearchDevicesOnDevicesSearchResponse {
  searchDevices: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: Pick<IDevice, 'deviceId' | 'name' | 'type' | 'location' | 'groups' | 'sensors'>;
    }[];
  };
}

export const SEARCH_DEVICES_ON_DEVICES_SEARCH = gql`
  query searchDevicesOnDevicesSearch(
    $groupId: ID!
    $filter: DeviceFilter
    $size: Int
    $after: String
  ) {
    searchDevices(groupId: $groupId, filter: $filter, size: $size, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          deviceId
          name
          type
          location {
            lat
            lng
          }
          groups {
            projectKey
          }
          sensors {
            sensorId
            type
            unit
          }
        }
      }
    }
  }
`;
