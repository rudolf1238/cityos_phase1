import React, { VoidFunctionComponent } from 'react';

import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

import { LatLngExpression } from 'leaflet';

import { DeviceType } from '../../../libs/schema';
import DeviceIcon from '../../DeviceIcon';

import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  marker: {
    padding: '-0.5em 0 0 -0.5em',
    color: theme.palette.primary.main,
    width: '1em',
    height: '1em',
    borderRadius: '100%',
    opacity: 0.75,
  },

  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginTop: -12,
    marginLeft: -12,
  },

  normalIcon: {
    color: '#fff',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '100%',
  },
}));

export interface DeviceIconMarkerLayerProps {
  deviceType: DeviceType;
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  position: LatLngExpression;
}

const DeviceIconMarkerLayer: VoidFunctionComponent<DeviceIconMarkerLayerProps> = (
  props: DeviceIconMarkerLayerProps,
) => {
  const {
    deviceType,
    handleMarkerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      console.info(e);
    },
    position,
  } = props;

  const classes = useStyles();

  return (
    <>
      <DivIconMarker markerKey={uuidv4()} markerProps={{ position }} container={{ tagName: 'div' }}>
        <Box
          component="div"
          className={clsx(classes.markerContainer, classes.normalIcon)}
          onClick={handleMarkerClick}
        >
          <DeviceIcon type={deviceType} />
        </Box>
      </DivIconMarker>
    </>
  );
};

export default DeviceIconMarkerLayer;
