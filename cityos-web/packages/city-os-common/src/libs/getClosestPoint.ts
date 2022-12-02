import { Point } from './schema';

const getClosestPoint = ({
  points,
  currentTime,
}: {
  points: Point[];
  currentTime: number;
}): Point | undefined => {
  if (points.length === 0) return undefined;
  if (currentTime <= points[0].time) return points[0];
  if (currentTime >= points[points.length - 1].time) return points[points.length - 1];

  const middleIndex = Math.ceil(points.length / 2) - 1;
  const middlePoint = points[middleIndex];

  if (middlePoint.time === currentTime) {
    return middlePoint;
  }

  if (middlePoint.time > currentTime) {
    return getClosestPoint({
      points: points.slice(0, middleIndex + 1),
      currentTime,
    });
  }

  const nextPoint = points[middleIndex + 1];
  if (nextPoint.time >= currentTime) {
    return currentTime - middlePoint.time <= nextPoint.time - currentTime ? middlePoint : nextPoint;
  }
  return getClosestPoint({
    points: points.slice(middleIndex, points.length),
    currentTime,
  });
};

export default getClosestPoint;
