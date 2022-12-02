import { LatLng, LeafletMouseEvent, icon, point } from 'leaflet';
import { Marker, Polygon, Polyline, useMap } from 'react-leaflet';
import { useTheme } from '@material-ui/core/styles';
import React, {
  Dispatch,
  SetStateAction,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface DrawLayerProps {
  stage: 'default' | 'drawing' | 'done';
  polygonPositions: LatLng[];
  setStage: Dispatch<SetStateAction<'default' | 'drawing' | 'done'>>;
  setPolygonPositions: Dispatch<SetStateAction<LatLng[]>>;
}

const DrawLayer: VoidFunctionComponent<DrawLayerProps> = ({
  stage,
  polygonPositions,
  setStage,
  setPolygonPositions,
}: DrawLayerProps) => {
  const theme = useTheme();
  const map = useMap();
  const [hoverPoint, setHoverPoint] = useState<LatLng>();

  const handleDrawingDone = useCallback(() => {
    setStage('done');
  }, [setStage]);

  const vertexSvg = useMemo(
    () => `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="15" cy="15" r="15" fill="none"/>
<circle cx="15" cy="15" r="5" stroke="${theme.palette.primary.light}" stroke-width="2" fill="#FFF"/>
</svg>`,
    [theme],
  );

  const vertexIcon = useMemo(
    () =>
      icon({
        iconAnchor: point(15, 15),
        iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(vertexSvg)}`,
      }),
    [vertexSvg],
  );

  const doneVertexSvg = useMemo(
    () => `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="5" cy="5" r="5" fill="${theme.palette.primary.light}"/>
</svg>`,
    [theme],
  );

  const doneVertexIcon = useMemo(
    () =>
      icon({
        iconAnchor: point(5, 5),
        iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(doneVertexSvg)}`,
      }),
    [doneVertexSvg],
  );

  useEffect(() => {
    if (stage !== 'drawing') {
      return () => {};
    }
    const handleClick = (e: LeafletMouseEvent) => {
      setPolygonPositions((prev) => [...prev, e.latlng]);
    };
    map.addEventListener('click', handleClick, false);
    return () => {
      map.removeEventListener('click', handleClick, false);
    };
  }, [map, stage, setPolygonPositions]);

  useEffect(() => {
    if (stage !== 'drawing') {
      return () => {};
    }
    const handleMouseMove = (e: LeafletMouseEvent) => {
      setHoverPoint(e.latlng);
    };
    map.addEventListener('mousemove', handleMouseMove);
    return () => {
      map.removeEventListener('mousemove', handleMouseMove);
    };
  }, [map, stage]);

  return (
    <>
      {(stage === 'drawing' || stage === 'done') &&
        polygonPositions.map((position, idx) => (
          <Marker
            key={idx.toString()}
            position={position}
            icon={stage === 'done' ? doneVertexIcon : vertexIcon}
            eventHandlers={
              stage === 'drawing' && idx === 0
                ? {
                    click: handleDrawingDone,
                  }
                : undefined
            }
          />
        ))}
      {stage === 'drawing' && (
        <>
          {polygonPositions.length > 0 && hoverPoint && (
            <Polyline
              positions={[polygonPositions[polygonPositions.length - 1], hoverPoint]}
              color={theme.palette.primary.light}
              opacity={0.6}
            />
          )}
          {polygonPositions.length > 1 &&
            polygonPositions.reduce<JSX.Element[]>((acc, position, idx) => {
              if (polygonPositions[idx + 1]) {
                acc.push(
                  <Polyline
                    key={idx.toString()}
                    positions={[position, polygonPositions[idx + 1]]}
                    color={theme.palette.primary.light}
                  />,
                );
              }
              return acc;
            }, [])}
        </>
      )}
      {stage === 'done' && (
        <Polygon
          positions={polygonPositions}
          color={theme.palette.primary.light}
          fillColor={theme.palette.primary.light}
          fillOpacity={0.3}
        />
      )}
    </>
  );
};

export default DrawLayer;
