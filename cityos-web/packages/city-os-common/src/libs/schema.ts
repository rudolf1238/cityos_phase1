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
  INDOOR_LAMP = 'INDOOR_LAMP',
  CHILLER = 'CHILLER',
  SPEAKER = 'SPEAKER',
  FIRE_ALARM = 'FIRE_ALARM',
  POWER_METER = 'POWER_METER',
  ELEVATOR = 'ELEVATOR',
  BANPU_INDOOR_METER = 'BANPU_INDOOR_METER',
  OPEN_DATA_WEATHER = 'OPEN_DATA_WEATHER',
  USAGE_METER = 'USAGE_METER',
}

export enum SortField {
  COMPANYID = 'COMPANYID',
  ID = 'ID',
  NAME = 'NAME',
  TYPE = 'TYPE',
  STATUS = 'STATUS',
  MAINTAINSTATUS = 'MAINTAINSTATUS',
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
  sw: GPSPoint | null;
  ne: GPSPoint | null;
}

export interface GPSRectInput {
  sw: GPSPoint;
  ne: GPSPoint;
}

export interface DeviceFilter {
  type?: DeviceType;
  status?: DeviceStatus;
  maintainstatus?: MaintainStatus;
  keyword?: string;
  attribute?: AttributeInput;
  sortField?: SortField;
  sortOrder?: SortOrder;
  enableSchedule?: boolean;
  isDevicesUnderLampActive?: boolean;
  disabled?: boolean;
}

export interface DeviceInSearch extends Pick<IDevice, 'deviceId' | 'name'> {
  sensors: Pick<Sensor, 'sensorId' | 'type' | 'unit'>[] | null;
  projectKey?: string | null;
}

export interface Attribute {
  key: string;
  value: string;
}

export interface Sensor {
  sensorId: string;
  name: string;
  desc: string | null;
  type: SensorType;
  unit: string | null;
  attributes: Attribute[] | null;
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
  IVS_SURVEILLANCE = 'IVS_SURVEILLANCE',
  IVS_EVENTS = 'IVS_EVENTS',
  // WIFI_AREA = 'WIFI_AREA',
  // WIFI_ADVERTISEMENT = 'WIFI_ADVERTISEMENT',
  WIFI = 'WIFI',
  GROUP = 'GROUP',
  DEVICE = 'DEVICE',
  USER = 'USER',
  ROLE_TEMPLATE = 'ROLE_TEMPLATE',
  ELASTIC_SEARCH = 'ELASTIC_SEARCH',
  ABNORMAL_MANAGEMENT = 'ABNORMAL_MANAGEMENT',
  // MAINTENANCE_STAFF = 'MAINTENANCE_STAFF',
  RECYCLE_BIN = 'RECYCLE_BIN',
  INFO = 'INFO',
  INDOOR = 'INDOOR',
  AUTOMATION_RULE_MANAGEMENT = 'AUTOMATION_RULE_MANAGEMENT',
  SAMPLE = 'SAMPLE',
  ESIGNAGE = 'ESIGNAGE',
}

export interface Rule {
  action: Action;
  subject: Subject;
}

export interface SensorMaskInfo {
  deviceType: DeviceType | null;
  sensorId: string | null;
}

export interface SensorMask {
  enable: boolean | null;
  sensors: (SensorMaskInfo | null)[] | null;
}

export enum Language {
  'zh_Hant_TW' = 'zh_Hant_TW',
  'en_US' = 'en_US',
}

export interface Permission {
  rules: Rule[] | null;
}

export interface GroupInfo {
  group: Group;
  permission: Permission;
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum UserStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  SUSPEND = 'SUSPEND',
}

export interface User {
  email: string;
  name: string;
  phone: string;
  status: UserStatus;
  groups: GroupInfo[];
  language: Language;
  theme: Theme;
  id: string;
  photo: string;
  isMaintenance: boolean;
  lineId: string;
  isLINEConnected: boolean;
}

export enum UserSortField {
  EMAIL = 'EMAIL',
  NAME = 'NAME',
  PHONE = 'PHONE',
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
  ancestors: string[] | null;
  projectKey: string | null;
  sensorMask: SensorMask | null;
  subGroups: string[] | null;
  sensors: Sensor[] | null;
  deviceCount: number | null;
  userCount: number | null;
  level: Level | null;
}

/** IDevice: Interface of Device */

/** Timezone interface according to google api */
export interface Timezone {
  rawOffset: number;
  /**
   * IANA timezone name
   *
   * e.g. America/Los_Angeles
   */
  timeZoneId: string;
  /**
   * standard timezone name
   *
   * e.g. Pacific Standard Time
   */
  timeZoneName: string;
}

export interface IDevice {
  id: string;
  deviceId: string;
  name: string;
  desc: string | null;
  uri: string;
  type: DeviceType;
  location: GPSPoint | null;
  sensors: Sensor[] | null;
  groups: Group[];
  status: DeviceStatus | null;
  attributes: Attribute[] | null;
  timezone: Timezone | null;
  lightSchedule?: LightSchedule | null;
  related?: IDevice[] | null;
  hasLightSensor?: boolean | null;
  maintainstatus?: MaintainStatus;
  imageIds?: string[] | null;
}

export interface MapDeviceFilter {
  type?: DeviceType | null;
  enableSchedule?: boolean | null;
  keyword?: string | null;
  gpsRectInput?: GPSRectInput | null;
  isDevicesUnderLampActive?: boolean | null;
}

export interface DevicesCluster {
  location: GPSPoint;
  count: number;
}

export interface MapClusters {
  cluster: DevicesCluster[];
  gpsRect: GPSRect | null;
}

export interface DeviceEdge {
  cursor: string;
  node: IDevice;
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
  beforeCursor: string | null;
  hasPreviousPage: boolean;
}

export interface DeviceConnection {
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
  enableLightSensor: boolean | null;
  lightSensorCondition: LightSensorCondition[] | null;
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
  enableManualSchedule: boolean | null;
  schedules: Schedule[] | null;
}

export interface LightSchedule {
  lightSensor: LightSensor | null;
  manualSchedule: ManualSchedule | null;
}

export interface ISensorData<T extends SensorType> {
  type?: T;
  /** millisecond */
  time?: number;
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

export interface LiveStream {
  deviceId: string;
  camId: string;
  url: string;
}

export interface GetVideoURLPayload {
  token: string;
  urlToken: string;
  expiredAt: number;
  streamList: LiveStream[];
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
  CHARGING_METER = 'meter',
  CHARGING_AMOUNT = 'amount',
  CAMERA_GENDER = 'gender',
  CAMERA_CLOTHES_COLOR = 'clothesColor',
  CAMERA_PEDESTRIAN = 'pedestrian',
  CAMERA_NUMBER_PLATE = 'numberPlate',
  CAMERA_VEHICLE = 'vehicle',
  CAMERA_HUMAN_COUNT = 'human_count',
  CAMERA_HUMAN_IMAGE = 'human_image',
  CAMERA_CAR_FLOW_STRAIGHT_COUNT = 'car_flow_straight_count',
  CAMERA_CAR_FLOW_STRAIGHT_IMAGE = 'car_flow_straight_image',
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
  BANPU_INDOOR_METER_CO2 = 'co2',
  BANPU_INDOOR_METER_TEMPERATURE = 'banpu_indoor_temperature',
  POWER_METER_POWER_CONSUMPTION = 'banpu_power_consumption',
  TEMP_C = 'temp_c',
  CONDITION_CODE = 'condition_code',
  WIND_KPH = 'wind_kph',
  WIND_DEGREE = 'wind_degree',
  HUMIDITY = 'humidity',
  IS_DAY = 'is_day',
  UV = 'uv',
  TEMP_C_1 = 'temp_c_1',
  TEMP_C_2 = 'temp_c_2',
  TEMP_C_3 = 'temp_c_3',
  TEMP_C_4 = 'temp_c_4',
  TEMP_C_5 = 'temp_c_5',
  TEMP_C_6 = 'temp_c_6',
  CONDITION_CODE_1 = 'condition_code_1',
  CONDITION_CODE_2 = 'condition_code_2',
  CONDITION_CODE_3 = 'condition_code_3',
  CONDITION_CODE_4 = 'condition_code_4',
  CONDITION_CODE_5 = 'condition_code_5',
  CONDITION_CODE_6 = 'condition_code_6',
  WIND_KPH_1 = 'wind_kph_1',
  WIND_KPH_2 = 'wind_kph_2',
  WIND_KPH_3 = 'wind_kph_3',
  WIND_KPH_4 = 'wind_kph_4',
  WIND_KPH_5 = 'wind_kph_5',
  WIND_KPH_6 = 'wind_kph_6',
  HUMIDITY_1 = 'humidity_1',
  HUMIDITY_2 = 'humidity_2',
  HUMIDITY_3 = 'humidity_3',
  HUMIDITY_4 = 'humidity_4',
  HUMIDITY_5 = 'humidity_5',
  HUMIDITY_6 = 'humidity_6',
  IS_DAY_1 = 'is_day_1',
  IS_DAY_2 = 'is_day_2',
  IS_DAY_3 = 'is_day_3',
  IS_DAY_4 = 'is_day_4',
  IS_DAY_5 = 'is_day_5',
  IS_DAY_6 = 'is_day_6',
}

export enum RecognitionKey {
  HUMAN_FLOW = 'human_flow',
  HUMAN_FLOW_ADVANCE = 'human_flow_advance',
  HUMAN_SHAPE = 'human_shape',
  CAR_IDENTIFY = 'car_identify',
  CAR_FLOW = 'car_flow',
}

export enum VerifyType {
  REGISTER = 'REGISTER',
  RESET = 'RESET',
  BINDING = 'BINDING',
}

export enum Gender {
  MALE = 'm',
  FEMALE = 'f',
}

export interface Point {
  /** millisecond */
  time: number;
  value: number;
}

export enum MaintainStatus {
  DONE = 'DONE',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
}

export const ageGroup = {
  CHILD: 0,
  YOUTH: 1,
  ADULT: 2,
  SENIOR: 3,
} as const;

export type AgeGroup = typeof ageGroup[keyof typeof ageGroup];

export enum RecognitionType {
  HUMAN_FLOW = 'HUMAN_FLOW',
  HUMAN_FLOW_ADVANCE = 'HUMAN_FLOW_ADVANCE',
  HUMAN_SHAPE = 'HUMAN_SHAPE',
  CAR_IDENTIFY = 'CAR_IDENTIFY',
  CAR_FLOW = 'CAR_FLOW',
}

export enum CameraEventSortField {
  TIME = 'TIME',
  ID = 'ID',
  RECOGNITION_TYPE = 'RECOGNITION_TYPE',
  GENDER = 'GENDER',
  CLOTHES_COLOR = 'CLOTHES_COLOR',
  VEHICLE_TYPE = 'VEHICLE_TYPE',
  VEHICLE_COLOR = 'VEHICLE_COLOR',
  NUMBER_PLATE = 'NUMBER_PLATE',
  HUMAN_FLOW_SEX = 'HUMAN_FLOW_SEX',
  HUMAN_FLOW_AGE = 'HUMAN_FLOW_AGE',
}

export interface HumanShapeFilterInput {
  gender?: string | null;
  clothesColor?: string | null;
}

export interface CarIdentifyFilterInput {
  vehicleType?: string | null;
  vehicleColor?: string | null;
  numberPlate?: string | null;
}

export interface HumanFlowAdvanceFilterInput {
  humanFlowSex?: string | null;
  humanFlowAge?: number | null;
}

export interface CameraEventFilter {
  from: number;
  to: number;
  deviceIds?: string[] | null;
  type?: RecognitionType | null;
  sortField?: CameraEventSortField | null;
  sortOrder?: SortOrder | null;
  humanShapeFilterInput?: HumanShapeFilterInput | null;
  carIdentifyFilterInput?: CarIdentifyFilterInput | null;
  humanFlowAdvanceFilterInput?: HumanFlowAdvanceFilterInput | null;
}

export interface ICameraEvent {
  deviceId: string;
  deviceName: string;
  time: number;
  type: RecognitionType;
  pedestrian?: string | null;
  gender?: string | null;
  clothesColor?: string | null;
  vehicle?: string | null;
  vehicleType?: string | null;
  vehicleColor?: string | null;
  numberPlate?: string | null;
  humanFlowSex?: string | null;
  humanFlowAge?: number | null;
  humanFlowImage?: string | null;
}

export type PageCursors = Pick<PageInfo, 'beforeCursor' | 'endCursor'>;

export interface VideoClip {
  url: string;
  /**  Date number in millisecond */
  start: number;
}

export type CutRange = [number, number];

export interface SingleDownload {
  /** represents progress status, it should be between 0(processing) and 100(completed) */
  progress: number;
  title?: string;
  subtitle?: string;
  cancel: () => void;
}
