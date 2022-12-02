import { LeafletMouseEventHandlerFn, icon, point } from 'leaflet';
import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import { Marker } from 'react-leaflet';

import { DeviceStatus, GPSPoint, IDevice } from 'city-os-common/libs/schema';
import useSubscribeDevicesStatus, {
  SubscribeDevice,
} from 'city-os-common/hooks/useSubscribeDevicesStatus';

import { FilterType, useMapContext } from '../../MapProvider';
import extractRelatedDevices from '../../../libs/extractRelatedDevices';

interface PoleMarkerProps {
  device: IDevice;
  location: GPSPoint;
  isSelected: boolean;
  onClick?: LeafletMouseEventHandlerFn;
}

const PoleMarker: VoidFunctionComponent<PoleMarkerProps> = ({
  device,
  location,
  onClick,
  isSelected,
}: PoleMarkerProps) => {
  const theme = useTheme();
  const { filterType } = useMapContext();
  const subscribeDeviceList = useMemo<SubscribeDevice[]>(() => extractRelatedDevices(device), [
    device,
  ]);

  const deviceStatusList = useSubscribeDevicesStatus(subscribeDeviceList);

  const status = useMemo(
    () =>
      deviceStatusList.data.some((deviceOnLamp) => deviceOnLamp.status === DeviceStatus.ERROR)
        ? DeviceStatus.ERROR
        : DeviceStatus.ACTIVE,
    [deviceStatusList],
  );

  const svg = useMemo(
    () => `<svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="-20 -20 80 80">
  ${
    isSelected
      ? `<circle fill="${theme.palette.gadget.offline}" fill-opacity="0.3" cx="20" cy="20" r="40"/>`
      : ''
  }
  <circle fill="${theme.palette.gadget.offline}" cx="20" cy="20" r="20"/>
  <path fill="#FFF" d="M12 9.17206C12 8.52475 12.5244 8 13.1712 8H20.4327C23.0632 8 25.1956 10.134 25.1956 12.7664V31.5974H27.2257V33.3165H20.5108V31.5974H22.8532V12.7664C22.8532 11.5507 21.9584 10.5442 20.7919 10.3706C20.5324 12.1603 18.6877 13.5477 16.4506 13.5477C14.0357 13.5477 12.0781 11.9311 12.0781 9.93682C12.0781 9.82963 12.0837 9.72908 12.0948 9.63479C12.0338 9.49283 12 9.3364 12 9.17206ZM13.0567 10.3386C13.2997 11.5151 14.5879 12.6101 16.4506 12.6101C18.3104 12.6101 19.5974 11.5185 19.8433 10.3441H13.1712C13.1326 10.3441 13.0944 10.3422 13.0567 10.3386Z"/>
  ${
    status === 'ERROR'
      ? '<circle fill="#F65860" cx="36.5" cy="7.5" r="5.5" stroke="#FFF" stroke-width="2"/>'
      : ''
  }
</svg>`,
    [isSelected, status, theme],
  );

  const markerIcon = useMemo(
    () =>
      icon({
        iconAnchor: point(40, 40),
        iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(svg)}`,
      }),
    [svg],
  );

  if (filterType === FilterType.ERROR && status !== DeviceStatus.ERROR) return null;

  return (
    <Marker
      icon={markerIcon}
      position={location}
      eventHandlers={{
        click: onClick,
      }}
    />
  );
};

export default memo(PoleMarker);
