import { useCallback } from 'react';

import { DeviceStatus } from '../libs/schema';
import useCommonTranslation from './useCommonTranslation';

interface UseDeviceStatusResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tDeviceStatus: (deviceStatus: DeviceStatus) => string;
}

const useDeviceStatusTranslation = (): UseDeviceStatusResponse => {
  const { t, ...methods } = useCommonTranslation('common');

  const tDeviceStatus = useCallback(
    (type: DeviceStatus) => {
      const mapping: Record<DeviceStatus, string> = {
        [DeviceStatus.ACTIVE]: t('ACTIVE'),
        [DeviceStatus.ERROR]: t('ERROR'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tDeviceStatus,
  };
};

export default useDeviceStatusTranslation;
