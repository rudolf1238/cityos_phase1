import gql from 'graphql-tag';

import { DeviceType } from 'city-os-common/libs/schema';

import { ElasticSearchSensor } from '../libs/schema';

export interface EnableElasticSearchPayload {
  deviceType: DeviceType;
  sensorId: string;
  enable: boolean;
}

export interface EnableElasticSearchResponse {
  enableElasticSearch: ElasticSearchSensor;
}

export const ENABLE_ELASTIC_SEARCH = gql`
  mutation enableElasticSearch($deviceType: DeviceType!, $sensorId: String!, $enable: Boolean!) {
    enableElasticSearch(deviceType: $deviceType, sensorId: $sensorId, enable: $enable) {
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
