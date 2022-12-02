import { DeviceType, Group, IDevice, Sensor, User } from 'city-os-common/libs/schema';

export enum Logic {
  AND = 'AND',
  OR = 'OR',
}

export enum TriggerOperator {
  GREATER = 'GREATER',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  LESS = 'LESS',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  BETWEEN = 'BETWEEN',
  UPDATED = 'UPDATED',
  CONTAIN = 'CONTAIN',
  IS_ONE_OF = 'IS_ONE_OF',
}

export interface Condition {
  sensorId: string;
  operator: TriggerOperator;
  value: string;
}

export interface AutomationTrigger {
  deviceType: DeviceType;
  devices: IDevice[];
  logic?: Logic | null;
  conditions: Condition[];
}

export enum ActionType {
  NOTIFY = 'NOTIFY',
  DEVICE = 'DEVICE',
}

export enum NotifyContentTag {
  TRIGGERED_EXPRESSION = 'TRIGGERED_EXPRESSION',
  TRIGGERED_TIME = 'TRIGGERED_TIME',
  TRIGGERED_CURRENT_VALUE = 'TRIGGERED_CURRENT_VALUE',
}

export interface NotifyAction {
  actionType: ActionType.NOTIFY;
  users: Pick<User, 'email' | 'name'>[];
  message: string;
  snapshot: boolean;
}

export interface DeviceAction {
  actionType: ActionType.DEVICE;
  deviceType: DeviceType;
  devices: PartialDevice[];
  sensorId: string;
  setValue: string;
}

export enum SwitchValue {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

export type AutomationAction = NotifyAction | DeviceAction;

export interface EffectiveDate {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export interface EffectiveTime {
  fromHour: number;
  fromMinute: number;
  toHour: number;
  toMinute: number;
}

export const weekDay = {
  SUNDAY: 7,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type WeekDay = typeof weekDay[keyof typeof weekDay];

export interface EffectiveAt {
  /**
   * IANA timezone name
   *
   * e.g. America/Los_Angeles
   */
  timezone: string;
  effectiveDate: EffectiveDate;
  /** Between 1 and 7, 1 for Monday */
  effectiveWeekday: WeekDay[];
  effectiveTime: EffectiveTime;
}

export interface RuleAutomation {
  id: string;
  name: string;
  group: Group;
  effectiveAt: EffectiveAt;
  logic?: Logic | null;
  if: AutomationTrigger[];
  then: AutomationAction[];
}

export enum RuleSortField {
  ID = 'ID',
  NAME = 'NAME',
  EFFECTIVE_DATE = 'EFFECTIVE_DATE',
  EFFECTIVE_TIME = 'EFFECTIVE_TIME',
}

export interface RuleSubscription {
  rule: RuleAutomation;
  byLine: boolean;
  byMail: boolean;
}

export enum SubscriptionSortField {
  ID = 'ID',
  NAME = 'NAME',
  GROUP = 'GROUP',
  EFFECTIVE_DATE = 'EFFECTIVE_DATE',
  EFFECTIVE_TIME = 'EFFECTIVE_TIME',
}

export interface PartialDevice extends Pick<IDevice, 'deviceId' | 'name'> {
  sensors: Pick<Sensor, 'sensorId' | 'type' | 'unit'>[] | null;
}

export interface PartialAutomationTrigger extends Omit<AutomationTrigger, 'devices'> {
  devices: PartialDevice[];
}

export interface PartialRuleAutomation extends Omit<RuleAutomation, 'group' | 'if'> {
  group: Pick<Group, 'name' | 'id'>;
  if: PartialAutomationTrigger[];
}

export interface PartialRuleSubscription extends Omit<RuleSubscription, 'rule'> {
  rule: PartialRuleAutomation;
}

export interface AutomationTriggerInput
  extends Pick<AutomationTrigger, 'deviceType' | 'conditions'> {
  deviceIds: string[];
  logic?: Logic;
}

export interface NotifyActionInput extends Pick<NotifyAction, 'message' | 'snapshot'> {
  userMails: string[];
}

export interface DeviceActionInput
  extends Pick<DeviceAction, 'deviceType' | 'sensorId' | 'setValue'> {
  deviceIds: string[];
}

export interface CreateRuleInput {
  name: string;
  groupId: string;
  effectiveAtInput: EffectiveAt;
  logic?: Logic;
  if: AutomationTriggerInput[];
  thenNotify: NotifyActionInput[];
  thenDevice: DeviceActionInput[];
}

export interface RuleAuditLog {
  /**  Date number in millisecond */
  triggeredTime: number;
  rule: Pick<PartialRuleAutomation, 'id' | 'name' | 'group'>;
  triggeredCurrentValue: string;
  triggeredExpression: string;
  notifyActions: NotifyAction[];
  deviceActions: DeviceAction[];
}

export enum AuditLogSortField {
  ID = 'ID',
  NAME = 'NAME',
  GROUP = 'GROUP',
  TIME = 'TIME',
}
