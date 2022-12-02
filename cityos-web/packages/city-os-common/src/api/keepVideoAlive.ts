import gql from 'graphql-tag';

export interface KeepVideoAliveResponse {
  keepVideoAlive: {
    expiredAt: number;
  };
}

export interface KeepVideoAlivePayload {
  token: string;
  urlTokenList: string[];
}

export const KEEP_VIDEO_ALIVE = gql`
  mutation keepVideoAlive($token: String!, $urlToken: [String!]!) {
    keepVideoAlive(token: $token, urlTokenList: $urlToken) {
      expiredAt
    }
  }
`;
