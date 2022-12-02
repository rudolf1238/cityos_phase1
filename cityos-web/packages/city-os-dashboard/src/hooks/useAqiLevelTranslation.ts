import { useCallback } from 'react';

import { AirQualityIndex } from '../libs/type';
import useDashboardTranslation from './useDashboardTranslation';

interface UseAqiTranslationResponse extends Omit<ReturnType<typeof useDashboardTranslation>, 't'> {
  tAqi: (aqiIndex: AirQualityIndex) => string;
}

const useAqiTranslation = (): UseAqiTranslationResponse => {
  const { t, ...methods } = useDashboardTranslation('dashboard');

  const tAqi = useCallback(
    (aqiIndex: AirQualityIndex) => {
      const mapping: Record<AirQualityIndex, string> = {
        [AirQualityIndex.GOOD]: t('Good'),
        [AirQualityIndex.MODERATE]: t('Moderate'),
        [AirQualityIndex.UNHEALTHY_FOR_SENSITIVE_GROUPS]: t('Unhealthy for sensitive groups'),
        [AirQualityIndex.UNHEALTHY]: t('Unhealthy'),
        [AirQualityIndex.VERY_UNHEALTHY]: t('Very Unhealthy'),
        [AirQualityIndex.HAZARDOUS]: t('Hazardous'),
      };
      return mapping[aqiIndex];
    },
    [t],
  );

  return {
    ...methods,
    tAqi,
  };
};

export default useAqiTranslation;
