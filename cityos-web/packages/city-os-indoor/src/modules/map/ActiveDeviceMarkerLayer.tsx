import React, { VoidFunctionComponent, memo, useMemo, useRef } from 'react';

import { LatLng, Marker as LeafletMarker } from 'leaflet';

import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { IDevice } from 'city-os-common/libs/schema';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';

import { getAttrByKey } from '../../libs/utils';
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
    position: 'relative',
    backgroundColor: '#25b2ff',
    borderRadius: '100%',
    color: '#fff',
  },
  editMode: {
    pointerEvents: 'none',
    opacity: 0.3,
  },
  removeBtn: {
    // opacity: 0,
    width: 16,
    height: 16,
    borderRadius: '100%',
    top: -3,
    right: -1,
    backgroundColor: '#fff',
    border: '1.25px solid #FB7181',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FB7181',
  },
  onMarkerBtn: {
    position: 'absolute',
    zIndex: 300,
  },
}));

export interface ActiveDeviceMarkerLayerProps {
  deviceList: IDevice[];
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => void;
  editMode?: boolean;
  handleMarkerLocationChange?: (x: number, y: number) => void;
  handleMarkerRemove?: (device: IDevice) => void;
}

// TODO: 開發完成後要記得拔掉註記

const ActiveDeviceMarkerLayer: VoidFunctionComponent<ActiveDeviceMarkerLayerProps> = (
  props: ActiveDeviceMarkerLayerProps,
) => {
  const {
    deviceList,
    handleMarkerClick = (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => {
      console.info(e, device);
    },
    editMode = false,
    handleMarkerLocationChange = (x: number, y: number) => {
      console.info('LocationChange: ', x, y);
    },
    handleMarkerRemove = (device: IDevice) => {
      console.info('remove: ', device?.id);
    },
  } = props;

  const classes = useStyles();
  const markerRef = useRef<LeafletMarker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          handleMarkerLocationChange(marker.getLatLng().lng, marker.getLatLng().lat);
          console.info(marker.getLatLng());
        }
      },
    }),
    [handleMarkerLocationChange],
  );

  const handleRemoveButton = (
    _e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
    device: IDevice,
  ) => {
    handleMarkerRemove(device);
  };

  return (
    <>
      {deviceList.map((device: IDevice, _index: number) => (
        <DivIconMarker
          key={_index.toString()}
          markerKey={_index.toString()}
          markerProps={{
            position: new LatLng(
              Number(getAttrByKey(device.attributes || [], 'y')?.value || 0),
              Number(getAttrByKey(device.attributes || [], 'x')?.value || 0),
            ),
            draggable: true,
            eventHandlers,
          }}
          markerRef={markerRef}
          container={{ tagName: 'span' }}
        >
          <Box
            component="div"
            className={clsx(classes.markerContainer, { [classes.editMode]: editMode })}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              handleMarkerClick(e, device);
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <div
              className={clsx(classes.onMarkerBtn, classes.removeBtn)}
              onClick={(e) => {
                handleRemoveButton(e, device);
              }}
              onKeyDown={(e) => {
                handleRemoveButton(e, device);
              }}
              role="button"
              tabIndex={0}
            >
              <div style={{ height: '1.25px', backgroundColor: '#FB7181', width: '8px' }} />
            </div>

            <DeviceIcon type={device.type} />
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default memo(ActiveDeviceMarkerLayer);
