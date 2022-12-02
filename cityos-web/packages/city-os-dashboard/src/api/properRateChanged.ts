import gql from 'graphql-tag';

export interface SubscribeProperRateResponse {
  properRateChanged: {
    time: number;
    errors: number;
    properRate: number;
    total: number;
  };
}

export interface SubscribeProperRatePayload {
  groupId: string;
}

export const SUBSCRIBE_PROPER_RATE = gql`
  subscription properRateChanged($groupId: ID!) {
    properRateChanged(groupId: $groupId) {
      time
      errors
      properRate
      total
    }
  }
`;
