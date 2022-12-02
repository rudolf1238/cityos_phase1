import { useCallback } from 'react';

import { Logic } from '../libs/type';
import useAutomationTranslation from './useAutomationTranslation';

interface UseLogicTranslationResponse
  extends Omit<ReturnType<typeof useAutomationTranslation>, 't'> {
  tLogic: (logic: Logic) => string;
}

const useLogicTranslation = (): UseLogicTranslationResponse => {
  const { t, ...methods } = useAutomationTranslation('automation');

  const tLogic = useCallback(
    (logic: Logic) => {
      const mapping: Record<Logic, string> = {
        [Logic.AND]: t('AND'),
        [Logic.OR]: t('OR'),
      };
      return mapping[logic];
    },
    [t],
  );

  return {
    ...methods,
    tLogic,
  };
};

export default useLogicTranslation;
