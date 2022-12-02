import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import formatDate from '../../libs/formatDate';
import useCommonTranslation from '../../hooks/useCommonTranslation';

import MultiListsSelect, { MultiListsSelectProps } from './MultiListsSelect';
import ScheduleIcon from '../../assets/icon/schedule.svg';

export const monthList = Array.from({ length: 12 }, (_, i) => i + 1);
export const dayList = Array.from({ length: 31 }, (_, i) => i + 1);
export const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface MonthDaySelectProps
  extends Omit<MultiListsSelectProps<'month' | 'day', number>, 'onSelect' | 'menus'> {
  monthValue: number;
  dayValue: number;
  onSelect: (newValues: { month?: number; day?: number }) => void;
}

const MonthDaySelect: VoidFunctionComponent<MonthDaySelectProps> = ({
  monthValue,
  dayValue,
  onSelect,
  ...props
}: MonthDaySelectProps) => {
  const { t } = useCommonTranslation(['common', 'variables']);

  const dateOnSelect = useCallback(
    (id: 'month' | 'day', selectedValue: number) => {
      if (id === 'month') {
        onSelect({
          month: selectedValue,
          day: dayValue > daysInMonth[selectedValue - 1] ? 1 : undefined,
        });
      } else {
        onSelect({ day: selectedValue });
      }
    },
    [dayValue, onSelect],
  );

  const formatter = useCallback(
    ({ month, day }: { month: number; day: number }) =>
      formatDate(
        { month: month ? month - 1 : 0, date: day || 0 },
        t('variables:dateFormat.map.schedule.dateSetting'),
      ),
    [t],
  );

  const menus: {
    id: 'month' | 'day';
    options: {
      text: string;
      value: number;
    }[];
    selectedValue: number;
  }[] = useMemo(
    () => [
      {
        id: 'month',
        options: monthList.map((month) => ({
          text: formatDate(
            { month: month - 1 },
            t('variables:dateFormat.map.schedule.options.month'),
          ),
          value: month,
        })),
        selectedValue: monthValue,
      },
      {
        id: 'day',
        options: dayList.map((day) => ({
          text: formatDate(
            { month: 0, date: day },
            t('variables:dateFormat.map.schedule.options.day'),
          ),
          value: day,
          disabled: day > daysInMonth[monthValue - 1],
        })),
        selectedValue: dayValue,
      },
    ],
    [dayValue, monthValue, t],
  );

  return (
    <MultiListsSelect
      menus={menus}
      icon={<ScheduleIcon />}
      formatter={formatter}
      onSelect={dateOnSelect}
      {...props}
    />
  );
};

export default memo(MonthDaySelect);
