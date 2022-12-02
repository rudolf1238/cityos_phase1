import React, {
  ComponentProps,
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';
import uniqBy from 'lodash/uniqBy';

import { LightControl, ManualSchedule, Schedule, Timezone } from 'city-os-common/libs/schema';
import getTimezoneString from 'city-os-common/libs/getTimezoneString';

import BrightnessSelect from '../../BrightnessSelect';

export const sortSchedules = (schedules: Schedule[]): Schedule[] =>
  [...schedules].sort((a, b) => (a.startMonth - b.startMonth) * 100 + a.startDay - b.startDay);

export const getTimezoneListString = (timezoneList: Timezone[]): string => {
  const uniqTimezoneList = uniqBy(timezoneList, 'timeZoneId');
  const timezoneString = uniqTimezoneList
    .map((timezone) => getTimezoneString(timezone.timeZoneId, timezone.rawOffset))
    .join(', ');
  return timezoneString;
};

export type BrightnessValue = ComponentProps<typeof BrightnessSelect>['value'];

export interface ScheduleInputItem {
  deviceId: string;
  name: string;
  manualSchedule: ManualSchedule;
  timezone?: Timezone;
}

export interface MonthDay {
  month: number;
  day: number;
}

export interface HourMinute {
  hour: number;
  minute: number;
}

export interface ScheduleContextValue {
  date: MonthDay;
  time: HourMinute;
  brightness: BrightnessValue;
  controlList: LightControl[];
  schedules: Schedule[];
  selectedControl: LightControl | null;
  selectedSchedule: Schedule | null;
  setDate: Dispatch<SetStateAction<MonthDay>>;
  setTime: Dispatch<SetStateAction<HourMinute>>;
  setBrightness: Dispatch<SetStateAction<BrightnessValue>>;
  setControlList: Dispatch<SetStateAction<LightControl[]>>;
  setSchedules: Dispatch<SetStateAction<Schedule[]>>;
  setSelectedControl: Dispatch<SetStateAction<LightControl | null>>;
  setSelectedSchedule: Dispatch<SetStateAction<Schedule | null>>;
  resetControlList: (newControlList: LightControl[]) => void;
  resetSchedules: (newSchedules: Schedule[]) => void;
}

const ScheduleContext = createContext<ScheduleContextValue>({
  date: { month: 1, day: 1 },
  time: { hour: 0, minute: 0 },
  brightness: undefined,
  controlList: [],
  schedules: [],
  selectedControl: null,
  selectedSchedule: null,
  setDate: () => {},
  setTime: () => {},
  setBrightness: () => {},
  setControlList: () => {},
  setSchedules: () => {},
  setSelectedControl: () => {},
  setSelectedSchedule: () => {},
  resetControlList: () => {},
  resetSchedules: () => {},
});

export function useScheduleContext(): ScheduleContextValue {
  return useContext(ScheduleContext);
}

function ScheduleProvider({
  value,
  children,
}: ProviderProps<ScheduleContextValue>): ReactElement | null {
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export default ScheduleProvider;
