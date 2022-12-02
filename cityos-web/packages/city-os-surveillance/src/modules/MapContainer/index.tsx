import { LatLng } from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';

import { IDevice } from 'city-os-common/libs/schema';
import { defaultBounds } from 'city-os-common/libs/parsedENV';
import isMarkerInsidePolygon from 'city-os-common/libs/isMarkerInsidePolygon';

import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { useSurveillanceContext } from '../SurveillanceProvider';

import DeviceMarkerLayer from './DeviceMarkerLayer';

const minZoom = 4;

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
  },
}));

const MapContainer: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { setMap, setSelectedDevices, setIsUpdating, setCursorIndex } = useSurveillanceContext();
  const [disableClick, setDisableClick] = useState<boolean>(false);
  const [showCluster, setShowCluster] = useState<boolean>(false);
  const [mapDevices, setMapDevices] = useState<IDevice[]>([]);

  const handleStart = useCallback(() => {
    setSelectedDevices([]);
    setCursorIndex(0);
    setIsUpdating(true);
  }, [setCursorIndex, setIsUpdating, setSelectedDevices]);

  const handleSelectionDone = useCallback(
    (polygonPositions: LatLng[]) => {
      const newSelectedList: IDevice[] = [];
      mapDevices?.forEach((pole) => {
        if (!pole.location) return;
        if (
          isMarkerInsidePolygon(new LatLng(pole.location.lat, pole.location.lng), polygonPositions)
        ) {
          newSelectedList.push(pole);
        }
      });
      const newSelectedDevices = newSelectedList.map(({ deviceId }) => ({
        deviceId,
        fixedIndex: null,
      }));
      setSelectedDevices(newSelectedDevices);
      setIsUpdating(true);
    },
    [mapDevices, setSelectedDevices, setIsUpdating],
  );

  return (
    <BaseMapContainer
      minZoom={minZoom}
      bounds={defaultBounds}
      whenCreated={setMap}
      disableDraw={showCluster}
      disableClick={disableClick}
      className={classes.root}
      onDrawingStart={handleStart}
      onSelectionDone={handleSelectionDone}
    >
      <DeviceMarkerLayer
        minZoom={minZoom}
        defaultBounds={defaultBounds}
        showCluster={showCluster}
        mapDevices={mapDevices}
        setShowCluster={setShowCluster}
        setDisableClick={setDisableClick}
        setMapDevices={setMapDevices}
      />
    </BaseMapContainer>
  );
};

export default memo(MapContainer);
