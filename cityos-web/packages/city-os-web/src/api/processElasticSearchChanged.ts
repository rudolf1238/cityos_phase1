import gql from 'graphql-tag';

import { DeviceType } from 'city-os-common/libs/schema';

import { ElasticSearchSensor } from '../libs/schema';

export interface ProcessElasticSearchChangedPayload {
  deviceType: DeviceType;
  sensorId: string;
}

export interface ProcessElasticSearchChangedResponse {
  processElasticSearchChanged: ElasticSearchSensor;
}

export const PROCESS_ELASTIC_SEARCH_CHANGED = gql`
  subscription processElasticSearchChanged($deviceType: DeviceType!, $sensorId: String!) {
    processElasticSearchChanged(deviceType: $deviceType, sensorId: $sensorId) {
      deviceType
      sensorId
      sensorName
      sensorType
      from
      to
      enable
      status
    }
  }
`;
