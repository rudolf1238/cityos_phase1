import { useCallback } from 'react';

import { DeviceType } from '../libs/schema';
import useCommonTranslation from './useCommonTranslation';

interface UseDeviceTranslationResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tDevice: (deviceType: DeviceType) => string;
}

const useDeviceTranslation = (): UseDeviceTranslationResponse => {
  const { t, ...methods } = useCommonTranslation('common');

  const tDevice = useCallback(
    (type: DeviceType) => {
      const mapping: Record<DeviceType, string> = {
        [DeviceType.LAMP]: t('Lamp'),
        [DeviceType.SOLAR]: t('Solar'),
        [DeviceType.CHARGING]: t('Charging'),
        [DeviceType.CAMERA]: t('Camera'),
        [DeviceType.WATER]: t('Water'),
        [DeviceType.ENVIRONMENT]: t('Environment'),
        [DeviceType.WIFI]: t('Wi-Fi'),
        [DeviceType.DISPLAY]: t('Display'),
        [DeviceType.UNKNOWN]: t('Unknown'),
        [DeviceType.BUILDING]: t('Building'),
        [DeviceType.INDOOR_LAMP]: t('Indoor lamp'),
        [DeviceType.CHILLER]: t('Chiller'),
        [DeviceType.SPEAKER]: t('Speaker'),
        [DeviceType.FIRE_ALARM]: t('Fire alarm'),
        [DeviceType.POWER_METER]: t('Digital power meter'),
        [DeviceType.ELEVATOR]: t('Elevator'),
        [DeviceType.BANPU_INDOOR_METER]: t('Banpu indoor meter'),
        [DeviceType.OPEN_DATA_WEATHER]: t('Open data weather'),
        [DeviceType.USAGE_METER]: t('Usage meter'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tDevice,
  };
};

export default useDeviceTranslation;
