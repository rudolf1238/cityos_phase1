import { ApolloError, useQuery } from '@apollo/client';
import { useState } from 'react';

import { DeviceType, Point, SensorId, SensorType } from 'city-os-common/libs/schema';
import {
  SensorValueStatsHistoryPayload,
  SensorValueStatsHistoryResponse,
  getSensorValueStatsHistory,
} from '../api/sensorValueStatsHistory';

import { ExtremeOperation } from '../libs/type';

interface UseGetEVStatsHistoryResult {
  data: Point[];
  error?: ApolloError;
}

const useGetEVStatsHistory = (
  groupId: string,
  start: number,
  end: number,
): UseGetEVStatsHistoryResult => {
  const [statsData, setStatsData] = useState<Point[]>([]);
  const [error, setError] = useState<ApolloError | undefined>(undefined);

  useQuery<SensorValueStatsHistoryResponse<SensorType.GAUGE>, SensorValueStatsHistoryPayload>(
    getSensorValueStatsHistory(SensorType.GAUGE),
    {
      variables: {
        input: {
          groupId,
          deviceType: DeviceType.CHARGING,
          sensorId: SensorId.CHARGING_AMOUNT,
          start,
          end,
          option: {
            operation: ExtremeOperation.SUM,
          },
        },
      },
      onCompleted: ({ sensorValueStatsHistory }) => {
        const newStatsData = sensorValueStatsHistory.map(({ time, value }) => ({
          value: value ?? 0,
          time: time ?? 0,
        }));
        setStatsData(newStatsData);
      },
      onError: (err) => {
        setError(err);
      },
    },
  );

  return { data: statsData, error };
};

export default useGetEVStatsHistory;
