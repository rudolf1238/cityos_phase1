import {
  AgeGroup,
  CameraEventSortField,
  DeviceInSearch,
  Gender,
  RecognitionType,
  SortOrder,
} from 'city-os-common/libs/schema';

export enum CarModel {
  CAR = 'car',
  MOTOR = 'motor',
  TRUCK = 'truck',
}

export enum Color {
  WHITE = 'white',
  BLACK = 'black',
  SILVER = 'silver',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  BLUE = 'blue',
  PURPLE = 'purple',
}

export interface Query {
  sortBy?: CameraEventSortField;
  order?: SortOrder;
}

export interface FiltersData {
  fromDate: Date;
  toDate: Date;
  recognitionType: RecognitionType | null;
  devices: DeviceInSearch[];
  carModel: CarModel | 'ALL';
  carColor: Color | 'ALL';
  plateNumber: string;
  humanShapeGender: Gender | 'ALL';
  humanFlowGender: Gender | 'ALL';
  clothesColor: Color | 'ALL';
  ageGroup: AgeGroup | 'ALL';
}
