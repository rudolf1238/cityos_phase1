import { useCallback } from 'react';

import { SensorType } from 'city-os-common/libs/schema';

import useWebTranslation from './useWebTranslation';

interface UseSensorTypeResponse extends Omit<ReturnType<typeof useWebTranslation>, 't'> {
  tSensorType: (sensorType: SensorType) => string;
}

const useSensorTypeTranslation = (): UseSensorTypeResponse => {
  const { t, ...methods } = useWebTranslation('common');

  const tSensorType = useCallback(
    (sensorType: SensorType) => {
      const mapping: Record<SensorType, string> = {
        [SensorType.GAUGE]: t('gauge'),
        [SensorType.TEXT]: t('text'),
        [SensorType.SNAPSHOT]: t('snapshot'),
        [SensorType.SWITCH]: t('switch'),
      };
      return mapping[sensorType];
    },
    [t],
  );

  return {
    ...methods,
    tSensorType,
  };
};

export default useSensorTypeTranslation;
