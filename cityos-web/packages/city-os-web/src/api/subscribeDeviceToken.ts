import gql from 'graphql-tag';

export interface SubscribeDeviceTokenResponse {
  listenVerifyStatusChanged: {
    deviceToken: string | null;
  };
}

export interface SubscribeDeviceTokenPayload {
  refreshToken: string;
}

export const SUBSCRIBE_DEVICE_TOKEN = gql`
  subscription subscribeDeviceToken($refreshToken: String!) {
    listenVerifyStatusChanged(refreshToken: $refreshToken) {
      deviceToken
    }
  }
`;
