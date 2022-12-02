import 'leaflet/dist/leaflet.css';

import { useFormContext } from 'react-hook-form';
import React, { VoidFunctionComponent } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import { LatLng } from 'leaflet';
import { useMap, useMapEvent } from 'react-leaflet';

import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';
import DeviceIconMarkerLayer from 'city-os-common/modules/map/DeviceIconMarkerLayer';

import { DetailFormData } from '../types';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    borderRadius: theme.spacing(1),
  },

  baseMapContainer: {
    width: '100%',
    height: '100%',
  },
}));

const round2Limit = (num: number, limit: number): number =>
  Math.round(num * 10 ** limit) / 10 ** limit;

const LeafletMapCtrl = () => {
  const mapHook = useMap();

  const [position, setPosition] = React.useState<LatLng>(new LatLng(0, 0));

  const { getValues, setValue } = useFormContext<DetailFormData>();

  useMapEvent('click', (e) => {
    const tmpMapCenter: LatLng = e.latlng;

    setValue(
      'location',
      `${round2Limit(tmpMapCenter.lat, 6)}, ${round2Limit(tmpMapCenter.lng, 6)}`,
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const location = React.useMemo(() => getValues('location'), [getValues('location')]);

  const positionResult: LatLng = React.useMemo(() => {
    let tmpPosition: LatLng = position;

    const positionList = location.split(',');
    if (
      positionList.length > 1 &&
      Number.isNaN(Number(positionList[0])) === false &&
      Number.isNaN(Number(positionList[1])) === false
    ) {
      tmpPosition = new LatLng(Number(positionList[0]), Number(positionList[1]));
    }

    return tmpPosition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  React.useEffect(() => {
    setPosition(positionResult);
    mapHook.setView(positionResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionResult]);

  return null;
};

const EditDeviceMap: VoidFunctionComponent = () => {
  const classes = useStyles();

  const [position, setPosition] = React.useState<LatLng>(new LatLng(0, 0));

  const { getValues } = useFormContext<DetailFormData>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const location = React.useMemo(() => getValues('location'), [getValues('location')]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deviceType = React.useMemo(() => getValues('type'), [getValues('type')]);

  const positionResult: LatLng = React.useMemo(() => {
    let tmpPosition: LatLng = position;

    const positionList = location.split(',');
    if (
      positionList.length > 1 &&
      Number.isNaN(Number(positionList[0])) === false &&
      Number.isNaN(Number(positionList[1])) === false
    ) {
      tmpPosition = new LatLng(Number(positionList[0]), Number(positionList[1]));
    }

    return tmpPosition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  React.useEffect(() => {
    setPosition(positionResult);
  }, [positionResult]);

  return (
    <div className={classes.root}>
      <BaseMapContainer
        center={positionResult}
        zoom={13}
        scrollWheelZoom
        disableDraw
        className={classes.baseMapContainer}
      >
        <LeafletMapCtrl />
        <DeviceIconMarkerLayer deviceType={deviceType} position={positionResult} />
      </BaseMapContainer>
    </div>
  );
};

export default EditDeviceMap;
