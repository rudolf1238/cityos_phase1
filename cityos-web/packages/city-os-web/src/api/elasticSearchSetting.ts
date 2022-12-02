import gql from 'graphql-tag';

import { ElasticSearchSensor } from '../libs/schema';

export interface ElasticSearchSettingResponse {
  elasticSearchSetting: ElasticSearchSensor[] | null;
}

export const ELASTIC_SEARCH_SETTING = gql`
  query elasticSearchSetting {
    elasticSearchSetting {
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
