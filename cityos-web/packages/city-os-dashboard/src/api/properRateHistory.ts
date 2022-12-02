import gql from 'graphql-tag';

export interface ProperRateHistoryPayload {
  groupId: string;
  start: Date;
  end: Date;
}

export interface ProperRateHistoryResponse {
  properRateHistory: {
    time: number;
    errors: number;
    properRate: number;
    total: number;
  }[];
}

export const PROPER_RATE_HISTORY = gql`
  query properRateHistory($groupId: ID!, $start: Date!, $end: Date!) {
    properRateHistory(groupId: $groupId, start: $start, end: $end) {
      time
      errors
      properRate
      total
    }
  }
`;
