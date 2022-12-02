import { useCallback } from 'react';

import { Duration } from '../libs/type';
import useDashboardTranslation from './useDashboardTranslation';

interface UseDurationTranslationResponse
  extends Omit<ReturnType<typeof useDashboardTranslation>, 't'> {
  tDuration: (duration: Duration) => string;
}

const useDurationTranslation = (): UseDurationTranslationResponse => {
  const { t, ...methods } = useDashboardTranslation('dashboard');

  const tDuration = useCallback(
    (duration: Duration) => {
      const mapping: Record<Duration, string> = {
        [Duration.DAY]: t('For one day'),
        [Duration.WEEK]: t('For one week'),
      };
      return mapping[duration];
    },
    [t],
  );

  return {
    ...methods,
    tDuration,
  };
};

export default useDurationTranslation;
