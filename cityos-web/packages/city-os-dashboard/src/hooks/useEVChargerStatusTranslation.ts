import { useCallback } from 'react';

import { EVChargerStatus } from '../libs/type';
import useDashboardTranslation from './useDashboardTranslation';

interface UseEVChargerStatusResponse extends Omit<ReturnType<typeof useDashboardTranslation>, 't'> {
  tEVChargerStatus: (evChargerStatus: EVChargerStatus) => string;
}

const useEVChargerStatusTranslation = (): UseEVChargerStatusResponse => {
  const { t, ...methods } = useDashboardTranslation('dashboard');

  const tEVChargerStatus = useCallback(
    (type: EVChargerStatus) => {
      const mapping: Record<EVChargerStatus, string> = {
        [EVChargerStatus.AVAILABLE]: t('Available'),
        [EVChargerStatus.CHARGING]: t('Charging'),
        [EVChargerStatus.RESERVED]: t('Reserved'),
        [EVChargerStatus.ALARM]: t('Alarm'),
        [EVChargerStatus.PREPARING]: t('Preparing'),
        [EVChargerStatus.UNAVAILABLE]: t('Unavailable'),
        [EVChargerStatus.STOP_CHARGING_WITH_GUN_PLUGGED]: t('Stop charging with gun plugged'),
        [EVChargerStatus.OFFLINE]: t('Offline'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tEVChargerStatus,
  };
};

export default useEVChargerStatusTranslation;
