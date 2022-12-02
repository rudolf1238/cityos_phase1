import { LatLng } from 'leaflet';

export default function isMarkerInsidePolygon(marker: LatLng, polyPoints: LatLng[]): boolean {
  const x = marker.lat;
  const y = marker.lng;

  let inside = false;
  for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i, i += 1) {
    const xi = polyPoints[i].lat;
    const yi = polyPoints[i].lng;
    const xj = polyPoints[j].lat;
    const yj = polyPoints[j].lng;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
