import gql from 'graphql-tag';

import { IDevice, MapDeviceFilter } from '../libs/schema';

interface MapDevices {
  devices: IDevice[];
}

export interface SearchDevicesOnMapPayload {
  groupId: string;
  filter?: MapDeviceFilter | null;
}

export interface SearchDevicesOnMapResponse {
  searchDevicesOnMap: MapDevices;
}

export const SEARCH_DEVICES_ON_MAP = gql`
  query searchDevicesOnMap($groupId: ID!, $filter: MapDeviceFilter) {
    searchDevicesOnMap(groupId: $groupId, filter: $filter) {
      devices {
        deviceId
        name
        uri
        type
        location {
          lat
          lng
        }
        groups {
          id
          name
        }
        ... on Lamp {
          related {
            deviceId
            type
          }
        }
      }
    }
  }
`;
