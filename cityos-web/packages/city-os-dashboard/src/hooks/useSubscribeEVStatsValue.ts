import { ApolloError, useSubscription } from '@apollo/client';
import { useEffect, useMemo } from 'react';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import {
  SUBSCRIBE_VALUE_STATS,
  SubscribeValueStatsPayload,
  SubscribeValueStatsResponse,
} from 'api/subscribeValueStats';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ExtremeOperation } from '../libs/type';

interface UseSubscribeEVStatsValueResult {
  value?: number;
  loading: boolean;
  error?: ApolloError;
}

const useSubscribeEVStatsValue = (
  groupId: string,
  sensorId: SensorId.CHARGING_METER | SensorId.CHARGING_AMOUNT,
  days: number,
  operation: ExtremeOperation.SUM | ExtremeOperation.COUNT,
  onForbidden?: () => void,
): UseSubscribeEVStatsValueResult => {
  const { data, error, loading } = useSubscription<
    SubscribeValueStatsResponse,
    SubscribeValueStatsPayload
  >(SUBSCRIBE_VALUE_STATS, {
    variables: {
      groupId,
      deviceType: DeviceType.CHARGING,
      sensorId,
      days,
      operation,
    },
  });

  const value = useMemo(() => data?.sensorValueStatsChanged?.value, [
    data?.sensorValueStatsChanged?.value,
  ]);

  useEffect(() => {
    if (isGqlError(error, ErrorCode.FORBIDDEN) && onForbidden) {
      onForbidden();
    }
  }, [error, onForbidden]);

  return {
    value,
    loading,
    error,
  };
};

export default useSubscribeEVStatsValue;
