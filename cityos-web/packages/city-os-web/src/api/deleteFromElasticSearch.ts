import gql from 'graphql-tag';

import { DeviceType } from 'city-os-common/libs/schema';

import { ElasticSearchSensor } from '../libs/schema';

export interface DeleteFromElasticSearchPayload {
  deviceType: DeviceType;
  sensorId: string;
}

export interface DeleteFromElasticSearchResponse {
  deleteFromElasticSearch: ElasticSearchSensor;
}

export const DELETE_FROM_ELASTIC_SEARCH = gql`
  mutation deleteFromElasticSearch($deviceType: DeviceType!, $sensorId: String!) {
    deleteFromElasticSearch(deviceType: $deviceType, sensorId: $sensorId) {
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
