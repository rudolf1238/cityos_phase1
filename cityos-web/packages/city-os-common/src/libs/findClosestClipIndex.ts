import { VideoClip } from './schema';

export default function findClosestClipIndex(
  clipList: VideoClip[],
  playbackTime: number | null,
): number {
  if (clipList.length === 0) {
    if (D_DEBUG) {
      console.log('clip list is empty');
    }
    return -1;
  }
  if (playbackTime === null) {
    if (D_DEBUG) {
      console.log('playbackTime is null');
    }
    return 0;
  }
  const firstClipStart = clipList[0].start;
  if (firstClipStart && playbackTime < firstClipStart) {
    if (D_DEBUG) {
      console.log('playbackTime is earlier than first clip');
    }
    return -1;
  }
  if (clipList.length === 1) return 0;

  for (let i = clipList.length - 1; i >= 0; i -= 1) {
    if (clipList[i]?.start <= playbackTime) {
      return i;
    }
  }
  if (D_DEBUG) {
    console.log('closest clip is not found');
  }
  return -1;
}
