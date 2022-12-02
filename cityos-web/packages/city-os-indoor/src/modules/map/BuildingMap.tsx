import { makeStyles } from '@material-ui/core/styles';

import { useRouter } from 'next/router';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { GeoJsonProperties } from 'geojson';
import { LatLng, LatLngBounds, Map as LeafletMapClass } from 'leaflet';
import { max as _max, min as _min } from 'lodash';
import Supercluster, { AnyProps, PointFeature } from 'supercluster';

import { defaultBounds } from 'city-os-common/libs/parsedENV';
import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';

import { BuildingEdge, DetailMode, Query } from '../../libs/type';

import BuildingGroupMarkerLayer, { Cluster } from './BuildingGroupMarkerLayer';
import BuildingMarkerLayer from './BuildingMarkerLayer';

const useStyles = makeStyles((_theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
}));

interface BuildingMapProps {
  buildingEdgeList: BuildingEdge[];
}

const BuildingMap: VoidFunctionComponent<BuildingMapProps> = (props: BuildingMapProps) => {
  const { buildingEdgeList } = props;

  const classes = useStyles();
  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const [map, setMap] = useState<LeafletMapClass | null>(null);

  const defaultCenter = useMemo(() => new LatLng(25.050268017208108, 121.5205101827239), []);

  const [mapCenter, setMapCenter] = React.useState<LatLng>(defaultCenter);

  const handleMarkerClick = React.useCallback(
    (_e: React.MouseEvent<HTMLDivElement>, buildingEdge?: BuildingEdge): void => {
      void router.push({
        pathname: '/indoor/detail',
        query: {
          deviceId: buildingEdge?.node.deviceId,
          mode: DetailMode.DEVICE_MAP,
          groupId: routerQuery.groupId,
        },
      });
    },
    [router, routerQuery.groupId],
  );

  // ? 地圖元件自適應區間 */

  useEffect(() => {
    if (buildingEdgeList.length > 0) {
      const minLat =
        _min(buildingEdgeList.map((buildingEdge) => buildingEdge.node.location?.lat || -90)) || -90;
      const maxLat =
        _max(buildingEdgeList.map((buildingEdge) => buildingEdge.node.location?.lat || 90)) || 90;
      const minLng =
        _min(buildingEdgeList.map((buildingEdge) => buildingEdge.node.location?.lng || -180)) ||
        -180;
      const maxLng =
        _max(buildingEdgeList.map((buildingEdge) => buildingEdge.node.location?.lng || 180)) || 180;

      const width = maxLng - minLng;
      const height = maxLat - minLat;

      // 使用 log2 土砲取得最佳缩放级别，因為新方式不一定好，所以先註解舊方式
      // const center = new LatLng((minLat + maxLat) / 2, (minLng + maxLng) / 2);
      // const zoom = Math.min(Math.log2(360 / width), Math.log2(180 / height));
      // map?.setView(center, zoom + 2);

      map?.fitBounds([
        [minLat - 0.1 * height, minLng - 0.1 * width],
        [maxLat + 0.1 * height, maxLng + 0.1 * width],
      ]);
    } else if (defaultBounds) {
      map?.fitBounds(defaultBounds);
    }
  }, [buildingEdgeList, map]);

  // ? 辨識是否地圖正在被拖曳所需的參考 */

  const mapDragendDateRef = useRef<Date>(new Date());

  useEffect(() => {
    if (map) {
      map.on('dragend', () => {
        mapDragendDateRef.current = new Date();
      });
    }
  }, [map]);

  // ? 處理建築群組 */

  const index = useMemo(
    () =>
      new Supercluster({
        radius: 120,
        maxZoom: 14,
      }),
    [],
  );

  const points: Array<Supercluster.PointFeature<GeoJsonProperties>> = useMemo(
    () =>
      buildingEdgeList.map((buildingEdge) => ({
        type: 'Feature',
        properties: {
          id: buildingEdge.node.deviceId,
        },
        geometry: {
          type: 'Point',
          coordinates: [buildingEdge.node.location?.lng || 0, buildingEdge.node.location?.lat || 0],
        },
      })),
    [buildingEdgeList],
  );

  const [clusters, setClusters] = useState<Supercluster.PointFeature<GeoJsonProperties>[]>([]);

  const getClusters = useCallback(
    (bounds: LatLngBounds, zoom: number) => {
      index.load(points as PointFeature<AnyProps>[]);
      const res = index.getClusters(
        [
          bounds?.getWest() || -180,
          bounds?.getSouth() || -90,
          bounds?.getEast() || 180,
          bounds?.getNorth() || 90,
        ],
        Math.floor(zoom),
      );
      return res || [];
    },
    [points, index],
  );

  useEffect(() => {
    if (!map) return;
    map.on('move', () => {
      setClusters(getClusters(map.getBounds(), map.getZoom()));
    });
  }, [getClusters, map]);

  const showBuildingId = useMemo(
    () =>
      clusters
        .filter((cluster) => cluster?.id === undefined)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        .map((cluster) => (cluster.properties as any).id as string),
    [clusters],
  );

  const currentBuildingEdgeList = useMemo(
    () =>
      buildingEdgeList.filter((buildingEdge) =>
        showBuildingId.includes(buildingEdge.node.deviceId),
      ),
    [buildingEdgeList, showBuildingId],
  );

  const currentClusters: Cluster[] = useMemo(
    () =>
      clusters
        .filter((cluster) => cluster?.id !== undefined)
        .map((cluster) => ({
          id: cluster.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          count: (cluster.properties as any).point_count as number,
          lat: cluster.geometry.coordinates[1],
          lng: cluster.geometry.coordinates[0],
        })),
    [clusters],
  );

  const handleGroupMarkerClick = React.useCallback(
    (_e: React.MouseEvent<HTMLDivElement>, cluster?: Cluster): void => {
      if (cluster === undefined) return;
      map?.setView(new LatLng(cluster.lat, cluster.lng), map.getZoom() + 2);
    },
    [map],
  );

  // ? 元件載入先行動作 */

  const resetOnPageInit = useCallback(() => {
    setMapCenter(defaultCenter);
    if (!map) return;
    setClusters(getClusters(map.getBounds(), map.getZoom()));
  }, [defaultCenter, getClusters, map]);

  useEffect(() => {
    resetOnPageInit();
  }, [resetOnPageInit]);

  return (
    <BaseMapContainer
      maxBounds={[
        [-90, -270],
        [90, 270],
      ]}
      minZoom={2}
      maxZoom={18}
      whenCreated={setMap}
      center={mapCenter}
      zoom={12}
      className={classes.root}
      disableDraw
    >
      <BuildingMarkerLayer
        buildingEdgeList={currentBuildingEdgeList}
        handleMarkerClick={handleMarkerClick}
        mapDragendDateRef={mapDragendDateRef}
      />
      <BuildingGroupMarkerLayer
        clusters={currentClusters}
        mapDragendDateRef={mapDragendDateRef}
        handleMarkerClick={handleGroupMarkerClick}
      />
    </BaseMapContainer>
  );
};

export default memo(BuildingMap);
