import { Layout } from 'react-grid-layout';
import Ajv, { JSONSchemaType } from 'ajv';
import extendAjv from 'ajv-keywords';

import {
  ConfigFormType,
  Duration,
  EVChargerStatus,
  GadgetConfig,
  GadgetSize,
  GadgetType,
  GadgetsConfig,
  GridLayoutBreakpoint,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherConditionTime,
} from './type';
import { configFormSet } from './constants';

export const isDurationType = (value: unknown): value is Duration =>
  Object.values<unknown>(Duration).includes(value);

export const isGadgetSize = (value: unknown): value is GadgetSize =>
  Object.values<unknown>(GadgetSize).includes(value);

export const isTemperatureUnit = (value: unknown): value is TemperatureUnit =>
  Object.values<unknown>(TemperatureUnit).includes(value);

export const isWeatherConditionCode = (value: unknown): value is WeatherConditionCode =>
  Object.values<unknown>(WeatherConditionCode).includes(value);

export const isWeatherConditionTime = (value: unknown): value is WeatherConditionTime =>
  Object.values<unknown>(WeatherConditionTime).includes(value);

export const isGridLayoutBreakpoint = (value: unknown): value is GridLayoutBreakpoint =>
  Object.values<unknown>(GridLayoutBreakpoint).includes(value);

export const isEVChargerStatus = (value: unknown): value is EVChargerStatus =>
  Object.values<unknown>(EVChargerStatus).includes(value);

const ajv = new Ajv();
extendAjv(ajv);

const gadgetConfigSchema: JSONSchemaType<GadgetConfig<ConfigFormType>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: Object.values(GadgetType) },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        deviceId: { type: 'string', nullable: true },
        deviceIds: { type: 'array', items: { type: 'string' }, nullable: true },
        groupId: { type: 'string', nullable: true },
        duration: { type: 'string', enum: Object.values(Duration), nullable: true },
        size: { type: 'string', enum: Object.values(GadgetSize), nullable: true },
        title: { type: 'string', nullable: true },
        unit: { type: 'string', enum: Object.values(TemperatureUnit), nullable: true },
      },
    },
  },
};

export type StrictLayout = Pick<Layout, 'i' | 'x' | 'y' | 'w' | 'h'>;
type StrictLayouts = Partial<Record<GridLayoutBreakpoint, StrictLayout[]>>;
interface StrictDashboardConfigJson {
  gadgets: GadgetsConfig;
  layouts: StrictLayouts;
}

const layoutSchema: JSONSchemaType<StrictLayout> = {
  type: 'object',
  additionalProperties: false,
  required: ['i', 'x', 'y', 'w', 'h'],
  properties: {
    i: { type: 'string' },
    x: { type: 'number', minimum: 0, maximum: 3 },
    y: {
      type: 'number',
      minimum: 0,
    },
    w: { type: 'number', minimum: 1, maximum: 2 },
    h: { type: 'number', minimum: 1, maximum: 2 },
  },
};

const layoutsSchema: JSONSchemaType<StrictLayouts> = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    [GridLayoutBreakpoint.lg]: {
      type: 'array',
      items: layoutSchema,
      nullable: true,
      uniqueItemProperties: ['i'],
    },
    [GridLayoutBreakpoint.md]: {
      type: 'array',
      items: layoutSchema,
      nullable: true,
      uniqueItemProperties: ['i'],
    },
    [GridLayoutBreakpoint.sm]: {
      type: 'array',
      items: layoutSchema,
      nullable: true,
      uniqueItemProperties: ['i'],
    },
    [GridLayoutBreakpoint.xs]: {
      type: 'array',
      items: layoutSchema,
      nullable: true,
      uniqueItemProperties: ['i'],
    },
  },
};

const dashboardConfigJsonSchema: JSONSchemaType<StrictDashboardConfigJson> = {
  type: 'object',
  additionalProperties: false,
  required: ['gadgets', 'layouts'],
  properties: {
    gadgets: {
      type: 'array',
      items: gadgetConfigSchema,
      nullable: true,
      uniqueItemProperties: ['id'],
    },
    layouts: layoutsSchema,
  },
};

export const isDashboardConfig = ajv.compile(dashboardConfigJsonSchema);

const LayoutPositionSchema: JSONSchemaType<{ x: number; y: number }> = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  },
};

export const isLayoutPosition = ajv.compile(LayoutPositionSchema);

const DeviceOnlyJsonSchema: JSONSchemaType<GadgetConfig<ConfigFormType.DEVICE_ONLY>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 1 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICE_ONLY] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceId'],
      properties: {
        deviceId: { type: 'string' },
      },
    },
  },
};

export const isDeviceOnly = ajv.compile(DeviceOnlyJsonSchema);

const DevicePluralTitleJsonSchema: JSONSchemaType<
  GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>
> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 1 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICE_PLURAL_TITLE] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceIds'],
      properties: {
        title: { type: 'string' },
        deviceIds: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const isDevicePluralTitle = ajv.compile(DevicePluralTitleJsonSchema);

const DevicesDurationLayoutJsonSchema: JSONSchemaType<
  GadgetConfig<ConfigFormType.DEVICES_DURATION_LAYOUT>
> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICES_DURATION_LAYOUT] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceIds', 'duration', 'size'],
      properties: {
        deviceIds: { type: 'array', items: { type: 'string' } },
        duration: { type: 'string', enum: Object.values(Duration) },
        size: { type: 'string', enum: Object.values(GadgetSize) },
      },
    },
  },
};

export const isDevicesDurationLayout = ajv.compile(DevicesDurationLayoutJsonSchema);

const DivisionOnlyJsonSchema: JSONSchemaType<GadgetConfig<ConfigFormType.DIVISION_ONLY>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 1 },
    height: { type: 'number', minimum: 1, maximum: 1 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DIVISION_ONLY] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['groupId'],
      properties: {
        groupId: { type: 'string' },
      },
    },
  },
};

export const isDivisionOnly = ajv.compile(DivisionOnlyJsonSchema);

const DivisionLayoutJsonSchema: JSONSchemaType<GadgetConfig<ConfigFormType.DIVISION_LAYOUT>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DIVISION_LAYOUT] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['groupId', 'size'],
      properties: {
        groupId: { type: 'string' },
        size: { type: 'string', enum: Object.values(GadgetSize) },
      },
    },
  },
};

export const isDivisionLayout = ajv.compile(DivisionLayoutJsonSchema);

const DeviceDurationLayoutJsonSchema: JSONSchemaType<
  GadgetConfig<ConfigFormType.DEVICE_DURATION_LAYOUT>
> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICE_DURATION_LAYOUT] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceId', 'duration', 'size'],
      properties: {
        deviceId: { type: 'string' },
        duration: { type: 'string', enum: Object.values(Duration) },
        size: { type: 'string', enum: Object.values(GadgetSize) },
      },
    },
  },
};

export const isDeviceDurationLayout = ajv.compile(DeviceDurationLayoutJsonSchema);

const DeviceLayoutJsonSchema: JSONSchemaType<GadgetConfig<ConfigFormType.DEVICE_LAYOUT>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICE_LAYOUT] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceId', 'size'],
      properties: {
        deviceId: { type: 'string' },
        size: { type: 'string', enum: Object.values(GadgetSize) },
      },
    },
  },
};

export const isDeviceLayout = ajv.compile(DeviceLayoutJsonSchema);

const DeviceTemperatureUnitLayoutJsonSchema: JSONSchemaType<
  GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>
> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 2 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceId', 'unit'],
      properties: {
        deviceId: { type: 'string' },
        unit: { type: 'string', enum: Object.values(TemperatureUnit) },
        size: { type: 'string', enum: Object.values(GadgetSize) },
      },
    },
  },
};

export const isDeviceTemperatureUnitLayout = ajv.compile(DeviceTemperatureUnitLayoutJsonSchema);

const DevicesTitleJsonSchema: JSONSchemaType<GadgetConfig<ConfigFormType.DEVICES_TITLE>> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'width', 'height', 'type', 'setting'],
  properties: {
    id: { type: 'string' },
    width: { type: 'number', minimum: 1, maximum: 1 },
    height: { type: 'number', minimum: 1, maximum: 2 },
    type: { type: 'string', enum: configFormSet[ConfigFormType.DEVICES_TITLE] },
    setting: {
      type: 'object',
      additionalProperties: false,
      required: ['deviceIds'],
      properties: {
        title: { type: 'string' },
        deviceIds: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const isDevicesTitle = ajv.compile(DevicesTitleJsonSchema);
