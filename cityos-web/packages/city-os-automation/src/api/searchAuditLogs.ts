import gql from 'graphql-tag';

import { PageInfo, SortOrder } from 'city-os-common/libs/schema';

import { AuditLogSortField, RuleAuditLog } from '../libs/type';

export interface AuditLogFilter {
  keyword?: string;
  sortField?: AuditLogSortField;
  sortOrder?: SortOrder;
}

export interface SearchAuditLogsPayload {
  filter?: AuditLogFilter | null;
  size?: number | null;
  after?: string | null;
  before?: string | null;
}

export interface SearchAuditLogsResponse {
  searchAuditLogs: {
    totalCount: number;
    pageInfo: PageInfo;
    edges: {
      node: RuleAuditLog;
    }[];
  };
}

export const SEARCH_AUDIT_LOGS = gql`
  query searchAuditLogs($filter: AuditLogFilter, $size: Int, $before: String, $after: String) {
    searchAuditLogs(filter: $filter, size: $size, before: $before, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        beforeCursor
      }
      edges {
        node {
          triggeredTime
          triggeredExpression
          triggeredCurrentValue
          notifyActions {
            actionType
            users {
              email
              name
            }
            message
            snapshot
          }
          deviceActions {
            actionType
            deviceType
            devices {
              deviceId
              name
              sensors {
                sensorId
                type
                unit
              }
            }
            sensorId
            setValue
          }
          rule {
            id
            name
            group {
              id
              name
            }
          }
        }
      }
    }
  }
`;
