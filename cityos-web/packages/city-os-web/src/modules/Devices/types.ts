import { DeviceType, Sensor } from 'city-os-common/libs/schema';

import { EditDeviceInput } from '../../api/editDevice';
import { EditSensorInput } from '../../api/editSensor';
import { PartialNode } from '../../api/searchDevicesOnDevice';

export interface AttributesData {
  id: string;
  keyName: string;
  value: string;
}

export interface EditSensorInputWithId extends Omit<EditSensorInput, 'attributes'> {
  sensorId: string;
}

export interface DetailFormData extends Omit<Required<EditDeviceInput>, 'location' | 'attributes'> {
  location: string;
  attributes: AttributesData[];
  sensors: Required<Omit<Sensor, 'attributes'>>[];
  editSensorInputs: EditSensorInputWithId[];
  type: DeviceType;
}

export interface RowData extends PartialNode {
  key: string;
}

export const locationRegex = /^-?([1-8]?[0-9](\.[0-9]{0,14}[1-9])?|90(\.0{0,14})?), -?(([1-9]?[0-9]|1[0-7][0-9])(\.[0-9]{0,14}[1-9])?|180(\.0{0,14})?)$/;

export const attributeKeyRegex = /^\w+$/;
