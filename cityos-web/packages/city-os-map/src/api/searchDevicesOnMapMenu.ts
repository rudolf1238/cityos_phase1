import gql from 'graphql-tag';

import { DeviceConnection, DeviceFilter } from 'city-os-common/libs/schema';

export interface SearchDevicesPayload {
  groupId: string;
  filter?: DeviceFilter | null;
  after?: string | null;
  size?: number | null; // null would get all devices; undefined would set default size (10)
}

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export const SEARCH_DEVICES_ON_MAP_MENU = gql`
  query searchDevicesOnMapMenu($groupId: ID!, $filter: DeviceFilter, $size: Int, $after: String) {
    searchDevices(groupId: $groupId, filter: $filter, size: $size, after: $after) {
      edges {
        node {
          ... on Lamp {
            type
            deviceId
            name
            desc
            status
            location {
              lat
              lng
            }
            related {
              deviceId
              type
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;
