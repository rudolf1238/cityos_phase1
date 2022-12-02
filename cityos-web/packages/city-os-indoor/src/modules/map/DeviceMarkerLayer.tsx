import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng } from 'leaflet';
import clsx from 'clsx';

import { IDevice } from 'city-os-common/libs/schema';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';

import { getAttrByKey } from '../../libs/utils';
// import CameraIcon from '../common/CameraIcon'; 攝影機有特殊的形式

import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginTop: -12,
    marginLeft: -12,
  },

  editMode: {
    pointerEvents: 'none',
    opacity: 0.3,
  },

  normalIcon: {
    color: '#fff',
    backgroundColor: '#29CB97',
    borderRadius: '100%',
  },

  activeIcon: {
    backgroundColor: '#25b2ff',
  },
}));

export interface DeviceMarkerLayerProps {
  deviceList: IDevice[];
  activeId?: string | null;
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => void;
  editMode?: boolean;
}

const DeviceMarkerLayer: VoidFunctionComponent<DeviceMarkerLayerProps> = (
  props: DeviceMarkerLayerProps,
) => {
  const {
    deviceList,
    handleMarkerClick = (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => {
      if (D_DEBUG) console.info(e, device);
    },
    editMode = false,
    activeId,
  } = props;

  const classes = useStyles();

  return (
    <>
      {deviceList.map((device: IDevice, _index: number) => (
        <DivIconMarker
          key={device.id}
          markerKey={device.id}
          markerProps={{
            position: new LatLng(
              Number(getAttrByKey(device.attributes || [], 'y')?.value || 0),
              Number(getAttrByKey(device.attributes || [], 'x')?.value || 0),
            ),
          }}
          container={{ tagName: 'span' }}
        >
          <Box
            component="div"
            className={clsx(
              classes.markerContainer,
              { [classes.editMode]: editMode },
              classes.normalIcon,
              { [classes.activeIcon]: device.deviceId === activeId },
            )}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              handleMarkerClick(e, device);
            }}
          >
            <DeviceIcon type={device.type} />
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default DeviceMarkerLayer;
