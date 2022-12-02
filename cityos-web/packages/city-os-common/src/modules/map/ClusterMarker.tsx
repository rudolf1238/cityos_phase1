import { LeafletMouseEventHandlerFn, icon, point } from 'leaflet';
import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import { Marker } from 'react-leaflet';

import { GPSPoint } from '../../libs/schema';

interface ClusterProps {
  location: GPSPoint;
  count: number;
  onClick?: LeafletMouseEventHandlerFn;
}

const Cluster: VoidFunctionComponent<ClusterProps> = ({
  location,
  count,
  onClick,
}: ClusterProps) => {
  const theme = useTheme();

  const radius = useMemo(() => {
    if (count > 100) return 60;
    if (count > 50) return 50;
    if (count > 30) return 40;
    return 30;
  }, [count]);

  const diameter = radius * 2;

  const svg = useMemo(
    () => `<svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${theme.palette.gadget.offline}"/>
    <text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central" fill="${
      theme.palette.primary.contrastText
    }" font-size="32px">${count.toString()}</text>
    </svg>`,
    [count, diameter, radius, theme],
  );

  const markerIcon = useMemo(
    () =>
      icon({
        iconAnchor: point(40, 40),
        iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(svg)}`,
      }),
    [svg],
  );

  return (
    <Marker
      position={location}
      icon={markerIcon}
      eventHandlers={{
        click: onClick,
      }}
    />
  );
};

export default memo(Cluster);
