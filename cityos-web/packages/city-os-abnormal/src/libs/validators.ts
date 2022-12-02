import { MaldeviceSortField } from './schema';

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isMaldeviceSortField = (value: unknown): value is MaldeviceSortField =>
  isString(value) && value in MaldeviceSortField;
