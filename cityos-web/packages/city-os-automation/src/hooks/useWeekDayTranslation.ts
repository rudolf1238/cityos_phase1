import { useCallback } from 'react';

import { WeekDay, weekDay } from '../libs/type';
import useAutomationTranslation from './useAutomationTranslation';

interface UseWeekDayTranslationResponse
  extends Omit<ReturnType<typeof useAutomationTranslation>, 't'> {
  tWeekDay: (weekDay: WeekDay) => string;
}

const useWeekDayTranslation = (): UseWeekDayTranslationResponse => {
  const { t, ...methods } = useAutomationTranslation('automation');

  const tWeekDay = useCallback(
    (type: WeekDay) => {
      const mapping: Record<WeekDay, string> = {
        [weekDay.SUNDAY]: t('Sunday'),
        [weekDay.MONDAY]: t('Monday'),
        [weekDay.TUESDAY]: t('Tuesday'),
        [weekDay.WEDNESDAY]: t('Wednesday'),
        [weekDay.THURSDAY]: t('Thursday'),
        [weekDay.FRIDAY]: t('Friday'),
        [weekDay.SATURDAY]: t('Saturday'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tWeekDay,
  };
};

export default useWeekDayTranslation;
