import { Palette } from '@material-ui/core/styles/createPalette';
import { Theme } from '@material-ui/core/styles';

import { Point } from 'city-os-common/libs/schema';
import { SensorValuesHistoryResponse } from 'city-os-common/api/sensorValuesHistory';
import { roundUpDate } from 'city-os-common/libs/roundDate';

import { AirQualityIndex, Curve, DeviceOption, Duration } from './type';

export const getDeviceIds = (devices: DeviceOption[]): string[] =>
  devices.reduce<string[]>(
    (acc, deviceOption) => (deviceOption.value ? acc.concat(deviceOption.value) : acc),
    [],
  );

export const getAqiInfo = (
  theme: Theme,
  pm25Concentration: number | null,
): {
  index: AirQualityIndex | 'UNKNOWN';
  color: string;
} => {
  let index: AirQualityIndex | 'UNKNOWN';
  let color: string;
  if (!pm25Concentration) {
    index = 'UNKNOWN';
    // eslint-disable-next-line prefer-destructuring
    color = theme.palette.grey[300];
  } else if (pm25Concentration > 250.4) {
    index = AirQualityIndex.HAZARDOUS;
    color = theme.palette.gadget.contrastText;
  } else if (pm25Concentration > 150.4) {
    index = AirQualityIndex.VERY_UNHEALTHY;
    color = theme.palette.aqi.veryUnhealthy;
  } else if (pm25Concentration > 54.4) {
    index = AirQualityIndex.UNHEALTHY;
    color = theme.palette.aqi.unhealthy;
  } else if (pm25Concentration > 35.4) {
    index = AirQualityIndex.UNHEALTHY_FOR_SENSITIVE_GROUPS;
    color = theme.palette.warning.main;
  } else if (pm25Concentration > 15.4) {
    index = AirQualityIndex.MODERATE;
    color = theme.palette.gadget.energyStop;
  } else {
    index = AirQualityIndex.GOOD;
    color = theme.palette.aqi.good;
  }
  return { index, color };
};

export const getCurve = (
  id: string,
  sensorData: SensorValuesHistoryResponse['sensorValuesHistory'],
  color: keyof Palette['gadget'],
  variant?: Curve['variant'],
): Curve => ({
  key: id,
  points: sensorData.reduce<Point[]>((acc, { time, value }) => {
    if (time && value) acc.push({ time, value: Math.round(value) });
    return acc;
  }, []),
  variant: variant || 'areaClosed',
  color,
});

export const roundUpNow = (duration: Duration): number =>
  roundUpDate(Date.now(), duration === Duration.DAY ? 'hour' : 'day').getTime();
