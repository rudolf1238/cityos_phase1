import { useCallback } from 'react';

import { ErrorType } from 'city-os-common/modules/videoPlayer/type';

import { VideoStatusRecord } from '../libs/type';
import { useSurveillanceContext } from '../modules/SurveillanceProvider';

const useUpdateAllVideosStartTime = () => {
  const { setVideoStatusRecord } = useSurveillanceContext();

  const updateAllVideosStartTime = useCallback(
    (newTime: number) => {
      setVideoStatusRecord((prevRecord) =>
        Object.entries(prevRecord).reduce<VideoStatusRecord>(
          (prev, [deviceId, videoStatus]) => ({
            ...prev,
            [deviceId]: {
              ...videoStatus,
              changingStartTime:
                videoStatus.errorType === ErrorType.NO_CAMERA_ID ? undefined : newTime,
              nextClipStartTime:
                videoStatus.nextClipStartTime === null || videoStatus.nextClipStartTime < newTime
                  ? null
                  : videoStatus.nextClipStartTime,
            },
          }),
          prevRecord,
        ),
      );
    },
    [setVideoStatusRecord],
  );

  return updateAllVideosStartTime;
};

export default useUpdateAllVideosStartTime;
