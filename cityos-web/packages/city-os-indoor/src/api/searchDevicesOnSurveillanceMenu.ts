import gql from 'graphql-tag';

import { DeviceConnection, DeviceFilter } from 'city-os-common/libs/schema';

export interface SearchDevicesPayload {
  groupId: string;
  filter?: DeviceFilter | null;
  after?: string | null;
  /** null would get all devices; undefined would set default size (10) */
  size?: number | null;
}

export interface SearchDevicesResponse {
  searchDevices: DeviceConnection;
}

export const SEARCH_DEVICES_ON_SURVEILLANCE_MENU = gql`
  query searchDevicesOnSurveillanceMenu(
    $groupId: ID!
    $filter: DeviceFilter
    $size: Int
    $after: String
  ) {
    searchDevices(groupId: $groupId, filter: $filter, size: $size, after: $after) {
      edges {
        node {
          type
          deviceId
          name
          location {
            lat
            lng
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
