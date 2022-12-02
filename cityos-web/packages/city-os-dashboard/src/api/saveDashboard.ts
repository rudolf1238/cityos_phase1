import gql from 'graphql-tag';

export interface SaveDashboardPayload {
  index: number;
  config: string;
}

export interface SaveDashboardResponse {
  saveDashboard: boolean;
}

export const SAVE_DASHBOARD = gql`
  mutation saveDashboard($index: Int!, $config: String!) {
    saveDashboard(index: $index, config: $config)
  }
`;
