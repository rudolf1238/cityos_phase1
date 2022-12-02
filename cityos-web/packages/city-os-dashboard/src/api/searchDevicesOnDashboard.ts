import gql from 'graphql-tag';

import { DeviceFilter, IDevice } from 'city-os-common/libs/schema';

export interface SearchDevicesOnDashboardPayload {
  groupId: string;
  filter?: DeviceFilter | null;
  size?: number | null; // null would get all devices; undefined would set default size (10)
  after?: string | null;
}

export interface SearchDevicesOnDashboardResponse {
  searchDevices: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: Pick<IDevice, 'deviceId' | 'name' | 'type' | 'sensors' | 'imageIds'>;
    }[];
  };
}

export const SEARCH_DEVICES_ON_DASHBOARD = gql`
  query searchDevicesOnDashboard($groupId: ID!, $filter: DeviceFilter, $size: Int, $after: String) {
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
          sensors {
            sensorId
            type
          }
          imageIds
        }
      }
    }
  }
`;
