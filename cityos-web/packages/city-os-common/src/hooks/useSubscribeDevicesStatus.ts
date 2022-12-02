import { ApolloError, useSubscription } from '@apollo/client';
import { useState } from 'react';

import { DeviceStatus, DeviceType } from '../libs/schema';
import {
  GET_DEVICES_STATUS_CHANGED,
  GetDevicesStatusChangedPayload,
  GetDevicesStatusChangedResponse,
} from '../api/getDeviceStatusChanged';
import useIsMountedRef from './useIsMountedRef';

export interface SubscribeDevice {
  deviceId: string;
  type: DeviceType;
}

export interface SubscribeDeviceStatusResult extends SubscribeDevice {
  status: DeviceStatus;
}

export interface UseSubscribeDevicesStatusResponse {
  data: SubscribeDeviceStatusResult[];
  isLoading: boolean;
  error?: ApolloError;
}

const useSubscribeDevicesStatus = (
  subscribeDeviceList: SubscribeDevice[],
): UseSubscribeDevicesStatusResponse => {
  const [statusData, setStatusData] = useState<SubscribeDeviceStatusResult[]>([]);
  const isMountedRef = useIsMountedRef();

  const { loading, error } = useSubscription<
    GetDevicesStatusChangedResponse,
    GetDevicesStatusChangedPayload
  >(GET_DEVICES_STATUS_CHANGED, {
    variables: {
      deviceIds: subscribeDeviceList.map(({ deviceId }) => deviceId),
    },
    skip: subscribeDeviceList.length === 0,
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (!data || !isMountedRef.current) return;
      const { deviceId, status } = data.devicesStatusChanged;
      const changedDevice = subscribeDeviceList.find((device) => device.deviceId === deviceId);
      if (changedDevice) {
        setStatusData((prev) =>
          prev
            .filter((device) => device.deviceId !== deviceId)
            .concat({ ...changedDevice, status }),
        );
      }
    },
  });

  return {
    data: statusData,
    isLoading: loading,
    error,
  };
};

export default useSubscribeDevicesStatus;
