import { LiveViewDevice } from './type';

export const getSequenceIndex = ({
  devices,
  currentIdx,
  type,
}: {
  devices: LiveViewDevice[];
  currentIdx: number;
  type: 'next' | 'previous';
}): number => {
  if (type === 'next') {
    return currentIdx === devices.length - 1 ? 0 : currentIdx + 1;
  }
  return currentIdx === 0 ? devices.length - 1 : currentIdx - 1;
};

const findUnfixedDeviceIndexes = ({
  devices,
  startIdx,
  endIdx: initialEndIdx,
  times: initialTimes = 1,
  type = 'next',
  excludingIds,
}: {
  devices: LiveViewDevice[];
  startIdx: number;
  endIdx?: number;
  type?: 'next' | 'previous';
  times?: number;
  excludingIds?: string[];
}): number[] => {
  const result: number[] = [];
  const endIdx =
    initialEndIdx !== undefined
      ? initialEndIdx
      : getSequenceIndex({
          devices,
          currentIdx: startIdx,
          type: type === 'next' ? 'previous' : 'next',
        });
  let times = 0;

  if (!devices[endIdx] || initialTimes <= 0) return result;

  let nextIdx = startIdx;
  for (;;) {
    if (!devices[nextIdx]) break;
    if (
      devices[nextIdx].fixedIndex === null &&
      !excludingIds?.includes(devices[nextIdx].deviceId)
    ) {
      times += 1;
      result.push(nextIdx);
      if (times === initialTimes) break;
    }

    if (nextIdx === endIdx) break;
    if (type === 'next') {
      nextIdx = nextIdx === devices.length - 1 ? 0 : nextIdx + 1;
    } else {
      nextIdx = nextIdx === 0 ? devices.length - 1 : nextIdx - 1;
    }
  }
  return result;
};

export default findUnfixedDeviceIndexes;
