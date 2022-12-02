import { LatLng } from 'leaflet';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import { IDevice } from 'city-os-common/libs/schema';
import { defaultBounds } from 'city-os-common/libs/parsedENV';
import isMarkerInsidePolygon from 'city-os-common/libs/isMarkerInsidePolygon';

import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { useMapContext } from '../MapProvider';

import DeviceMarkerLayer from './DeviceMarkerLayer';

const minZoom = 4;

const MapContainer: VoidFunctionComponent = () => {
  const { deviceList, showCluster, disableClick, setMap, setSelectedIdList } = useMapContext();

  const handleStart = useCallback(() => {
    setSelectedIdList(new Set());
  }, [setSelectedIdList]);

  const handleSelectionDone = useCallback(
    (polygonPositions: LatLng[]) => {
      const newSelectedList: IDevice[] = [];
      deviceList?.forEach((pole) => {
        if (!pole.location) return;
        if (
          isMarkerInsidePolygon(new LatLng(pole.location.lat, pole.location.lng), polygonPositions)
        ) {
          newSelectedList.push(pole);
        }
      });
      const newSelectedIdList = new Set(newSelectedList.map(({ deviceId }) => deviceId));
      setSelectedIdList(newSelectedIdList);
    },
    [deviceList, setSelectedIdList],
  );

  return (
    <BaseMapContainer
      minZoom={minZoom}
      bounds={defaultBounds}
      whenCreated={setMap}
      disableDraw={showCluster}
      disableClick={disableClick}
      onDrawingStart={handleStart}
      onSelectionDone={handleSelectionDone}
    >
      <DeviceMarkerLayer minZoom={minZoom} defaultBounds={defaultBounds} />
    </BaseMapContainer>
  );
};

export default memo(MapContainer);
