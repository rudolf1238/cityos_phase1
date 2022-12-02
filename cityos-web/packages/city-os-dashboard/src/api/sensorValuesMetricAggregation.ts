import gql from 'graphql-tag';

export interface SensorValuesMetricAggregationPayload {
  deviceId: string;
  sensorId: string;
  start: Date;
  end: Date;
}

export interface SensorValuesMetricAggregationResponse {
  sensorValuesMetricAggregation: {
    min: number;
    max: number;
    avg: number;
    sum: number;
    count: number;
  };
}

export const SENSOR_VALUES_METRIC_AGGREGATION = gql`
  query sensorValuesMetricAggregation(
    $deviceId: String!
    $sensorId: String!
    $start: Date!
    $end: Date!
  ) {
    sensorValuesMetricAggregation(
      deviceId: $deviceId
      sensorId: $sensorId
      start: $start
      end: $end
    ) {
      min
      max
      avg
      sum
      count
    }
  }
`;
