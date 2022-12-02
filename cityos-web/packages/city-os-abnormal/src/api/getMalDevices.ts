import gql from 'graphql-tag';

import { MalDevice, MaldeviceFilter } from '../libs/schema';

export interface GetMalDevicePayload {
  groupId: string | undefined;
  filter?: MaldeviceFilter;
  size?: number;
  after?: string;
}

export type PartialNode = Required<
  Pick<MalDevice, 'name' | 'deviceType' | 'notifyType' | 'division_id' | 'status'>
>;
export interface GetDeviceResponse {
  // malDevices: Required<MalDevice>[];
  getMalDevices: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: Required<PartialNode>;
    }[];
  };
}

export const GET_MALDEVICES_ON_DEVICE = gql`
  query getMalDevices($groupId: ID, $filter: MaldeviceFilter, $size: Int, $after: String) {
    getMalDevices(groupId: $groupId, filter: $filter, size: $size, after: $after) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          name
          deviceType
          notifyType
          division_id
          status
        }
      }
    }
  }
`;
