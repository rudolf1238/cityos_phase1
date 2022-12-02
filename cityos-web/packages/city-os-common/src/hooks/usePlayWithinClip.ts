import { useCallback, useEffect, useRef } from 'react';

import { VideoClip } from '../libs/schema';
import { getClipCurrentTime } from '../libs/getVideoCurrentTime';
import getVideoDuration from '../libs/getVideoDuration';

const usePlayWithinClip = () => {
  const cancelGetDurationRef = useRef<() => void | undefined>();

  const playWithinClip = useCallback(
    async ({
      clip: { start, url },
      currentDateTime,
      videoNode,
      onCanPlay,
      onError,
    }: {
      clip: VideoClip;
      currentDateTime: number;
      videoNode: HTMLMediaElement;
      onCanPlay?: () => void;
      onError: () => void;
    }) => {
      if (cancelGetDurationRef.current) {
        cancelGetDurationRef.current();
      }
      const currTime = getClipCurrentTime(start, currentDateTime);
      const getDurationFunc = getVideoDuration(url);
      try {
        cancelGetDurationRef.current = getDurationFunc.cancel;
        const duration = await getDurationFunc.promise;
        if (duration <= currTime) {
          throw Error('Video current time is out of duration');
        }
        // eslint-disable-next-line no-param-reassign
        videoNode.currentTime = currTime;
        if (onCanPlay) {
          onCanPlay();
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'Cancel getting video duration') return;
        if (D_DEBUG) {
          console.error(err);
        }
        if (onError) {
          onError();
        }
      }
    },
    [],
  );

  useEffect(
    () => () => {
      if (cancelGetDurationRef.current) cancelGetDurationRef.current();
    },
    [],
  );

  return playWithinClip;
};

export default usePlayWithinClip;
