import gql from 'graphql-tag';

export interface PossibleUsersPayload {
  keyword: string;
  size?: number | null;
  groupId?: string;
}

export interface PossibleUser {
  name: string | null;
  email: string;
}

export interface PossibleUsersResponse {
  possibleUsers: PossibleUser[] | null;
}

export const POSSIBLE_USERS = gql`
  query possibleUsers($keyword: String!, $size: Int, $groupId: ID) {
    possibleUsers(keyword: $keyword, size: $size, groupId: $groupId) {
      name
      email
    }
  }
`;
