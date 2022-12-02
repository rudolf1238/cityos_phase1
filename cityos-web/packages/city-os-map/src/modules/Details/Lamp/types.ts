/** LightSchedule */
export interface MonthDay {
  month: number;
  day: number;
}

export interface HourMinute {
  hour: number;
  minute: number;
}

export interface SensorValues {
  [deviceId: string]: {
    [sensorId: string]: string | number | boolean | undefined;
  };
}

/** updateLampSchedule api interface */
export interface LightSensorConditionInput {
  lessThan: number;
  brightness: number;
}

export interface LightSensorInput {
  enableLightSensor?: boolean | null;
  lightSensorConditionInput?: LightSensorConditionInput[] | null;
}

export interface LightScheduleInput {
  lightSensorInput?: LightSensorInput | null;
  manualScheduleInput?: ManualScheduleInput | null;
}

export interface LightControlInput {
  hour: number;
  minute: number;
  brightness: number;
}

export interface ScheduleInput {
  startMonth: number;
  startDay: number;
  lightControlInputs: LightControlInput[];
}

export interface ManualScheduleInput {
  enableManualSchedule?: boolean | null;
  schedules?: ScheduleInput[] | null;
}
