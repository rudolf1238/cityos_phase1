import { makeStyles } from '@material-ui/core/styles';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { LatLng } from 'leaflet';
import { TileLayer } from 'react-leaflet';

import { DeviceType, IDevice } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { Building } from '../../libs/type';
import { getImgBase64 } from '../../api/getImg';

import { useEditorPageContext } from '../EditorPageProvider';
import ActiveCameraMarkerLayer from './ActiveCameraMarkerLayer';
import ActiveDeviceMarkerLayer from './ActiveDeviceMarkerLayer';
import CameraMarkerLayer from './CameraMarkerLayer';
import DeviceMarkerLayer from './DeviceMarkerLayer';
import EditorMapControl from '../custom/EditorMapControl';
import ImageTransformLayer from './ImageTransformLayer';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.default,
    width: '100%',
    height: '100%',
  },

  editorMapControl: {
    position: 'absolute',
    right: theme.spacing(2),
    zIndex: 1300,
    cursor: 'default',
    top: theme.spacing(22),
  },
}));

const EditorMap: VoidFunctionComponent = () => {
  const classes = useStyles();

  const { isMapEdit, deviceList, activeId, setActiveId, floor, building, setBuilding, setMap } =
    useEditorPageContext();

  const [mapCenter, setMapCenter] = React.useState<LatLng>(new LatLng(0, 0));

  const resetOnPageInit = useCallback(() => {
    setMapCenter(new LatLng(0, 0));
  }, []);

  useEffect(() => {
    resetOnPageInit();
  }, [resetOnPageInit]);

  const handleMarkerClick = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>, device?: IDevice) => {
      setActiveId(device?.deviceId || null);
    },
    [setActiveId],
  );

  const unActiveDeviceList = useMemo(
    () => deviceList.filter((device) => device.deviceId !== activeId),
    [deviceList, activeId],
  );

  const activeDeviceList = useMemo(
    () => deviceList.filter((device) => device.deviceId === activeId),
    [deviceList, activeId],
  );

  const handleMarkerLocationChange = useCallback(
    (x, y) => {
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);
        const deviceIndex = buildingClone.floors[floorIndex].devices.findIndex(
          (d) => d.deviceId === activeId,
        );
        const readOnlyAttributes = buildingClone.floors[floorIndex].devices[deviceIndex].attributes;

        if (readOnlyAttributes) {
          const attributes = [...readOnlyAttributes];
          const xIndex = attributes.findIndex((a) => a.key === 'x');
          const yIndex = attributes.findIndex((a) => a.key === 'y');
          if (x && y) {
            if (xIndex >= 0) {
              attributes[xIndex] = { key: 'x', value: String(x) };
            } else {
              attributes.push({ key: 'x', value: String(x) });
            }
            if (yIndex >= 0) {
              attributes[yIndex] = { key: 'y', value: String(y) };
            } else {
              attributes.push({ key: 'y', value: String(y) });
            }

            buildingClone.floors[floorIndex].devices[deviceIndex].attributes = attributes;
            if (buildingClone) {
              setBuilding(buildingClone);
            }
          }
        }
      }
    },
    [activeId, building, floor, setBuilding],
  );

  const handleMarkerDegreeChange = useCallback(
    (degree: number) => {
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);
        const deviceIndex = buildingClone.floors[floorIndex].devices.findIndex(
          (d) => d.deviceId === activeId,
        );
        const readOnlyAttributes = buildingClone.floors[floorIndex].devices[deviceIndex].attributes;

        if (readOnlyAttributes) {
          const attributes = [...readOnlyAttributes];
          const directionIndex = attributes.findIndex((a) => a.key === 'direction');

          if (deviceIndex >= 0) {
            attributes[directionIndex] = { key: 'direction', value: String(degree) };
          } else {
            attributes.push({ key: 'direction', value: String(degree) });
          }

          buildingClone.floors[floorIndex].devices[deviceIndex].attributes = attributes;
          if (buildingClone) {
            setBuilding(buildingClone);
          }
        }
      }
    },
    [activeId, building, floor, setBuilding],
  );

  const handleMarkerRemove = useCallback(
    (device: IDevice) => {
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);

        const newDeviceList = buildingClone.floors[floorIndex].devices.filter(
          (d) => d.deviceId !== device.deviceId,
        );

        buildingClone.floors[floorIndex].devices = newDeviceList;
        if (buildingClone) {
          setBuilding(buildingClone);
        }
      }
    },
    [building, floor, setBuilding],
  );

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
        if (D_DEBUG) console.error(e);
      }
    }
  }, [floor?.id, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  return (
    <BaseMapContainer
      center={mapCenter}
      zoom={9}
      className={classes.root}
      attributionControl={false}
      zoomControl={false}
      whenCreated={setMap}
      disableDraw
      disableTile
    >
      <div className={classes.editorMapControl}>
        <EditorMapControl />
      </div>

      <TileLayer attribution="" url="" />

      <ImageTransformLayer
        isMapEdit={isMapEdit}
        url={imageSrc}
        bounds={[imageLeftTop, imageRightBottom]}
      />

      <CameraMarkerLayer
        deviceList={unActiveDeviceList.filter((device) => device.type === DeviceType.CAMERA)}
        editMode={isMapEdit}
        handleMarkerClick={handleMarkerClick}
      />

      <DeviceMarkerLayer
        deviceList={unActiveDeviceList.filter((device) => device.type !== DeviceType.CAMERA)}
        activeId={activeId}
        editMode={isMapEdit}
        handleMarkerClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>,
          device?: IDevice | undefined,
        ) => {
          setActiveId(device?.deviceId || null);
        }}
      />

      <ActiveCameraMarkerLayer
        deviceList={activeDeviceList.filter((device) => device.type === DeviceType.CAMERA)}
        editMode={isMapEdit}
        handleMarkerClick={handleMarkerClick}
        handleMarkerLocationChange={handleMarkerLocationChange}
        handleMarkerDegreeChange={handleMarkerDegreeChange}
        handleMarkerRemove={handleMarkerRemove}
      />

      <ActiveDeviceMarkerLayer
        deviceList={activeDeviceList.filter((device) => device.type !== DeviceType.CAMERA)}
        editMode={isMapEdit}
        handleMarkerClick={handleMarkerClick}
        handleMarkerLocationChange={handleMarkerLocationChange}
        handleMarkerRemove={handleMarkerRemove}
      />
    </BaseMapContainer>
  );
};

export default memo(EditorMap);
