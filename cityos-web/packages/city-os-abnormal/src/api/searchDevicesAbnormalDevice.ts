import gql from 'graphql-tag';

import { DeviceFilter, IDevice } from 'city-os-common/libs/schema';

export interface SearchDevicesPayloadAbnormal {
  groupId: string;
  filter?: DeviceFilter;
  size?: number;
  skip?: number;
}

export type PartialNodeAbnormal = Required<
  Pick<
    IDevice,
    | 'deviceId'
    | 'name'
    | 'type'
    | 'groups'
    | 'desc'
    | 'status'
    | 'attributes'
    | 'location'
    | 'maintainstatus'
  >
>;

export interface SearchDevicesResponseAbnormal {
  searchAbnormalDevices: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: PartialNodeAbnormal;
    }[];
  };
}

export const SEARCH_DEVICES_ABNORMAL_DEVICE = gql`
  query searchDevicesAbnormalDevice($groupId: ID!, $filter: DeviceFilter, $size: Int, $skip: Int) {
    searchAbnormalDevices(groupId: $groupId, filter: $filter, size: $size, skip: $skip) {
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
          maintainstatus
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
