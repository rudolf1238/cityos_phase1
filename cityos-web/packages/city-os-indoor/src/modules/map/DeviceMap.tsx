import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ImageOverlay } from 'react-leaflet';
import { LatLng, LatLngBounds, ImageOverlay as LeafletImageOverlay } from 'leaflet';

import { makeStyles } from '@material-ui/core/styles';

import { DeviceType, IDevice } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { getImgBase64 } from '../../api/getImg';
import { useViewerPageContext } from '../ViewerPageProvider';
import CameraMarkerLayer from './CameraMarkerLayer';
import DeviceMarkerLayer from './DeviceMarkerLayer';
import ViewerMapControl from '../custom/ViewerMapControl';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.default,
    width: '100%',
    height: '100%',
  },

  viewerMapControl: {
    position: 'absolute',
    right: theme.spacing(2),
    zIndex: theme.zIndex.speedDial,
    cursor: 'default',
    top: theme.spacing(25),
  },
}));

const DeviceMap: VoidFunctionComponent = () => {
  const { deviceList, floor, activeId, setActiveId } = useViewerPageContext();

  const classes = useStyles();

  const [mapCenter, setMapCenter] = React.useState<LatLng>(new LatLng(0, 0));

  const resetOnPageInit = useCallback(() => {
    setMapCenter(new LatLng(0, 0));
  }, []);

  useEffect(() => {
    resetOnPageInit();
  }, [resetOnPageInit]);

  const imageLeftTop = useMemo<[number, number]>(() => {
    if (floor === null || floor.imageLeftTop === null || floor.imageLeftTop.length < 2) {
      return [1, -1];
    }
    return [Number(floor.imageLeftTop[0]), Number(floor.imageLeftTop[1])];
  }, [floor]);

  const imageRightBottom = useMemo<[number, number]>(() => {
    if (floor === null || floor.imageRightBottom === null || floor.imageRightBottom.length < 2) {
      return [-1, 1];
    }
    return [Number(floor.imageRightBottom[0]), Number(floor.imageRightBottom[1])];
  }, [floor]);

  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();

  const [imageSrc, setImageSrc] = useState<string>('');

  const asyncGetImg = useCallback(async () => {
    if (floor?.id) {
      try {
        const base64Image = await getImgBase64(
          floor.id,
          `Bearer ${user.accessToken || ''}`,
          permissionGroup?.group?.id || '',
        );

        if (typeof base64Image === 'string') {
          setImageSrc(base64Image);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [floor?.id, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  const imageLayerRef = React.useRef<LeafletImageOverlay>(null);

  useEffect(() => {
    imageLayerRef.current?.setBounds(new LatLngBounds([imageLeftTop, imageRightBottom]));
  }, [imageLeftTop, imageRightBottom]);

  return (
    <BaseMapContainer
      center={mapCenter}
      zoom={9}
      className={classes.root}
      attributionControl={false}
      zoomControl={false}
      key="device-map"
      disableTile
      disableDraw
    >
      <div className={classes.viewerMapControl}>
        <ViewerMapControl />
      </div>
      <ImageOverlay url={imageSrc} bounds={[imageLeftTop, imageRightBottom]} ref={imageLayerRef} />
      <CameraMarkerLayer
        deviceList={deviceList.filter((device) => device.type === DeviceType.CAMERA)}
        activeId={activeId}
        handleMarkerClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>,
          device?: IDevice | undefined,
        ) => {
          setActiveId(device?.deviceId || null);
        }}
      />
      <DeviceMarkerLayer
        deviceList={deviceList.filter((device) => device.type !== DeviceType.CAMERA)}
        activeId={activeId}
        handleMarkerClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>,
          device?: IDevice | undefined,
        ) => {
          setActiveId(device?.deviceId || null);
        }}
      />
    </BaseMapContainer>
  );
};

export default memo(DeviceMap);
