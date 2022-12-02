import { DeviceStatus, DeviceType, Group, Sensor, SensorType } from '../../libs/schema';

export interface PartialSensor
  extends Omit<Partial<Sensor>, 'sensorId' | 'name' | 'type' | 'unit'> {
  sensorId: string;
  name: string;
  type: SensorType;
  unit: string | null;
}

export interface PartialDevice {
  deviceId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus | null;
  sensors: PartialSensor[] | null;
  groups: Pick<Group, 'id' | 'name' | 'projectKey'>[];
}
