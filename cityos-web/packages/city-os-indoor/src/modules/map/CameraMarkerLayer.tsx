import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng } from 'leaflet';
import clsx from 'clsx';

import { IDevice } from 'city-os-common/libs/schema';

import { getAttrByKey } from '../../libs/utils';

import CameraIcon from '../common/CameraIcon';
import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginTop: -52,
    marginLeft: -52,
  },

  editMode: {
    pointerEvents: 'none',
    opacity: 0.3,
  },
}));

export interface CameraMarkerLayerProps {
  deviceList: IDevice[];
  activeId?: string | null;
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => void;
  editMode?: boolean;
}

export interface Camera {
  id: string;
  x: number;
  y: number;
}

const CameraMarkerLayer: VoidFunctionComponent<CameraMarkerLayerProps> = (
  props: CameraMarkerLayerProps,
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
          // TODO: 先註解，因為新增底部談出列
          // popup={
          //   <div style={{ width: 340, borderRadius: 8 }}>
          //     <LiveStreamPlayer device={device} />
          //   </div>
          // }
        >
          <Box
            component="div"
            className={clsx(classes.markerContainer, { [classes.editMode]: editMode })}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              handleMarkerClick(e, device);
            }}
            // 點擊穿透效果，這樣才能拖曳
            // style={{ pointerEvents: 'none' }}
          >
            <CameraIcon
              direction={Number(getAttrByKey(device.attributes || [], 'direction')?.value || -1)}
              selected={device.deviceId === activeId}
            />
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default CameraMarkerLayer;
