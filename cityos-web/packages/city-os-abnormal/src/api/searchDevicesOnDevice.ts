import gql from 'graphql-tag';

import { DeviceFilter, IDevice } from 'city-os-common/libs/schema';

export interface SearchDevicesPayload {
  groupId: string;
  filter?: DeviceFilter | null;
  size?: number | null; // null would get all devices; undefined would set default size (10)
  after?: string | null;
}

export type PartialNode = Pick<
  IDevice,
  'deviceId' | 'name' | 'type' | 'groups' | 'desc' | 'attributes' | 'location'
>;

export interface SearchDevicesResponse {
  searchDevices: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: PartialNode;
    }[];
  };
}

export const SEARCH_DEVICES_ON_DEVICE = gql`
  query searchDevicesOnDevice($groupId: String, $filter: DeviceFilter, $size: Int, $after: String) {
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
          groups {
            id
            name
          }
          desc
          status
          location {
            lat
            lng
          }
          attributes {
            key
            value
          }
        }
      }
    }
  }
`;
