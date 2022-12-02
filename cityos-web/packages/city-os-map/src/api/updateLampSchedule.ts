import gql from 'graphql-tag';

import { LightScheduleInput } from '../modules/Details/Lamp/types';

export interface UpdateLampSchedulePayload {
  deviceId: string;
  lightScheduleInput: LightScheduleInput;
}

export interface UpdateLampScheduleResponse {
  updateLampSchedule: boolean;
}

export const UPDATE_LAMP_SCHEDULE = gql`
  mutation updateLampSchedule($deviceId: String!, $lightScheduleInput: LightScheduleInput!) {
    updateLampSchedule(deviceId: $deviceId, lightScheduleInput: $lightScheduleInput)
  }
`;
