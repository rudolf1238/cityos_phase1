import { Marker, MarkerProps, Popup } from 'react-leaflet';
import { createPortal } from 'react-dom';
import L, { DivIcon, Marker as LeafletMarker } from 'leaflet';
import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';

type ReactProps = {
  markerKey?: React.Key | null;
  children: React.ReactNode;
};

type ContainerProps = {
  tagName: string;
  className?: string;
  container?: HTMLElement;
};

type DivIconMarkerProps = ReactProps & {
  markerProps: MarkerProps;
  container: ContainerProps;
  popup?: React.ReactNode;
  markerRef?: React.Ref<LeafletMarker> | undefined;
};

const DivIconMarker: FunctionComponent<DivIconMarkerProps> = (
  props: PropsWithChildren<DivIconMarkerProps>,
) => {
  const { markerKey, children, markerProps, container, popup, markerRef } = props;

  const { tagName, className } = container;
  const element = L.DomUtil.create(tagName, className);
  const divIcon = new DivIcon({ html: element });
  // eslint-disable-next-line
  const portal = createPortal(children, element);

  useEffect(() => () => {
    L.DomUtil.remove(element);
  });

  return (
    <>
      {portal}
      <Marker ref={markerRef} {...markerProps} key={markerKey} icon={divIcon}>
        {popup && <Popup>{popup}</Popup>}
      </Marker>
    </>
  );
};

export default DivIconMarker;
