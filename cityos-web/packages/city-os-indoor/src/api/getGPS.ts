import gql from 'graphql-tag';

export interface GetGPSResponse {
  getLatLonByAddress: {
    lat: number;
    lng: number;
  };
}

export interface GetGPSPayload {
  address: string;
}

export const GET_GPS = gql`
  query getLatLonByAddress($address: String!) {
    getLatLonByAddress(address: $address) {
      lat
      lng
    }
  }
`;
