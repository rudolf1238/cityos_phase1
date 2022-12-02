import { ApolloError, useApolloClient } from '@apollo/client';
import { ObservableSubscription } from '@apollo/client/utilities';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ISensorData, SensorId, SensorType } from '../libs/schema';
import { isSensorId } from '../libs/validators';
import getSensorValueChanged from '../api/getSensorValueChanged';
import useIsMountedRef from './useIsMountedRef';

interface SensorValue<T extends SensorType> {
  deviceId: string;
  sensorId: string;
  data: ISensorData<T>;
}

interface ListenSensorResponse<T extends SensorType> {
  sensorValueChanged: SensorValue<T>;
}

export interface SensorSubscriptionResult<T extends SensorType = SensorType> {
  [deviceId: string]: {
    [sensorId: string]: {
      /** millisecond */
      time?: number;
      value: ISensorData<T>['value'];
      error?: ApolloError;
    };
  };
}

interface SensorSubscription {
  deviceId: string;
  sensorId: string;
  sensorSubscription: ObservableSubscription;
}

interface PartialSensor {
  sensorId: string;
  type: SensorType;
}

export interface PartialDevice {
  deviceId: string;
  sensors: PartialSensor[] | null;
}

const useSubscribeSensors = (
  deviceData: PartialDevice[] | null,
  subscribeSensors?: Set<SensorId>,
): SensorSubscriptionResult | null => {
  const client = useApolloClient();
  const [sensorData, setSensorData] = useState<SensorSubscriptionResult | null>(null);
  const [subscriptions, setSubscriptions] = useState<SensorSubscription[]>([]);
  const isMountedRef = useIsMountedRef();

  const setNewData = useCallback(
    ({
      deviceId,
      sensorId,
      time,
      value,
      error,
    }: {
      deviceId: string;
      sensorId: string;
      time?: number;
      value?: ISensorData<SensorType>['value'];
      error?: ApolloError;
    }) => {
      setSensorData((result) => {
        const newResult = { ...result };
        if (newResult[deviceId]?.[sensorId]) {
          newResult[deviceId][sensorId].time = time;
          newResult[deviceId][sensorId].value = value;
        } else {
          newResult[deviceId] = {
            ...newResult[deviceId],
            [sensorId]: { time, value, error },
          };
        }
        return newResult;
      });
    },
    [],
  );

  const createSubscription = useCallback(
    (deviceId: string, sensorId: string, sensorType: SensorType) => {
      const newSubscription = client
        .subscribe<ListenSensorResponse<typeof sensorType>>({
          query: getSensorValueChanged(sensorType),
          variables: {
            deviceId,
            sensorId,
          },
        })
        .subscribe({
          next({ data }) {
            if (data?.sensorValueChanged?.sensorId !== sensorId) {
              return;
            }
            const changedData = data.sensorValueChanged.data;
            if (
              changedData === undefined ||
              changedData.value === undefined ||
              changedData.value === null
            ) {
              return;
            }
            setNewData({
              deviceId,
              sensorId,
              time: changedData.time,
              value: changedData.value,
            });
          },
          error(error) {
            if (error instanceof ApolloError) {
              setNewData({
                deviceId,
                sensorId,
                error,
              });
            }
          },
        });
      return newSubscription;
    },
    [client, setNewData],
  );

  const sensorList = useMemo(() => {
    if (!deviceData) return [];
    const flatDeviceData = deviceData
      .map(({ deviceId, sensors }) => {
        if (!sensors || sensors.length === 0) return [];
        const sensorsInDevice = sensors
          .filter(({ sensorId }) => {
            if (!isSensorId(sensorId)) return false; // check if value is in SensorId enum
            if (subscribeSensors) return subscribeSensors.has(sensorId);
            return true;
          })
          .map(({ sensorId, type }) => ({
            deviceId,
            sensorId,
            sensorType: type,
          }));
        return sensorsInDevice;
      })
      .flat();
    return flatDeviceData;
  }, [deviceData, subscribeSensors]);

  useEffect(() => {
    setSubscriptions((prevList) => {
      let update = false;
      const newList = prevList
        .filter((item) => {
          const keep = sensorList.some(
            ({ deviceId, sensorId }) => deviceId === item.deviceId && sensorId === item.sensorId,
          );
          if (keep) return true;
          update = true;
          item.sensorSubscription.unsubscribe();
          setSensorData((prevSensors) => {
            const newSensors = { ...prevSensors };
            const newSensor = { ...newSensors[item.deviceId] };
            delete newSensor[item.sensorId];
            if (Object.keys(newSensor).length > 0) {
              newSensors[item.deviceId] = newSensor;
            } else {
              delete newSensors[item.deviceId];
            }
            return newSensors;
          });
          return false;
        })
        .concat(
          sensorList
            .filter((item) => {
              const isNew = prevList.every(
                ({ deviceId, sensorId }) =>
                  deviceId !== item.deviceId || sensorId !== item.sensorId,
              );
              if (isNew) update = true;
              return isNew;
            })
            .map((item) => ({
              deviceId: item.deviceId,
              sensorId: item.sensorId,
              sensorSubscription: createSubscription(item.deviceId, item.sensorId, item.sensorType),
            })),
        );
      return update ? newList : prevList;
    });
  }, [createSubscription, sensorList]);

  useEffect(
    () => () => {
      if (!isMountedRef.current) {
        subscriptions.forEach((subscription) => subscription.sensorSubscription.unsubscribe());
      }
    },
    [isMountedRef, subscriptions],
  );

  return sensorData;
};

export default useSubscribeSensors;
