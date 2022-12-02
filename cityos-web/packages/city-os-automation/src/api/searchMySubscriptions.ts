import gql from 'graphql-tag';

import { PageInfo, SortOrder } from 'city-os-common/libs/schema';

import { PartialRuleSubscription, SubscriptionSortField } from '../libs/type';

export interface SubscriptionFilter {
  keyword?: string;
  sortField?: SubscriptionSortField;
  sortOrder?: SortOrder;
}

export interface SearchMySubscriptionsPayload {
  filter?: SubscriptionFilter | null;
  size?: number | null;
  after?: string | null;
  before?: string | null;
}

export interface SearchMySubscriptionsResponse {
  searchMySubscriptions: {
    totalCount: number;
    pageInfo: PageInfo;
    edges: {
      cursor: string;
      node: PartialRuleSubscription;
    }[];
  };
}

export const SEARCH_MY_SUBSCRIPTIONS = gql`
  query searchMySubscriptions(
    $filter: SubscriptionFilter
    $size: Int
    $before: String
    $after: String
  ) {
    searchMySubscriptions(filter: $filter, size: $size, before: $before, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        beforeCursor
      }
      edges {
        cursor
        node {
          byLine
          byMail
          rule {
            id
            name
            group {
              id
              name
            }
            effectiveAt {
              timezone
              effectiveDate {
                startMonth
                startDay
                endMonth
                endDay
              }
              effectiveWeekday
              effectiveTime {
                fromHour
                fromMinute
                toHour
                toMinute
              }
            }
            logic
            if {
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
              logic
              conditions {
                sensorId
                operator
                value
              }
            }
            then {
              actionType
              ... on NotifyAction {
                users {
                  email
                  name
                }
                message
                snapshot
              }
              ... on DeviceAction {
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
            }
          }
        }
      }
    }
  }
`;
