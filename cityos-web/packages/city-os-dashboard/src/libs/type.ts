import { FunctionComponent, SVGProps } from 'react';
import { Layouts } from 'react-grid-layout';
import { Palette } from '@material-ui/core/styles/createPalette';

import {
  AttributeInput,
  DeviceType,
  Group,
  ISensorData,
  Point,
  Sensor,
  SensorType,
} from 'city-os-common/libs/schema';

import type { configFormSet, gadgetSizeSet } from './constants';

export enum GadgetType {
  LIVE_VIEW = 'LIVE_VIEW',
  CAR_IDENTIFY = 'CAR_IDENTIFY',
  HUMAN_SHAPE = 'HUMAN_SHAPE',
  CAR_FLOW = 'CAR_FLOW',
  CAR_FLOWS = 'CAR_FLOWS',
  HUMAN_FLOW = 'HUMAN_FLOW',
  HUMAN_FLOWS = 'HUMAN_FLOWS',
  AQI_OF_DEVICE = 'AQI_OF_DEVICE',
  AQI_IN_DIVISION = 'AQI_IN_DIVISION',
  WIFI = 'WIFI',
  MALFUNCTION_FLOW = 'MALFUNCTION_FLOW',
  PROPER_RATE = 'PROPER_RATE',
  EV_STATS = 'EV_STATS',
  EV_CHARGERS = 'EV_CHARGERS',
  EV_ALARM_STATS = 'EV_ALARM_STATS',
  GENDER_AGE_FLOW = 'GENDER_AGE_FLOW',
  SET_BRIGHTNESS_PERCENT_OF_LAMP = 'SET_BRIGHTNESS_PERCENT_OF_LAMP',
  INDOOR_AIR_QUALITY = 'INDOOR_AIR_QUALITY',
  INDOOR_TEMPERATURE = 'INDOOR_TEMPERATURE',
  POWER_CONSUMPTION = 'POWER_CONSUMPTION',
  WEATHER = 'WEATHER',
  PLACE_USAGE = 'PLACE_USAGE',
  INDOOR_ENERGY_CONSUMPTION = 'INDOOR_ENERGY_CONSUMPTION',
}

export enum ConfigFormType {
  DEVICE_ONLY = 'DEVICE_ONLY',
  DEVICES_DURATION_LAYOUT = 'DEVICES_DURATION_LAYOUT',
  DEVICE_DURATION_LAYOUT = 'DEVICE_DURATION_LAYOUT',
  DIVISION_ONLY = 'DIVISION_ONLY',
  DIVISION_LAYOUT = 'DIVISION_LAYOUT',
  DEVICE_PLURAL_TITLE = 'DEVICE_PLURAL_TITLE',
  DEVICE_LAYOUT = 'DEVICE_LAYOUT',
  DEVICE_TEMPERATURE_UNIT_LAYOUT = 'DEVICE_TEMPERATURE_UNIT_LAYOUT',
  DEVICES_TITLE = 'DEVICES_TITLE',
}

export enum Duration {
  DAY = 'DAY',
  WEEK = 'WEEK',
}

export enum GadgetSize {
  DEFAULT = 'DEFAULT',
  SQUARE = 'SQUARE',
  RECTANGLE = 'RECTANGLE',
}

export type GadgetSizeType<T extends GadgetType> = typeof gadgetSizeSet[T][number];

export type GadgetConfigType<C extends ConfigFormType> = typeof configFormSet[C][number];

export interface GadgetConfig<ConfigType extends ConfigFormType> {
  id: string;
  width: number;
  height: number;
  type: GadgetConfigType<ConfigType>;
  setting: ConfigType extends ConfigFormType.DEVICE_ONLY
    ? {
        deviceId: string;
      }
    : ConfigType extends ConfigFormType.DEVICES_DURATION_LAYOUT
    ? {
        deviceIds: string[];
        duration: Duration;
        size: GadgetSize;
      }
    : ConfigType extends ConfigFormType.DEVICE_DURATION_LAYOUT
    ? {
        deviceId: string;
        duration: Duration;
        size: GadgetSize;
      }
    : ConfigType extends ConfigFormType.DIVISION_ONLY
    ? {
        groupId: string;
      }
    : ConfigType extends ConfigFormType.DIVISION_LAYOUT
    ? {
        groupId: string;
        size: GadgetSize;
      }
    : ConfigType extends ConfigFormType.DEVICE_PLURAL_TITLE
    ? {
        title: string;
        deviceIds: string[];
      }
    : ConfigType extends ConfigFormType.DEVICE_LAYOUT
    ? {
        deviceId: string;
        size: GadgetSize;
      }
    : ConfigType extends ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT
    ? {
        deviceId: string;
        unit: TemperatureUnit;
        size: GadgetSize;
      }
    : ConfigType extends ConfigFormType.DEVICES_TITLE
    ? {
        title: string;
        deviceIds: string[];
      }
    : never;
}

export enum TemperatureUnit {
  C = 'C',
  F = 'F',
}

export type GadgetsConfig = GadgetConfig<ConfigFormType>[];

export type ConfigSaveType = 'update' | 'create';

export interface BasicGadgetInfo {
  name: string;
  type: GadgetType;
  deviceType?: DeviceType;
  attribute?: AttributeInput;
  description: string;
  size: GadgetSize;
}

export interface DeviceOption {
  label: string;
  value: string;
}

export interface Curve {
  key: string;
  label?: string;
  points: Point[];
  variant?: 'curve' | 'areaClosed' | 'bar';
  color?: keyof Palette['gadget'];
}

export interface PieChartPoint {
  key: string;
  value: number;
  color?: string;
}

export type PieChart = PieChartPoint[];

export interface DashboardConfig {
  index: number;
  config: string;
}

export interface DashboardConfigJson {
  gadgets: GadgetsConfig;
  layouts: Layouts;
}

export interface GadgetDeviceInfo {
  deviceId: string;
  name: string;
  sensors: Pick<Sensor, 'sensorId' | 'type' | 'unit'>[] | null;
  groups: Group[];
}

export enum GridLayoutBreakpoint {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
  xs = 'xs',
}

export enum AirQualityIndex {
  GOOD = 'GOOD',
  MODERATE = 'MODERATE',
  UNHEALTHY_FOR_SENSITIVE_GROUPS = 'UNHEALTHY_FOR_SENSITIVE_GROUPS',
  UNHEALTHY = 'UNHEALTHY',
  VERY_UNHEALTHY = 'VERY_UNHEALTHY',
  HAZARDOUS = 'HAZARDOUS',
}

export enum EVChargerStatus {
  AVAILABLE = 'AVAILABLE',
  CHARGING = 'CHARGING',
  RESERVED = 'RESERVED',
  ALARM = 'ALARM',
  PREPARING = 'PREPARING',
  UNAVAILABLE = 'UNAVAILABLE',
  STOP_CHARGING_WITH_GUN_PLUGGED = 'STOP_CHARGING_WITH_GUN_PLUGGED',
  OFFLINE = 'OFFLINE',
}

export interface SensorResponse<T extends SensorType> {
  deviceName: string;
  deviceId: string;
  sensorId: string;
  data: ISensorData<T>;
}

export enum ExtremeOperation {
  MAX = 'MAX',
  MIN = 'MIN',
  SUM = 'SUM',
  COUNT = 'COUNT',
  AVG = 'AVG',
}

export interface StatsOption {
  operation: ExtremeOperation;
  text?: string;
}

export interface GenderPercent {
  percentForMale: number;
  percentForFemale: number;
}

export interface AgeHistogram {
  female: number[];
  male: number[];
}

export interface GenderHistory {
  female: ISensorData<SensorType.GAUGE>[];
  male: ISensorData<SensorType.GAUGE>[];
}

export interface GenderAndAgeData {
  deviceId: string;
  deviceName: string;
  percent: GenderPercent;
  histogram: AgeHistogram;
  history: GenderHistory;
}

export enum WeatherConditionCode {
  UNKNOWN = 0,
  SUNNY_OR_CLEAR = 1000,
  PARTLY_CLOUDY = 1003,
  CLOUDY = 1006,
  OVERCAST = 1009,
  PATCHY_SNOW_POSSIBLE = 1066,
  MIST = 1030,
  PATCHY_RAIN_POSSIBLE = 1069,
  PATCHY_SLEET_POSSIBLE = 1063,
  THUNDERY_OUTBREAKS_POSSIBLY = 1087,
  BLOWING_SNOW = 1114,
  BLIZZARD = 1117,
  FOG = 1135,
  FREEZING_FOG = 1147,
  PATCHY_LIGHT_DRIZZLE = 1150,
  LIGHT_DRIZZLE = 1153,
  FREEZING_DRIZZLE = 1168,
  HEAVY_FREEZING_DRIZZLE = 1171,
  PATCHY_LIGHT_RAIN = 1180,
  LIGHT_RAIN = 1183,
  MODERATE_RAIN_AT_TIMES = 1186,
  MODERATE_RAIN = 1189,
  HEAVY_RAIN_AT_TIMES = 1192,
  HEAVY_RAIN = 1195,
  LIGHT_FREEZING_RAIN = 1198,
  MODERATE_OR_HEAVY_FREEZING_RAIN = 1201,
  LIGHT_SLEET = 1204,
  MODERATE_OR_HEAVY_SLEET = 1207,
  PATCHY_LIGHT_SNOW = 1210,
  LIGHT_SNOW = 1213,
  PATCHY_MODERATE_SNOW = 1216,
  MODERATE_SNOW = 1219,
  PATCHY_HEAVY_SNOW = 1222,
  HEAVY_SNOW = 1225,
  ICE_PELLETS = 1237,
  LIGHT_RAIN_SHOWER = 1240,
  MODERATE_OR_HEAVY_RAIN_SHOWER = 1243,
  TORRENTIAL_RAIN_SHOWER = 1246,
  LIGHT_SLEET_SHOWERS = 1249,
  MODERATE_OR_HEAVY_SLEET_SHOWERS = 1252,
  LIGHT_SNOW_SHOWERS = 1255,
  MODERATE_OR_HEAVY_SNOW_SHOWERS = 1258,
  LIGHT_SHOWERS_OF_ICE_PELLETS = 1261,
  MODERATE_OR_HEAVY_SHOWERS_OF_ICE_PELLETS = 1264,
  PATCHY_LIGHT_RAIN_WITH_THUNDER = 1273,
  MODERATE_OR_HEAVY_RAIN_WITH_THUNDER = 1276,
  PATCHY_LIGHT_SNOW_WITH_THUNDER = 1279,
  MODERATE_OR_HEAVY_SNOW_WITH_THUNDER = 1282,
}

export enum WeatherConditionTime {
  DAY = 1,
  NIGHT = 2,
}

export interface WeatherCondition {
  name: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

export interface WeatherWindDirectionInfo {
  name: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}
