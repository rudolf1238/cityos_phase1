import gql from 'graphql-tag';

import { DeviceType } from 'city-os-common/libs/schema';

import { ElasticSearchSensor } from '../libs/schema';

export interface ElasticSearchInput {
  deviceType: DeviceType;
  sensorId: string;
  /** date in number */
  from: number;
  /** date in number */
  to?: number;
}

export interface AddToElasticSearchPayload {
  elasticSearchInput: ElasticSearchInput;
}

export interface AddToElasticSearchResponse {
  addToElasticSearch: ElasticSearchSensor;
}

export const ADD_TO_ELASTIC_SEARCH = gql`
  mutation addToElasticSearch($elasticSearchInput: ElasticSearchInput!) {
    addToElasticSearch(elasticSearchInput: $elasticSearchInput) {
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
