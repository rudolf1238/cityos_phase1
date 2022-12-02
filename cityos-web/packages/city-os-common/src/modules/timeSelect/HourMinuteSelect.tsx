import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import formatDate from '../../libs/formatDate';

import ClockIcon from '../../assets/icon/clock.svg';
import MultiListsSelect, { MultiListsSelectProps } from './MultiListsSelect';

interface HourMinuteSelectProps
  extends Omit<MultiListsSelectProps<'hour' | 'minute', number>, 'onSelect' | 'menus'> {
  hourValue: number;
  minuteValue: number;
  minutePerStep?: number;
  onSelect: (newValues: { hour?: number; minute?: number }) => void;
}

const HourMinuteSelect: VoidFunctionComponent<HourMinuteSelectProps> = ({
  hourValue,
  minuteValue,
  minutePerStep = 1,
  onSelect,
  ...props
}: HourMinuteSelectProps) => {
  const timeOnSelect = useCallback(
    (id: 'hour' | 'minute', selectedValue: number) => {
      onSelect({ [id]: selectedValue });
    },
    [onSelect],
  );

  const formatter = useCallback(
    ({ hour, minute }: { hour: number; minute: number }) =>
      formatDate({ hours: hour || 0, minutes: minute || 0 }, 'HH:mm'),
    [],
  );

  const menus: {
    id: 'hour' | 'minute';
    options: {
      value: number;
      text: string;
    }[];
    selectedValue: number;
  }[] = useMemo(
    () => [
      {
        id: 'hour',
        options: Array.from({ length: 24 }, (_, i) => ({
          value: i,
          text: i.toString().padStart(2, '0'),
        })),
        selectedValue: hourValue,
      },
      {
        id: 'minute',
        options: Array.from({ length: Math.floor(60 / minutePerStep) }, (_, i) => ({
          value: i * minutePerStep,
          text: (i * minutePerStep).toString().padStart(2, '0'),
        })),
        selectedValue: minuteValue,
      },
    ],
    [hourValue, minutePerStep, minuteValue],
  );

  return (
    <MultiListsSelect
      menus={menus}
      formatter={formatter}
      onSelect={timeOnSelect}
      icon={<ClockIcon />}
      {...props}
    />
  );
};

export default memo(HourMinuteSelect);
