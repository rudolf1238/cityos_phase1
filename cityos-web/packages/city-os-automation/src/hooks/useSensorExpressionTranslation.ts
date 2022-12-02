import { useCallback } from 'react';

import { TriggerOperator } from '../libs/type';
import useAutomationTranslation from './useAutomationTranslation';

interface UseSensorExpressionTranslationResponse
  extends Omit<ReturnType<typeof useAutomationTranslation>, 't'> {
  tSensorExpression: (sensorId: string, logic: TriggerOperator, values: string[]) => string;
}

const useSensorExpressionTranslation = (): UseSensorExpressionTranslationResponse => {
  const { t, ...methods } = useAutomationTranslation('automation');

  const tSensorExpression = useCallback(
    (sensorId: string, logic: TriggerOperator, values: string[]) => {
      const firstValue = values[0] || '';
      const secondValue = values[1] || '';
      const mapping: Record<TriggerOperator, string> = {
        [TriggerOperator.GREATER]: `${sensorId} > ${firstValue}`,
        [TriggerOperator.GREATER_OR_EQUAL]: `${sensorId} ≥ ${firstValue}`,
        [TriggerOperator.LESS]: `${sensorId} < ${firstValue}`,
        [TriggerOperator.LESS_OR_EQUAL]: `${sensorId} ≤ ${firstValue}`,
        [TriggerOperator.EQUAL]: `${sensorId} = ${firstValue}`,
        [TriggerOperator.NOT_EQUAL]: `${sensorId} ≠ ${firstValue}`,
        [TriggerOperator.BETWEEN]: t('{{sensorId}} is between {{value1}} and {{value2}}', {
          sensorId,
          value1: firstValue,
          value2: secondValue,
        }),
        [TriggerOperator.UPDATED]: t('{{sensorId}} is updated in {{count}} second', {
          sensorId,
          count: +firstValue || 0,
        }),
        [TriggerOperator.CONTAIN]: t('{{sensorId}} contains {{value}}', {
          sensorId,
          value: firstValue,
        }),
        [TriggerOperator.IS_ONE_OF]: t('{{sensorId}} is one of {{value}}', {
          sensorId,
          value: values.join(','),
        }),
      };
      return mapping[logic];
    },
    [t],
  );

  return {
    ...methods,
    tSensorExpression,
  };
};

export default useSensorExpressionTranslation;
