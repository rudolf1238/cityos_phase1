import { SensorType } from 'city-os-common/libs/schema';

import { TriggerOperator } from './type';

export const triggerOperatorGroup: Record<SensorType, TriggerOperator[]> = {
  [SensorType.GAUGE]: [
    TriggerOperator.GREATER,
    TriggerOperator.GREATER_OR_EQUAL,
    TriggerOperator.LESS,
    TriggerOperator.LESS_OR_EQUAL,
    TriggerOperator.EQUAL,
    TriggerOperator.BETWEEN,
    TriggerOperator.UPDATED,
  ],
  [SensorType.TEXT]: [
    TriggerOperator.EQUAL,
    TriggerOperator.NOT_EQUAL,
    TriggerOperator.CONTAIN,
    TriggerOperator.IS_ONE_OF,
    TriggerOperator.UPDATED,
  ],
  [SensorType.SWITCH]: [TriggerOperator.EQUAL, TriggerOperator.NOT_EQUAL, TriggerOperator.UPDATED],
  [SensorType.SNAPSHOT]: [TriggerOperator.UPDATED],
};

export const gaugeSensorThresholdRegex = /^(0|-?(0(?!$)|[1-9]\d*))(\.\d{0,2}[1-9])?$/;

export const timeInSecondsRegex = /^[1-9][0-9]*$/;
