import gql from 'graphql-tag';

import { DashboardConfig } from '../libs/type';

export interface ReadDashboardResponse {
  readDashboard: DashboardConfig[] | null;
}

export const READ_DASHBOARD = gql`
  query READ_DASHBOARD {
    readDashboard {
      index
      config
    }
  }
`;
