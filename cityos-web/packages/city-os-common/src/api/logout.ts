import gql from 'graphql-tag';

export interface LogoutPayload {
  refreshToken: string;
}

export interface LogoutResponse {
  logout: boolean;
}

export const LOGOUT = gql`
  mutation logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;
