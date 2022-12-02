import gql from 'graphql-tag';

import { CreateRuleInput, RuleAutomation } from '../libs/type';

export interface CreateRulePayload {
  createRuleInput: CreateRuleInput;
}

export interface CreateRuleResponse {
  createRule: RuleAutomation;
}

export const CREATE_RULE = gql`
  mutation createRule($createRuleInput: CreateRuleInput!) {
    createRule(createRuleInput: $createRuleInput) {
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
        effectiveTime {
          fromHour
          fromMinute
          toHour
          toMinute
        }
        effectiveWeekday
      }
      logic
      if {
        deviceType
        devices {
          deviceId
          name
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
          }
          sensorId
          setValue
        }
      }
    }
  }
`;
