import gql from 'graphql-tag';

export interface DeleteUsersPayload {
  groupId: string;
  emails: string[];
}

export interface DeleteUsersResponse {
  deleteUsers: string[];
}

export const DELETE_USERS = gql`
  mutation deleteUsers($groupId: ID!, $emails: [String!]!) {
    deleteUsers(groupId: $groupId, emails: $emails)
  }
`;
