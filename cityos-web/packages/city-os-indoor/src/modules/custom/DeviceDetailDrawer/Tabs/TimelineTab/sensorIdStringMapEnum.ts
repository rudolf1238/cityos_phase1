import { SensorId } from 'city-os-common/libs/schema';

export const getEnumKeyByEnumValue = <T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null => {
  const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : null;
};

const sensorIdStringMapEnum = (enumValue: string): SensorId =>
  getEnumKeyByEnumValue(SensorId, enumValue) as SensorId;

export default sensorIdStringMapEnum;
