import { rawTimeZones } from '@vvo/tzdb';

import { minOfHour, secOfMin } from './constants';

const getTimezoneString = (
  /**
   * IANA timezone name
   *
   * e.g. America/Los_Angeles
   */
  timezoneName: string,
  rawOffsetSeconds?: number,
): string => {
  const offsetMinutes =
    rawOffsetSeconds !== undefined
      ? rawOffsetSeconds / secOfMin
      : rawTimeZones.find(({ name }) => name === timezoneName)?.rawOffsetInMinutes;

  return `${timezoneName}${
    offsetMinutes !== undefined
      ? ` (GMT${offsetMinutes >= 0 ? '+' : ''}${
          Math.round((offsetMinutes * 100) / minOfHour) / 100
        })`
      : ''
  }`;
};

export default getTimezoneString;
