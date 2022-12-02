import gql from 'graphql-tag';

export interface DeviceBindingPayload {
  refreshToken: string;
}

export type DeviceBindingResponse = {
  deviceBinding: boolean;
};

export const DEVICE_BINDING = gql`
  mutation deviceBinding($refreshToken: String!) {
    deviceBinding(refreshToken: $refreshToken)
  }
`;
