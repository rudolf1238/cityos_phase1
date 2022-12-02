import { LatLngBounds, LatLngBoundsLiteral, Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useQuery } from '@apollo/client';
import React, {
  Dispatch,
  SetStateAction,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { DeviceType, GPSPoint, GPSRectInput, IDevice } from 'city-os-common/libs/schema';
import {
  SEARCH_CLUSTERS_ON_MAP,
  SearchClustersOnMapPayload,
  SearchClustersOnMapResponse,
} from 'city-os-common/api/searchClustersOnMap';
import {
  SEARCH_DEVICES_ON_MAP,
  SearchDevicesOnMapPayload,
  SearchDevicesOnMapResponse,
} from 'city-os-common/api/searchDevicesOnMap';
import { useStore } from 'city-os-common/reducers';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import ClusterMarker from 'city-os-common/modules/map/ClusterMarker';

import { useSurveillanceContext } from '../../SurveillanceProvider';

import CameraMarker from './CameraMarker';

const getCurrentBounds = (map: Map) => {
  const bounds = map.getBounds();
  if (!bounds) return null;
  return {
    ne: {
      lat: bounds.getNorthEast().wrap().lat,
      lng: bounds.getNorthEast().wrap().lng,
    },
    sw: {
      lat: bounds.getSouthWest().wrap().lat,
      lng: bounds.getSouthWest().wrap().lng,
    },
  };
};

const clusterThreshold = 15;

interface DeviceMarkerLayerProps {
  mapDevices: IDevice[];
  minZoom: number;
  defaultBounds?: LatLngBoundsLiteral;
  showCluster: boolean;
  setMapDevices: Dispatch<SetStateAction<IDevice[]>>;
  setDisableClick: Dispatch<SetStateAction<boolean>>;
  setShowCluster: Dispatch<SetStateAction<boolean>>;
}

const DeviceMarkerLayer: VoidFunctionComponent<DeviceMarkerLayerProps> = ({
  mapDevices,
  minZoom,
  defaultBounds,
  showCluster,
  setMapDevices,
  setDisableClick,
  setShowCluster,
}: DeviceMarkerLayerProps) => {
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const {
    keyword,
    selectedDevices,
    pageDeviceIds,
    setSelectedDevices,
    setIsUpdating,
    eventDeviceIds,
  } = useSurveillanceContext();
  const map = useMap();

  const [mapBounds, setMapBounds] = useState<GPSRectInput | null>(null);
  const [level, setLevel] = useState<number>(minZoom);
  const [previewMarkerId, setPreviewMarkerId] = useState<string>();
  const isMountedRef = useIsMountedRef();
  const boundsChangeRef = useRef(false);

  const updateLevel = useCallback(() => {
    const currentLevel = map.getZoom();
    if (currentLevel && currentLevel !== level) {
      setLevel(currentLevel);
    }
  }, [level, map]);

  const { data: searchDevicesResponse } = useQuery<
    SearchDevicesOnMapResponse,
    SearchDevicesOnMapPayload
  >(SEARCH_DEVICES_ON_MAP, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        type: DeviceType.CAMERA,
        gpsRectInput:
          mapBounds &&
          (mapBounds.ne?.lat === mapBounds.sw?.lat || mapBounds.ne?.lng === mapBounds.sw?.lng)
            ? null
            : mapBounds,
        keyword,
      },
    },
    skip: !divisionGroup?.id || !map || level < clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: () => {
      setDisableClick(false);
      updateLevel();
    },
  });

  const { data: searchClustersResponse } = useQuery<
    SearchClustersOnMapResponse,
    SearchClustersOnMapPayload
  >(SEARCH_CLUSTERS_ON_MAP, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        type: DeviceType.CAMERA,
        gpsRectInput: mapBounds,
        keyword,
      },
      level,
    },
    skip:
      !divisionGroup?.id ||
      !map ||
      (!!mapBounds &&
        (mapBounds.ne?.lat === mapBounds.sw?.lat || mapBounds.ne?.lng === mapBounds.sw?.lng)) ||
      level >= clusterThreshold,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onCompleted: (data) => {
      setDisableClick(false);
      const { gpsRect } = data.searchClustersOnMap;
      if (gpsRect?.ne && gpsRect.sw) {
        const { ne, sw } = gpsRect;
        const bounds = new LatLngBounds([ne.lat, ne.lng], [sw.lat, sw.lng]);
        map.fitBounds(bounds);
        setMapBounds({
          sw: { lat: sw.lat, lng: sw.lng },
          ne: { lat: ne.lat, lng: ne.lng },
        });
      } else if (!mapBounds) {
        if (!defaultBounds) return;
        map.fitBounds(defaultBounds);
        setMapBounds({
          sw: { lat: defaultBounds?.[0]?.[0], lng: defaultBounds?.[0]?.[1] },
          ne: { lat: defaultBounds?.[1]?.[0], lng: defaultBounds?.[1]?.[1] },
        });
      }
      updateLevel();
    },
  });

  const clusterList = useMemo(
    () =>
      searchClustersResponse?.searchClustersOnMap.cluster?.map((cluster, index) => ({
        ...cluster,
        id: index,
      })) || [],
    [searchClustersResponse?.searchClustersOnMap.cluster],
  );

  const clusterOnClick = useCallback(
    (location: GPSPoint) => {
      if (map) {
        map.setView(location, level + 3);
      }
    },
    [level, map],
  );

  const onPreviewOpen = useCallback((device: IDevice) => {
    setPreviewMarkerId(device.deviceId);
  }, []);

  const onPreviewClose = useCallback(() => {
    setPreviewMarkerId(undefined);
  }, []);

  const onAddClick = useCallback(
    (device: IDevice) => {
      if (selectedDevices.some(({ deviceId }) => deviceId === device.deviceId)) return;
      const currSelectedDevices = cloneDeep(selectedDevices);
      currSelectedDevices.push({ deviceId: device.deviceId, fixedIndex: null });
      setSelectedDevices(currSelectedDevices);
      setIsUpdating(true);
    },
    [selectedDevices, setSelectedDevices, setIsUpdating],
  );

  useEffect(() => {
    // avoid setMapBounds with uninitialized map
    if (!map) return () => {};
    let timer: number;
    const handleMove = () => {
      const bounds = getCurrentBounds(map);
      clearTimeout(timer);
      setDisableClick(true);
      timer = window.setTimeout(() => {
        if (boundsChangeRef.current && isMountedRef.current) {
          setMapBounds((prevBounds) => (isEqual(bounds, prevBounds) ? prevBounds : bounds));
        }
        boundsChangeRef.current = true;
      }, 1000);
    };
    map.addEventListener('move', handleMove);
    return () => {
      map.removeEventListener('move', handleMove);
      clearTimeout(timer);
    };
  }, [isMountedRef, map, setDisableClick]);

  useEffect(() => {
    setMapDevices(searchDevicesResponse?.searchDevicesOnMap.devices || []);
  }, [searchDevicesResponse?.searchDevicesOnMap.devices, setMapDevices]);

  useEffect(() => {
    setShowCluster(level < clusterThreshold);
  }, [level, setShowCluster]);

  useEffect(() => {
    setMapBounds(null);
    setLevel(minZoom);
  }, [divisionGroup?.id, minZoom]);

  if (showCluster) {
    return (
      <>
        {clusterList.map(({ id, location, count }) => (
          <ClusterMarker
            key={id}
            location={location}
            count={count}
            onClick={() => {
              clusterOnClick(location);
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {mapDevices.map((device) => {
        const isSelected = selectedDevices.some(({ deviceId }) => deviceId === device.deviceId);
        const screenIndex = pageDeviceIds.findIndex((deviceId) => deviceId === device.deviceId);
        const selectedLabel = screenIndex >= 0 ? (screenIndex + 1).toString() : undefined;

        return device.location ? (
          <CameraMarker
            key={device.deviceId}
            device={device}
            isSelected={isSelected}
            detectedType={eventDeviceIds.includes(device.deviceId) ? 'highlight' : undefined}
            showPreview={device.deviceId === previewMarkerId}
            selectedLabel={selectedLabel}
            zIndexOffset={screenIndex >= 0 ? screenIndex + 1 : 0}
            onPreviewOpen={onPreviewOpen}
            onPreviewClose={onPreviewClose}
            onAddClick={onAddClick}
          />
        ) : null;
      })}
    </>
  );
};

export default memo(DeviceMarkerLayer);
