/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { VoidFunctionComponent, useEffect, useMemo, useState } from 'react';

import 'leaflet-path-transform';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { Building } from '../../libs/type';
import { useEditorPageContext } from '../EditorPageProvider';

const latLngBounds2literal = (bounds: L.LatLngBounds): L.LatLngBoundsLiteral => [
  [bounds.getSouth(), bounds.getEast()],
  [bounds.getNorth(), bounds.getWest()],
];

export interface ImageTransformLayerProps {
  isMapEdit?: boolean;
  url: string;
  bounds: L.LatLngBoundsLiteral;
}

const ImageTransformLayer: VoidFunctionComponent<ImageTransformLayerProps> = (
  props: ImageTransformLayerProps,
) => {
  const {
    isMapEdit,
    url = '',
    bounds = [
      [0, 0],
      [0, 0],
    ],
  } = props;
  const map = useMap();

  const { floor, building, setBuilding } = useEditorPageContext();

  const [rectangleBounds, setRectangleBounds] = useState<L.LatLngBounds>(
    new L.LatLngBounds(bounds),
  );

  useEffect(() => {
    setRectangleBounds(new L.LatLngBounds(bounds));
  }, [bounds]);

  const rectangle = useMemo<L.Rectangle>(
    () =>
      (L as any).rectangle(
        [
          [0, 0],
          [0, 0],
        ],
        {
          draggable: true,
          transform: true,
        },
      ) as L.Rectangle,
    [],
  );

  const image = useMemo<L.ImageOverlay>(
    () =>
      (L as any)
        .imageOverlay(
          '',
          [
            [0, 0],
            [0, 0],
          ],
          {
            draggable: true,
            transform: true,
          },
        )
        .addTo(map) as L.ImageOverlay,
    [map],
  );

  useEffect(() => {
    if (isMapEdit) {
      rectangle.addTo(map);
    } else {
      map.removeLayer(rectangle);
    }
  }, [isMapEdit, map, rectangle]);

  useEffect(() => {
    rectangle.setBounds(rectangleBounds);
  }, [rectangle, rectangleBounds]);

  useEffect(() => {
    image.setUrl(url);
  }, [image, url]);

  useEffect(() => {
    image.setBounds(rectangleBounds);
  }, [image, rectangleBounds]);

  useEffect(() => {
    const interval = setTimeout(() => {
      if (isMapEdit) {
        (rectangle as any).transform.enable({
          rotation: false,
          scaling: true,
          uniformScaling: false,
        });
      } else {
        (rectangle as any).transform.disable();
      }
    });
    return () => clearInterval(interval);
  }, [rectangle, isMapEdit]);

  useEffect(() => {
    rectangle.on('dragend, transformed', (_e: unknown) => {
      const newBound = rectangle.getBounds();
      const newLiteral = latLngBounds2literal(newBound);
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);
        buildingClone.floors[floorIndex].imageLeftTop = [
          String(newLiteral[0][0]),
          String(newLiteral[0][1]),
        ];
        buildingClone.floors[floorIndex].imageRightBottom = [
          String(newLiteral[1][0]),
          String(newLiteral[1][1]),
        ];
        setBuilding(buildingClone);
        setRectangleBounds(newBound);
      }
    });
  }, [building, floor, rectangle, setBuilding]);

  return null;
};

export default ImageTransformLayer;
