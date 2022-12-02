import { fade, makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  ReactNode,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import subHours from 'date-fns/subHours';

import IconButton from '@material-ui/core/IconButton';

import { ErrorType } from 'city-os-common/modules/videoPlayer/type';
import {
  GET_VIDEO_HISTORY,
  GetVideoHistoryPayload,
  GetVideoHistoryResponse,
} from 'city-os-common/api/getVideoHistory';
import { IDevice, VideoClip } from 'city-os-common/libs/schema';
import {
  getClipCurrentDateTime,
  getClipCurrentTime,
} from 'city-os-common/libs/getVideoCurrentTime';
import { msOfSec } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import findClosestClipIndex from 'city-os-common/libs/findClosestClipIndex';
import isGqlError from 'city-os-common/libs/isGqlError';
import usePlayWithinClip from 'city-os-common/hooks/usePlayWithinClip';
import useTimeout from 'city-os-common/hooks/useTimeout';

import FullPageIcon from 'city-os-common/assets/icon/full-page.svg';
import VideoPlayerBase from 'city-os-common/modules/videoPlayer/VideoPlayerBase';

import { useSurveillanceContext } from '../SurveillanceProvider';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';

const useStyles = makeStyles((theme) => ({
  iconButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  fullPageButton: {
    borderWidth: 0,
    backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    width: 30,
    height: 30,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    },
  },
}));

interface VideoPlayerProps {
  device: Pick<IDevice, 'deviceId'>;
  from: Date;
  to: Date;
  playbackTime: number;
  header?: ReactNode | ((classes: { showOnHover: string }) => ReactNode);
  autoPlay?: boolean;
  enableUpdateTime?: boolean;
  className?: string;
  onToggleScreen?: (isFullPage: boolean) => void;
}

const VideoPlayer: VoidFunctionComponent<VideoPlayerProps> = ({
  device: { deviceId },
  from,
  to,
  playbackTime,
  header,
  autoPlay = false,
  enableUpdateTime = false,
  className,
  onToggleScreen,
}: VideoPlayerProps) => {
  const classes = useStyles();

  const {
    isPlaybackPaused: isPaused,
    videoStatusRecord,
    pageDeviceIds,
    setPlaybackTime,
    setVideoStatusRecord,
  } = useSurveillanceContext();
  const setChangeClipTimer = useTimeout();
  const { dispatch } = useStore();
  const { t } = useSurveillanceTranslation('common');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [errorType, setErrorType] = useState<ErrorType | undefined>(undefined);
  const [isWaiting, setIsWaiting] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number>(-1);

  const videoNode = videoRef.current;

  const playWithinClip = usePlayWithinClip();

  const handleError = useCallback((type: ErrorType) => {
    setIsWaiting(false);
    setErrorType(type);
  }, []);

  const { data: videoHistory, loading } = useQuery<GetVideoHistoryResponse, GetVideoHistoryPayload>(
    GET_VIDEO_HISTORY,
    {
      variables: {
        deviceId,
        from: subHours(from, 1), // move up an hour to prevent from some camera return clips not covering the playback range
        to,
      },
      onCompleted: ({ getVideoHistory: { clips } }) => {
        if (clips.length === 0) {
          handleError(ErrorType.UNKNOWN_ERROR);
        }
      },
      onError: (err) => {
        if (isGqlError(err, ErrorCode.CAMERA_ID_NOT_EXIST)) {
          handleError(ErrorType.NO_CAMERA_ID);
        } else {
          handleError(ErrorType.UNKNOWN_ERROR);
        }
      },
    },
  );

  const clipList = useMemo<VideoClip[]>(() => {
    const clips = videoHistory?.getVideoHistory.clips || [];
    const newClips = [...clips];
    newClips.sort((a, b) => a.start - b.start);
    return newClips;
  }, [videoHistory?.getVideoHistory.clips]);

  const firstClipIdx = useMemo(
    () => findClosestClipIndex(clipList, from.getTime()),
    [clipList, from],
  );

  const manualAppointedTime = videoStatusRecord?.[deviceId]?.changingStartTime;

  const updatePlayingIdx = useCallback(
    (newIdx: number) => {
      setPlayingIdx(newIdx);
      const nextClipStartTime = newIdx < 0 ? null : clipList[newIdx + 1]?.start ?? null;
      setVideoStatusRecord((prevRecord) => {
        const deviceRecord = prevRecord[deviceId];
        return deviceRecord
          ? {
              ...prevRecord,
              [deviceId]: {
                ...deviceRecord,
                nextClipStartTime:
                  deviceRecord.changingStartTime === undefined ||
                  nextClipStartTime === null ||
                  nextClipStartTime > deviceRecord.changingStartTime
                    ? nextClipStartTime
                    : null,
              },
            }
          : prevRecord;
      });
    },
    [clipList, deviceId, setVideoStatusRecord],
  );

  const updateAppointedTime = useCallback(
    (newStartTime?: number) => {
      let nextClipStartTime: number | null | undefined;
      if (newStartTime !== undefined) {
        const clipIdx = findClosestClipIndex(clipList, newStartTime);
        nextClipStartTime = clipIdx < 0 ? null : clipList[clipIdx + 1]?.start ?? null;
      }
      setVideoStatusRecord((prevRecord) => {
        const deviceRecord = prevRecord[deviceId];
        return deviceRecord
          ? {
              ...prevRecord,
              [deviceId]: {
                ...deviceRecord,
                changingStartTime:
                  deviceRecord.errorType === ErrorType.NO_CAMERA_ID ? undefined : newStartTime,
                nextClipStartTime:
                  nextClipStartTime !== undefined
                    ? nextClipStartTime
                    : deviceRecord.nextClipStartTime,
              },
            }
          : prevRecord;
      });
    },
    [clipList, deviceId, setVideoStatusRecord],
  );

  const validatePlayingIdx = useCallback(
    (clipIdx: number) => {
      if (clipIdx < 0 || clipIdx >= clipList.length) {
        updatePlayingIdx(-1);
        handleError(ErrorType.UNKNOWN_ERROR);
        return false;
      }
      if (clipIdx !== playingIdx) {
        updatePlayingIdx(clipIdx);
        return false;
      }
      return true;
    },
    [clipList.length, handleError, playingIdx, updatePlayingIdx],
  );

  const keepIdleUntilNextStart = useCallback(
    (clipIdx: number, idleStartTime: number) => {
      const nextClipStartTime = clipList[clipIdx + 1]?.start;
      if (nextClipStartTime === undefined || nextClipStartTime >= to.getTime()) {
        handleError(ErrorType.UNKNOWN_ERROR);
        return;
      }

      const waitingTime = nextClipStartTime - idleStartTime;
      if (waitingTime < msOfSec) {
        updateAppointedTime(nextClipStartTime);
        return;
      }

      // Waiting until playbackTime matches nextClipStartTime if this VideoPlayer is not the leader, or it is leader but others can play
      if (
        !enableUpdateTime ||
        Object.entries(videoStatusRecord).some(
          ([videoId, { canPlay }]) => videoId !== deviceId && canPlay,
        )
      ) {
        handleError(ErrorType.UNKNOWN_ERROR);
        const timer = window.setTimeout(() => {
          updateAppointedTime(nextClipStartTime);
        }, waitingTime);
        setChangeClipTimer(timer);
        return;
      }

      // If neither Leader nor others can play, show warning and jump to next clip of Leader instantly
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'warning',
          message: t(
            '(There is no video available during this period_) Jump to the next accessible part_',
          ),
        },
      });
      updateAppointedTime(nextClipStartTime);
    },
    [
      clipList,
      deviceId,
      dispatch,
      enableUpdateTime,
      handleError,
      setChangeClipTimer,
      t,
      to,
      updateAppointedTime,
      videoStatusRecord,
    ],
  );

  const onLoadedMetadata = useCallback(async () => {
    if (!videoNode || clipList.length === 0 || playingIdx < 0) return;
    // update video currentTime after video has current data as 'Leader VideoPlayer' change playingIdx
    const loadedStart = manualAppointedTime ?? playbackTime;
    const clipIdx = findClosestClipIndex(clipList, loadedStart);
    if (clipIdx !== playingIdx) return;
    await playWithinClip({
      clip: clipList[clipIdx],
      currentDateTime: loadedStart,
      videoNode,
      onCanPlay: () => {
        setErrorType(undefined);
      },
      onError: () => {
        handleError(ErrorType.UNKNOWN_ERROR);
        keepIdleUntilNextStart(clipIdx, playbackTime);
      },
    });
    if (!enableUpdateTime) {
      updateAppointedTime();
    }
  }, [
    clipList,
    enableUpdateTime,
    handleError,
    keepIdleUntilNextStart,
    manualAppointedTime,
    playWithinClip,
    playbackTime,
    playingIdx,
    updateAppointedTime,
    videoNode,
  ]);

  const onWaiting = useCallback(() => {
    setIsWaiting(true);
    setErrorType(undefined);
  }, []);

  const onPlaying = useCallback(async () => {
    if (!videoNode || clipList.length === 0) return;
    setIsWaiting(false);
    // Synchronize with currentTime of 'Leader VideoPlayer'
    if (!enableUpdateTime) {
      const clipIdx = findClosestClipIndex(clipList, playbackTime);
      if (!validatePlayingIdx(clipIdx)) return;
      const newCurrTime = getClipCurrentTime(clipList[clipIdx].start, playbackTime);
      if (Math.abs(newCurrTime - videoNode.currentTime) < 1) return;
      await playWithinClip({
        clip: clipList[clipIdx],
        currentDateTime: playbackTime,
        videoNode,
        onCanPlay: () => {
          setErrorType(undefined);
        },
        onError: () => {
          handleError(ErrorType.UNKNOWN_ERROR);
          keepIdleUntilNextStart(clipIdx, playbackTime);
        },
      });
    }
  }, [
    clipList,
    enableUpdateTime,
    handleError,
    keepIdleUntilNextStart,
    playWithinClip,
    playbackTime,
    validatePlayingIdx,
    videoNode,
  ]);

  const onPlay = useCallback(async () => {
    if (!videoNode || playingIdx < 0) return;
    try {
      await videoNode.play();
    } catch (err) {
      if (D_DEBUG) {
        console.log(deviceId, err);
      }
    }
  }, [deviceId, playingIdx, videoNode]);

  const onTimeUpdate = useCallback(() => {
    // Only 'Leader VideoPlayer' can update playbackTime
    if (
      !enableUpdateTime ||
      !videoNode ||
      videoNode.readyState < videoNode.HAVE_CURRENT_DATA ||
      clipList.length === 0 ||
      clipList[playingIdx] === undefined ||
      errorType
    )
      return;
    const currTime = getClipCurrentDateTime(clipList[playingIdx].start, videoNode.currentTime);
    if (
      manualAppointedTime !== undefined &&
      Math.round(currTime / msOfSec) !== Math.round(manualAppointedTime / msOfSec)
    )
      return;
    setPlaybackTime(currTime);
    updateAppointedTime();
  }, [
    clipList,
    enableUpdateTime,
    errorType,
    manualAppointedTime,
    playingIdx,
    setPlaybackTime,
    updateAppointedTime,
    videoNode,
  ]);

  const onEnded = useCallback(() => {
    if (!videoNode) return;
    const clipIdx = findClosestClipIndex(clipList, playbackTime);
    if (!validatePlayingIdx(clipIdx)) return;
    keepIdleUntilNextStart(clipIdx, playbackTime);
  }, [clipList, keepIdleUntilNextStart, playbackTime, validatePlayingIdx, videoNode]);

  useEffect(() => {
    if (!videoNode || isPaused === videoNode.paused) return;
    if (isPaused) {
      videoNode.pause();
      return;
    }
    if (errorType) return;
    if (videoNode.readyState < videoNode.HAVE_CURRENT_DATA) {
      setIsWaiting(true);
      return;
    }
    if (isWaiting) return;
    void onPlay();
  }, [deviceId, errorType, isPaused, isWaiting, onPlay, onWaiting, videoNode]);

  useEffect(() => {
    if (manualAppointedTime === undefined || !isPaused) return;
    setChangeClipTimer(undefined);
  }, [setChangeClipTimer, manualAppointedTime, isPaused]);

  // Find closest clip & update currentTime if changingStartTime in videoStatusRecord is appointed
  useEffect(() => {
    if (!videoNode || !manualAppointedTime || loading) return;
    if (clipList.length === 0) {
      updateAppointedTime();
      return;
    }
    const updateVideoCurr = async () => {
      const clipIdx = findClosestClipIndex(clipList, manualAppointedTime);
      if (!validatePlayingIdx(clipIdx)) return;
      // Update video currentTime directly without 'onLoadedmetadata' if playingIdx is not changed

      await playWithinClip({
        clip: clipList[clipIdx],
        currentDateTime: manualAppointedTime,
        videoNode,
        onCanPlay: () => {
          setErrorType(undefined);
        },
        onError: () => {
          if (D_DEBUG) {
            console.log('Appointed time is out of clip duration, see the details:', {
              deviceId,
              clipIdx,
              clips: clipList.map(({ url }) => ({ file: url.slice(url.length - 10), url })),
            });
          }
          handleError(ErrorType.UNKNOWN_ERROR);
          keepIdleUntilNextStart(clipIdx, playbackTime);
        },
      });

      if (!enableUpdateTime) {
        updateAppointedTime();
      }
    };
    void updateVideoCurr();
  }, [
    clipList,
    deviceId,
    enableUpdateTime,
    handleError,
    keepIdleUntilNextStart,
    loading,
    manualAppointedTime,
    playWithinClip,
    playbackTime,
    to,
    updateAppointedTime,
    validatePlayingIdx,
    videoNode,
  ]);

  useEffect(() => {
    if (!pageDeviceIds.includes(deviceId)) return;
    const canPlay = playingIdx >= 0 && playingIdx < clipList.length && !errorType;
    setVideoStatusRecord((prevRecord) => ({
      ...prevRecord,
      [deviceId]: {
        ...prevRecord[deviceId],
        canPlay,
        errorType,
      },
    }));
  }, [clipList, deviceId, errorType, playingIdx, setVideoStatusRecord, pageDeviceIds]);

  useEffect(() => {
    if (!videoNode || firstClipIdx < 0) return;
    updatePlayingIdx(firstClipIdx);
  }, [firstClipIdx, updatePlayingIdx, videoNode]);

  return (
    <VideoPlayerBase
      ref={videoRef}
      isWaiting={loading || isWaiting}
      roundedCorner
      header={header}
      errorType={errorType}
      autoPlay={autoPlay}
      src={clipList[playingIdx]?.url}
      classes={{
        root: className,
      }}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onLoadedMetadata={onLoadedMetadata}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onCanPlay={onPlaying}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPlaying={onPlaying}
      onWaiting={onWaiting}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      onError={onEnded}
    >
      {onToggleScreen && (
        <div className={classes.iconButtons}>
          {!errorType && (
            <IconButton
              size="small"
              color="primary"
              className={classes.fullPageButton}
              onClick={() => {
                onToggleScreen(true);
              }}
            >
              <FullPageIcon />
            </IconButton>
          )}
        </div>
      )}
    </VideoPlayerBase>
  );
};

export default memo(VideoPlayer);
