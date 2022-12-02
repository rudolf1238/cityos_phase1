import gql from 'graphql-tag';

import { DeviceFilter, IDevice } from 'city-os-common/libs/schema';

export interface SearchDevicesByStaffGroup {
  value: string;
  label: string;
  id: string;
}
export interface SearchDevicesByStaffPayload {
  userId?: string;
  groupId: string;
  filter?: DeviceFilter;
  size?: number;
  after?: string;
}

export type PartialNode = Required<
  Pick<
    IDevice,
    'deviceId' | 'name' | 'type' | 'groups' | 'desc' | 'status' | 'attributes' | 'location'
  >
>;
// export interface SearchDevicesResponse {
// device: {
// }
// }
export interface Response {
  id: string;
  userId: string;
}

export interface SearchDevicesByStaffResponse {
  getMaintenance_devicelist: {
    groups: SearchDevicesByStaffGroup[];
    edges: {
      node: Response;
      device: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
        edges: [
          {
            node: PartialNode;
          },
        ];
      };
    }[];
  };
}

export const SEARCH_DEVICES_ON_DEVICE_BY_STAFF = gql`
  query getDeviceOnDeviceByStaff(
    $groupId: ID!
    $userId: String!
    $filter: DeviceFilter
    $size: Int
    $after: String
  ) {
    getMaintenance_devicelist(
      groupId: $groupId
      userId: $userId
      filter: $filter
      size: $size
      after: $after
    ) {
      groups {
        id
        value
        label
      }
      edges {
        node {
          id
          userId
        }
        device {
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
    }
  }
`;
