import { ApolloQueryResult } from '@apollo/client';
import gql from 'graphql-tag';

import { Group, IDevice, LightSensor, ManualSchedule, Sensor } from '../libs/schema';

interface BaseDeviceResponse
  extends Required<Pick<IDevice, 'deviceId' | 'name' | 'type' | 'timezone'>> {
  sensors: Pick<Sensor, 'sensorId' | 'name' | 'unit' | 'type'>[];
  groups: Pick<Group, 'id' | 'name' | 'projectKey'>[];
  imageIds?: string[] | null;
}

export type RelatedDeviceResponse = Omit<BaseDeviceResponse, 'timezone'>;

export interface SingleDeviceResponse extends BaseDeviceResponse {
  hasLightSensor: boolean | null;
  lightSchedule: {
    lightSensor: LightSensor | null;
    manualSchedule: ManualSchedule | null;
  } | null;
  related: RelatedDeviceResponse[] | null;
}

export interface GetDeviceDetailPayload {
  deviceIds: string[];
}

export interface GetDeviceDetailResponse {
  getDevices: SingleDeviceResponse[];
}

export type Refetch = (
  variables?: Partial<GetDeviceDetailPayload> | undefined,
) => Promise<ApolloQueryResult<GetDeviceDetailResponse>>;

export const GET_DEVICE_DETAIL = gql`
  query getMapDevices($deviceIds: [String!]!) {
    getDevices(deviceIds: $deviceIds) {
      deviceId
      name
      type
      groups {
        id
        name
        projectKey
      }
      sensors {
        sensorId
        name
        unit
        type
      }
      timezone {
        rawOffset
        timeZoneId
        timeZoneName
      }
      imageIds
      ... on Lamp {
        hasLightSensor
        lightSchedule {
          lightSensor {
            enableLightSensor
            lightSensorCondition {
              lessThan
              brightness
            }
          }
          manualSchedule {
            enableManualSchedule
            schedules {
              startMonth
              startDay
              lightControls {
                hour
                minute
                brightness
              }
            }
          }
        }
        related {
          type
          deviceId
          name
          groups {
            id
            name
            projectKey
          }
          sensors {
            sensorId
            name
            unit
            type
          }
        }
      }
    }
  }
`;
