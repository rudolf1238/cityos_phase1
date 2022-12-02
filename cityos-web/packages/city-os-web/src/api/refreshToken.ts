import gql from 'graphql-tag';

export interface RefreshTokenPayload {
  refreshToken: string;
  deviceToken: string;
}

export interface RefreshTokenResponse {
  refreshToken: {
    accessToken: string;
    refreshToken: string;
  };
}

export const REFRESH_TOKEN = gql`
  mutation refreshToken($refreshToken: String!, $deviceToken: String!) {
    refreshToken(refreshToken: $refreshToken, deviceToken: $deviceToken) {
      accessToken
      refreshToken
    }
  }
`;
