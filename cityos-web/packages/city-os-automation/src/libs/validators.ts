import { DeviceType } from 'city-os-common/libs/schema';

import { Logic, RuleSortField, TriggerOperator } from './type';

export const isRuleSortField = (value: unknown): value is RuleSortField =>
  Object.values<unknown>(RuleSortField).includes(value);

export const isLogic = (value: unknown): value is Logic =>
  Object.values<unknown>(Logic).includes(value);

export const isTriggerOperator = (value: unknown): value is TriggerOperator =>
  Object.values<unknown>(TriggerOperator).includes(value);

export const isDeviceType = (value: unknown): value is DeviceType =>
  Object.values<unknown>(DeviceType).includes(value);
