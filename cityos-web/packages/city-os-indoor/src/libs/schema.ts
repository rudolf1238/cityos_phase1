export interface GPSPoint {
  lat: number;
  lng: number;
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

export enum DeviceType {
  LAMP = 'LAMP',
  SOLAR = 'SOLAR',
  CHARGING = 'CHARGING',
  CAMERA = 'CAMERA',
  WATER = 'WATER',
  ENVIRONMENT = 'ENVIRONMENT',
  WIFI = 'WIFI',
  DISPLAY = 'DISPLAY',
  UNKNOWN = 'UNKNOWN',
  BUILDING = 'BUILDING',
}

export enum SortField {
  ID = 'ID',
  NAME = 'NAME',
  TYPE = 'TYPE',
  STATUS = 'STATUS',
}

export enum SortOrder {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum SensorType {
  GAUGE = 'GAUGE',
  SNAPSHOT = 'SNAPSHOT',
  TEXT = 'TEXT',
  SWITCH = 'SWITCH',
}

export interface GPSRect {
  sw: GPSPoint;
  ne: GPSPoint;
}

export interface DeviceFilter {
  type?: DeviceType;
  status?: DeviceStatus;
  keyword?: string;
  gpsRectInput?: GPSRect;
  sortField?: SortField;
  sortOrder?: SortOrder;
  enableSchedule?: boolean;
  isDevicesUnderLampActive?: boolean;
  disabled?: boolean;
}

export interface Attribute {
  key: string;
  value: string;
}

export interface Sensor {
  sensorId: string;
  name: string;
  desc?: string;
  type: SensorType;
  unit?: string;
  attributes?: Attribute[];
}

export enum Action {
  VIEW = 'VIEW',
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  MODIFY = 'MODIFY',
  EXPORT = 'EXPORT',
}

export enum Subject {
  DASHBOARD = 'DASHBOARD',
  LIGHTMAP = 'LIGHTMAP',
  GROUP = 'GROUP',
  DEVICE = 'DEVICE',
  USER = 'USER',
  ROLE_TEMPLATE = 'ROLE_TEMPLATE',
  RECYCLE_BIN = 'RECYCLE_BIN',
  HUMAN_FLOW_HEAT_MAP = 'HUMAN_FLOW_HEAT_MAP',
  INDOOR = 'INDOOR',
}

export interface Rule {
  action: Action;
  subject: Subject;
}

export interface SensorMaskInfo {
  deviceType: DeviceType;
  sensorId: string;
}

export interface SensorMask {
  enable?: boolean;
  sensors?: SensorMaskInfo[];
}

export enum UserStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  SUSPEND = 'SUSPEND',
}

export enum GroupLevel {
  ROOT,
  PROJECT,
  PARENT,
  LEAF,
}

export enum Language {
  'zh_Hant_TW' = 'zh_Hant_TW',
  'en_US' = 'en_US',
}

export interface GroupInfo {
  group: Group;
  permission: {
    rules: Rule[];
  };
}

export interface User {
  email: string;
  name?: string;
  phone?: string;
  status: UserStatus;
  groups: GroupInfo[];
  language: Language;
}

export enum UserSortField {
  EMAIL = 'EMAIL',
  NAME = 'NAME',
  PHONE = 'PHONE',
}

export interface UserFilter {
  keyword?: string;
  userSortField?: UserSortField;
  sortOrder?: SortOrder;
}

export enum Level {
  ROOT = 'ROOT',
  PROJECT = 'PROJECT',
  PARENT = 'PARENT',
  LEAF = 'LEAF',
}

export interface Group {
  id: string;
  name: string;
  ancestors?: string[];
  projectKey?: string;
  sensorMask?: SensorMask;
  subGroups?: string[];
  sensors?: Sensor[];
  deviceCount?: number;
  userCount?: number;
  level?: Level;
}

/** IDevice: Interface of Device */
export interface Timezone {
  rawOffset: number;
  timeZoneId: string;
  timeZoneName: string;
}

export interface IDevice {
  deviceId: string;
  name: string;
  desc?: string;
  type: DeviceType;
  location?: GPSPoint | null;
  sensors?: Sensor[];
  groups: Group[];
  status?: DeviceStatus;
  attributes?: Attribute[];
  hasLightSensor?: boolean;
  timezone?: Timezone;
  lightSchedule?: LightSchedule;
  related?: IDevice[];
}

export interface DeviceEdge {
  cursor: string;
  node: IDevice;
}

export interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

export interface DeviceConnection {
  gpsRect?: GPSRect;
  edges: DeviceEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

/** LightSchedule */
export interface LightSensorCondition {
  lessThan: number;
  brightness: number;
}

export interface LightSensor {
  enableLightSensor?: boolean;
  lightSensorCondition?: LightSensorCondition[];
}

export interface LightSensorConditionInput {
  lessThan: number;
  brightness: number;
}

export interface LightControl {
  hour: number;
  minute: number;
  brightness: number;
}

export interface Schedule {
  startMonth: number;
  startDay: number;
  lightControls: LightControl[];
}

export interface ManualSchedule {
  enableManualSchedule?: boolean;
  schedules?: Schedule[];
}

export interface LightSchedule {
  lightSensor?: LightSensor;
  manualSchedule?: ManualSchedule;
}

export interface ISensorData<T extends SensorType> {
  type?: T;
  time?: Date;
  value?: T extends SensorType.GAUGE
    ? number
    : T extends SensorType.SNAPSHOT
    ? string
    : T extends SensorType.TEXT
    ? string
    : T extends SensorType.SWITCH
    ? boolean
    : never;
}

export interface LiveVideo {
  deviceId: string;
  camId: string;
  url: string;
}

export interface GetVideoURLPayload {
  token: string;
  urlToken: string;
  expiredAt: number;
  liveList: LiveVideo[];
}

export interface AttributeInput {
  key: string;
  value: string;
}

// sensor id list
export enum SensorId {
  LAMP_BRIGHTNESS_PERCENT = 'brightnessPercent',
  LAMP_POWER_CON = 'powerCon',
  LAMP_VOLTAGE = 'voltage',
  LAMP_CURRENT = 'current',
  LAMP_TEMP = 'temp',
  SOLAR_BAT_VOLTAGE = 'BAT_voltage',
  SOLAR_BAT_CURRENT = 'BAT_current',
  SOLAR_BAT_CAPACITY = 'BAT_capacity',
  CHARGING_STATUS = 'status',
  CHARGING_30_DAYS_METER = '30daysMeter',
  CHARGING_30_DAYS_COUNT = '30daysCount',
  CAMERA_GENDER = 'gender',
  CAMERA_CLOTHES_COLOR = 'clothesColor',
  CAMERA_PEDESTRIAN = 'pedestrian',
  CAMERA_NUMBER_PLATE = 'numberPlate',
  CAMERA_VEHICLE = 'vehicle',
  WATER_LEVEL = 'level',
  WATER_VOLT = 'volt',
  ENV_PM10 = 'pm10',
  ENV_PM2_5 = 'pm2_5',
  ENV_TEMPERATURE = 'temperature',
  ENV_HUMIDITY = 'humidity',
  WIFI_CONN_USER_COUNT = 'connUserCount',
  WIFI_UPLOAD_SPEED = 'uploadSpeed',
  WIFI_DOWNLOAD_SPEED = 'downloadSpeed',
  DISPLAY_PLAYER_ADDRESS = 'player_address',
  DISPLAY_PLAYER_SNAPSHOT = 'player_snapshot',
}

export enum VerifyType {
  REGISTER = 'REGISTER',
  RESET = 'RESET',
  BINDING = 'BINDING',
}

// role templates
export interface RoleTemplate {
  id: string;
  name?: string;
  permission?: {
    rules: Rule[];
  };
}

export interface PermissionInput {
  action: Action;
  subject: Subject;
}
