import { isGPSRect } from './validators';

type LatLngTuple = [number, number];
type LatLngBoundsLiteral = LatLngTuple[];

const getDefaultBounds = (): LatLngBoundsLiteral | undefined => {
  try {
    const defaultBounds: unknown = JSON.parse(process.env.NEXT_PUBLIC_DEFAULT_BOUNDS || '');
    if (!isGPSRect(defaultBounds) || !defaultBounds.ne || !defaultBounds.sw)
      throw new Error('DEFAULT_BOUNDS format is not correct');
    const { ne, sw } = defaultBounds;
    return [
      [ne.lat, ne.lng],
      [sw.lat, sw.lng],
    ];
  } catch (error) {
    return undefined;
  }
};

export const defaultBounds = getDefaultBounds();

export const gadgetLimit = parseInt(process.env.NEXT_PUBLIC_GADGET_LIMIT || '20', 10);

export const autoPlayInterval = parseInt(process.env.NEXT_PUBLIC_AUTOPLAY_INTERVAL || '5', 10);

export const downloadDurationLimit = parseInt(
  process.env.NEXT_PUBLIC_VIDEO_DOWNLOAD_LIMIT || '120',
  10,
);
