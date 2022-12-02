import { useCallback } from 'react';

import { TriggerOperator } from '../libs/type';
import useAutomationTranslation from './useAutomationTranslation';

interface UseTriggerOperatorTranslationResponse
  extends Omit<ReturnType<typeof useAutomationTranslation>, 't'> {
  tTriggerOperator: (triggerOperator: TriggerOperator) => string;
}

const useTriggerOperatorTranslation = (): UseTriggerOperatorTranslationResponse => {
  const { t, ...methods } = useAutomationTranslation('automation');

  const tTriggerOperator = useCallback(
    (triggerOperator: TriggerOperator) => {
      const mapping: Record<TriggerOperator, string> = {
        [TriggerOperator.GREATER]: '>',
        [TriggerOperator.GREATER_OR_EQUAL]: '≥',
        [TriggerOperator.LESS]: '<',
        [TriggerOperator.LESS_OR_EQUAL]: '≤',
        [TriggerOperator.EQUAL]: '=',
        [TriggerOperator.NOT_EQUAL]: '≠',
        [TriggerOperator.BETWEEN]: t('between'),
        [TriggerOperator.UPDATED]: t('updated'),
        [TriggerOperator.CONTAIN]: t('contains'),
        [TriggerOperator.IS_ONE_OF]: t('is one of'),
      };
      return mapping[triggerOperator];
    },
    [t],
  );

  return {
    ...methods,
    tTriggerOperator,
  };
};

export default useTriggerOperatorTranslation;
