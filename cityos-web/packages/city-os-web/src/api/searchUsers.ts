import gql from 'graphql-tag';

import { Group, Permission, User } from 'city-os-common/libs/schema';

import { UserFilter } from '../libs/schema';

export interface SearchUsersPayload {
  groupId: string;
  filter?: UserFilter | null;
  size?: number | null;
  after?: string | null;
}

export interface PartialNode extends Pick<User, 'email' | 'name' | 'phone' | 'status'> {
  groups: {
    group: Pick<Group, 'id' | 'name'>;
    permission: Permission;
  }[];
}

export interface SearchUsersResponse {
  searchUsers: {
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

export const SEARCH_USERS = gql`
  query searchUsers($groupId: ID!, $filter: UserFilter, $size: Int, $after: String) {
    searchUsers(groupId: $groupId, filter: $filter, size: $size, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          email
          name
          phone
          status
          groups {
            group {
              id
              name
            }
            permission {
              rules {
                subject
                action
              }
            }
          }
        }
      }
    }
  }
`;
