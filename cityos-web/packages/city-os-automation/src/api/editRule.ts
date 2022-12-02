import gql from 'graphql-tag';

import {
  AutomationTrigger,
  DeviceAction,
  EffectiveAt,
  Logic,
  NotifyAction,
  RuleAutomation,
} from '../libs/type';

interface AutomationTriggerInput extends Pick<AutomationTrigger, 'deviceType' | 'conditions'> {
  deviceIds: string[];
  logic?: Logic | null;
}

interface NotifyActionInput extends Pick<NotifyAction, 'message' | 'snapshot'> {
  userMails: string[];
}

interface DeviceActionInput extends Pick<DeviceAction, 'deviceType' | 'sensorId' | 'setValue'> {
  deviceIds: string[];
}

export interface EditRuleInput {
  name?: string;
  effectiveAtInput?: EffectiveAt;
  // undefined or null means not to update
  logic?: Logic | null;
  if?: AutomationTriggerInput[];
  thenNotify?: NotifyActionInput[];
  thenDevice?: DeviceActionInput[];
}

export interface EditRulePayload {
  ruleId: string;
  editRuleInput: EditRuleInput;
}

export interface EditRuleResponse {
  editRule: RuleAutomation;
}

export const EDIT_RULE = gql`
  mutation editRule($ruleId: ID!, $editRuleInput: EditRuleInput!) {
    editRule(ruleId: $ruleId, editRuleInput: $editRuleInput) {
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
`;
