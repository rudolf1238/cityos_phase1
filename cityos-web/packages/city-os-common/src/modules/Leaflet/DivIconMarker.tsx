import { Marker, MarkerProps } from 'react-leaflet';
import { createPortal } from 'react-dom';
import L, { DivIcon } from 'leaflet';
import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';

type ReactProps = {
  iKey: string | number;
  children: [React.ReactNode, React.ReactNode];
};

type ContainerProps = {
  tagName: string;
  className?: string;
  container?: HTMLElement;
};

type DivIconMarkerProps = ReactProps & {
  marker: MarkerProps;
  container: ContainerProps;
};

const DivIconMarker: FunctionComponent<DivIconMarkerProps> = ({
  iKey,
  children,
  marker,
  container,
}: PropsWithChildren<DivIconMarkerProps>) => {
  const { tagName, className } = container;
  const element = L.DomUtil.create(tagName, className);
  const divIcon = new DivIcon({ html: element });
  // eslint-disable-next-line
  const portal = createPortal(children[0], element);

  useEffect(() => () => {
    L.DomUtil.remove(element);
  });

  const { position, eventHandlers } = marker;
  return (
    <>
      {portal}
      <Marker key={iKey} position={position} icon={divIcon} eventHandlers={eventHandlers}>
        {children[1]}
      </Marker>
    </>
  );
};

export default DivIconMarker;
