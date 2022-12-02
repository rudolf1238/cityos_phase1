import gql from 'graphql-tag';

import { IDevice } from 'city-os-common/libs/schema';

export interface GetCameraPayload {
  groupId: string;
}

export type PartialNode = Pick<
  IDevice,
  'id' | 'deviceId' | 'name' | 'type' | 'groups' | 'desc' | 'attributes' | 'location'
>;

export interface GetCameraResponse {
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

export const GET_CAMERA = gql`
  query searchDevicesOnDevice($groupId: ID!) {
    searchDevices(groupId: $groupId, size: 10000, filter: { type: CAMERA }) {
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
        }
      }
    }
  }
`;
