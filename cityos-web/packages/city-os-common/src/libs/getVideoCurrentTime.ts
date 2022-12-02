import { msOfSec } from './constants';

/**
 * Return currentTime of video element in seconds
 *
 * @param clipStartTime Date number in milliseconds
 * @param currentDateTime Date number in milliseconds
 */
function getClipCurrentTime(clipStartTime: number, currentDateTime: number): number {
  return (currentDateTime - clipStartTime) / msOfSec;
}

/**
 * Return current Date number of video clip in milliseconds
 *
 * @param clipStartTime Date number in milliseconds
 * @param videoCurrentTime currentTime of video element in seconds
 */
function getClipCurrentDateTime(clipStartTime: number, videoCurrentTime: number): number {
  return clipStartTime + videoCurrentTime * msOfSec;
}

export { getClipCurrentTime, getClipCurrentDateTime };
