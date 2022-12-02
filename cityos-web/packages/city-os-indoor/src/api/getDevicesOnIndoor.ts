import gql from 'graphql-tag';

import { DeviceType, IDevice } from 'city-os-common/libs/schema';

export interface GetDevicesPayload {
  groupId: string;
  size?: number | null;
  deviceType?: DeviceType | null;
}

export type PartialNode = Pick<
  IDevice,
  'id' | 'deviceId' | 'name' | 'type' | 'groups' | 'desc' | 'attributes' | 'location' | 'imageIds'
>;

export interface GetDevicesResponse {
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

export const GET_DEVICES = gql`
  query searchDevicesOnIndoor($groupId: ID!, $size: Int = 10000, $deviceType: DeviceType = null) {
    searchDevices(groupId: $groupId, size: $size, filter: { type: $deviceType }) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
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
          imageIds
        }
      }
    }
  }
`;
