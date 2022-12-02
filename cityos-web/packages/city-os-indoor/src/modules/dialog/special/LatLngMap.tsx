import React, { VoidFunctionComponent, memo, useEffect, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import { LatLng } from 'leaflet';
import update from 'immutability-helper';

import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { useDialogContext } from '../DialogProvider';
import InputSymbolIcon from '../../../assets/icon/input-symbol.svg';
import SolidPoiIcon from '../../../assets/icon/solid-poi.svg';

const useStyles = makeStyles((theme) => ({
  latLongInput: {
    position: 'absolute',
    width: theme.spacing(49),
    left: 0,
    right: 0,
    margin: 'auto',
    bottom: theme.spacing(3),
    zIndex: 500,
    pointerEvents: 'initial',
  },

  mapCenterIcon: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    margin: 'auto',
    zIndex: 500,
    pointerEvents: 'none',
    paddingBottom: 33.75,
    height: 93.75,
  },

  baseMapContainer: {
    width: '100%',
    height: '100%',
  },
}));

interface BuildingMapProps {
  radius?: boolean;
}

const BuildingMap: VoidFunctionComponent<BuildingMapProps> = (props: BuildingMapProps) => {
  const classes = useStyles();

  const { radius } = props;

  const { map, setMap, building, setBuilding } = useDialogContext();
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (map !== null) {
      map.once('drag moveend', () => {
        const center = map.getCenter();
        if (textFieldRef.current) {
          textFieldRef.current.value = `${center.lat}, ${center.lng}`;
        }
        if (building) {
          setBuilding(
            update(building, { location: { $set: { lat: center.lat, lng: center.lng } } }),
          );
        }
      });
      return () => {
        map.off('drag moveend');
      };
    }
    return () => {};
  }, [building, map, setBuilding]);

  return (
    <>
      <TextField
        inputRef={textFieldRef}
        type="text"
        variant="outlined"
        label="Lat Long"
        placeholder="Insert Lat Long"
        className={classes.latLongInput}
        InputLabelProps={{
          shrink: true,
        }}
        defaultValue={
          building?.location ? `${building?.location?.lat}, ${building?.location?.lng}` : ''
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <InputSymbolIcon />
            </InputAdornment>
          ),
        }}
      />
      <BaseMapContainer
        disableDraw
        whenCreated={setMap}
        center={new LatLng(building?.location?.lat || 0, building?.location?.lng || 0)}
        zoom={12}
        style={radius ? { borderRadius: '8px' } : {}}
        className={classes.baseMapContainer}
      >
        <SolidPoiIcon className={classes.mapCenterIcon} />
      </BaseMapContainer>
    </>
  );
};

export default memo(BuildingMap);
