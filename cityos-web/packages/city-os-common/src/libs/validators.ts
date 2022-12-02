import Ajv, { JSONSchemaType } from 'ajv';
import fnsIsDate from 'date-fns/isDate';

import {
  CutRange,
  DeviceStatus,
  DeviceType,
  GPSPoint,
  GPSRect,
  Gender,
  Language,
  SensorId,
  MaintainStatus,
  SortField,
  SortOrder,
  UserSortField,
  VerifyType,
} from './schema';

import { WifiSortField } from '../../../city-os-wifi/src/libs/schema';

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number => typeof value === 'number';

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

export const isArray = (value: unknown): value is unknown[] =>
  !!value && typeof value === 'object' && Array.isArray(value);

export const isNotEmpty = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const isStringRecord = (value: unknown): value is Partial<Record<string, string>> =>
  isObject(value) && Object.values(value).every(isString);

export const isNumberString = (value: unknown): value is string =>
  isString(value) && !Number.isNaN(parseFloat(value));

export const isFilterType = (value: unknown): value is DeviceType | 'ALL' =>
  Object.values<unknown>(DeviceType).includes(value) || value === 'ALL';

export const isSortOrder = (value: unknown): value is SortOrder =>
  Object.values<unknown>(SortOrder).includes(value);

export const isSortField = (value: unknown): value is SortField =>
  Object.values<unknown>(SortField).includes(value);

export const isWifiSortField = (value: unknown): value is WifiSortField =>
  Object.values<unknown>(WifiSortField).includes(value);

export const isVerifyType = (value: unknown): value is VerifyType =>
  Object.values<unknown>(VerifyType).includes(value);

export const isDeviceStatus = (value: unknown): value is DeviceStatus =>
  Object.values<unknown>(DeviceStatus).includes(value);

export const isSensorId = (value: unknown): value is SensorId =>
  Object.values<unknown>(SensorId).includes(value);

export const isFilterDeviceStatus = (value: unknown): value is DeviceStatus | 'ALL' =>
  Object.values<unknown>(DeviceStatus).includes(value) || value === 'ALL';

export const isMaintainStatus = (value: unknown): value is MaintainStatus | 'ALL' | undefined =>
  Object.values<unknown>(MaintainStatus).includes(value) || value === 'ALL';

export const isUserSortField = (value: unknown): value is UserSortField =>
  Object.values<unknown>(UserSortField).includes(value);

export const isLanguage = (value: unknown): value is Language =>
  Object.values<unknown>(Language).includes(value);

export const isGender = (value: unknown): value is Gender =>
  Object.values<unknown>(Gender).includes(value);

export const isDate = (value: unknown): value is Date => fnsIsDate(value);

const ajv = new Ajv();

const GPSPointSchema: JSONSchemaType<GPSPoint> = {
  type: 'object',
  additionalProperties: false,
  required: ['lat', 'lng'],
  properties: {
    lat: { type: 'number', maximum: 90, minimum: -90 },
    lng: { type: 'number', maximum: 180, minimum: -180 },
  },
};

const GPSRectSchema: JSONSchemaType<GPSRect> = {
  type: 'object',
  additionalProperties: false,
  required: ['sw', 'ne'],
  properties: {
    sw: { ...GPSPointSchema, nullable: true },
    ne: { ...GPSPointSchema, nullable: true },
  },
};

export const isGPSRect = ajv.compile(GPSRectSchema);

const CutRangeSchema: JSONSchemaType<CutRange> = {
  type: 'array',
  items: [{ type: 'number' }, { type: 'number' }],
  minItems: 2,
  maxItems: 2,
};

export const isCutRange = ajv.compile(CutRangeSchema);
