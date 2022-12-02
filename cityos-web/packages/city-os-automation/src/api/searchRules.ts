import gql from 'graphql-tag';

import { Group, IDevice, PageInfo, Sensor, SortOrder, User } from 'city-os-common/libs/schema';

import {
  Condition,
  DeviceAction,
  EffectiveAt,
  NotifyAction,
  PartialAutomationTrigger,
  PartialRuleAutomation,
  RuleSortField,
} from '../libs/type';

export interface RuleFilter {
  keyword?: string;
  sortField?: RuleSortField;
  sortOrder?: SortOrder;
}

type PartialDeviceWithTypename = Pick<IDevice, 'deviceId' | 'name'> & {
  __typename: 'Device';
  sensors: (Pick<Sensor, 'sensorId' | 'type' | 'unit'> & { __typename: 'Sensor' })[] | null;
};

interface PartialRuleAutomationWithTypename
  extends Pick<PartialRuleAutomation, 'id' | 'name' | 'logic'> {
  __typename: 'RuleAutomation';
  group: Pick<Group, 'name' | 'id'> & { __typename: 'Group' };
  effectiveAt: EffectiveAt & {
    __typename: 'EffectiveAt';
    effectiveDate: {
      __typename: 'EffectiveDate';
    };
    effectiveTime: {
      __typename: 'EffectiveTime';
    };
  };
  if: (Pick<PartialAutomationTrigger, 'deviceType' | 'logic'> & {
    __typename: 'AutomationTrigger';
    devices: PartialDeviceWithTypename[];
    conditions: (Condition & { __typename: 'Condition' })[];
  })[];
  then: (
    | (Omit<DeviceAction, 'devices'> & {
        __typename: 'DeviceAction';
        devices: PartialDeviceWithTypename[];
      })
    | (Omit<NotifyAction, 'users'> & {
        __typename: 'NotifyAction';
        users: (Pick<User, 'email' | 'name'> & { __typename: 'User' })[];
      })
  )[];
}

export interface SearchRulesPayload {
  groupId: string;
  filter?: RuleFilter | null;
  size?: number | null;
  after?: string | null;
  before?: string | null;
}

export interface SearchRulesResponse {
  searchRules: {
    __typename: 'RuleConnection';
    totalCount: number;
    pageInfo: PageInfo & { __typename: 'PageInfo' };
    edges: {
      __typename: 'RuleEdge';
      node: PartialRuleAutomationWithTypename;
    }[];
  };
}

export const SEARCH_RULES = gql`
  query searchRules(
    $groupId: ID!
    $filter: RuleFilter
    $size: Int
    $before: String
    $after: String
  ) {
    searchRules(groupId: $groupId, filter: $filter, size: $size, before: $before, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        beforeCursor
      }
      edges {
        node {
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
`;
