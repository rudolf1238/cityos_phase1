import { Condition } from '../../../../libs/type';

export interface TempCondition extends Omit<Condition, 'value'> {
  value: string[];
  unit?: string;
}
