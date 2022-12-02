import {
  Action,
  DeviceType,
  Permission,
  SensorType,
  SortOrder,
  Subject,
  UserSortField,
} from 'city-os-common/libs/schema';

export interface UserFilter {
  keyword?: string;
  userSortField?: UserSortField;
  sortOrder?: SortOrder;
}

export interface RoleTemplate {
  id: string;
  name: string;
  permission: Permission | null;
}

export interface PermissionInput {
  action: Action;
  subject: Subject;
}

export interface ElasticSearchSensor {
  deviceType: DeviceType;
  sensorId: string;
  sensorName: string;
  sensorType: SensorType;
  /**  Date number in millisecond */
  from: number | null;
  /** Date number in millisecond */
  to: number | null;
  enable: boolean;
  /**  Progress from 0 to 100 */
  status: number;
}
