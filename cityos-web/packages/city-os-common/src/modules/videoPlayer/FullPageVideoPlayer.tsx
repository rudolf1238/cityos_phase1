import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
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
import UAParser from 'ua-parser-js';
import clsx from 'clsx';
import subHours from 'date-fns/subHours';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import PauseIcon from '@material-ui/icons/PauseRounded';
import PlayIcon from '@material-ui/icons/PlayArrowRounded';
import Typography from '@material-ui/core/Typography';

import {
  CAMERA_EVENT_HISTORY,
  CameraEventHistoryPayload,
  CameraEventHistoryResponse,
} from '../../api/cameraEventHistory';
import { CutRange, IDevice, VideoClip } from '../../libs/schema';
import { ErrorType } from './type';
import {
  GET_VIDEO_HISTORY,
  GetVideoHistoryPayload,
  GetVideoHistoryResponse,
} from '../../api/getVideoHistory';
import { downloadDurationLimit } from '../../libs/parsedENV';
import { getClipCurrentDateTime } from '../../libs/getVideoCurrentTime';
import { msOfMinute, msOfSec } from '../../libs/constants';
import { useStore } from '../../reducers';
import ErrorCode from '../../libs/errorCode';
import ReducerActionType from '../../reducers/actions';
import downloadFile from '../../libs/downloadFile';
import downloadVideos, { DownloadErrorCode } from '../../libs/downloadVideos';
import findClosestClipIndex from '../../libs/findClosestClipIndex';
import formatDate from '../../libs/formatDate';
import getVideoDuration from '../../libs/getVideoDuration';
import isGqlError from '../../libs/isGqlError';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import usePlayWithinClip from '../../hooks/usePlayWithinClip';

import BaseDialog from '../BaseDialog';
import DownloadIcon from '../DownloadIcon';
import FullPageViewer from '../FullPageViewer';
import PlaybackVideoToolbar from '../PlaybackVideoToolbar';
import PlayerController from '../PlayerController';
import SnapshotIcon from '../../assets/icon/snapshot.svg';
import VideoPlayerBase from './VideoPlayerBase';

const detectedDevice = new UAParser().getDevice();
const isMobile = detectedDevice.type === 'mobile' || detectedDevice.type === 'tablet';

const videoRatio = 16 / 9;

const useStyles = makeStyles((theme) => ({
  videoPlayerWrapper: {
    margin: 'auto',
    // height of controlPanel is 244px
    maxWidth: `min(calc((var(--vh) * 100 - 244px) * ${videoRatio}), 100vw)`,
  },

  videoPlayer: {
    backgroundColor: theme.palette.background.light,
  },

  header: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: theme.zIndex.mobileStepper,
    padding: theme.spacing(1.5, 8, 1.5, 1.5),
  },

  controlPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
  },

  downloadBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1),
  },

  controlButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  cutRangeButtons: {
    gridColumn: '2 / 3',
    justifyContent: 'center',
  },

  playerController: {
    gridColumn: '3 / 4',
  },

  downloadButton: {
    padding: theme.spacing(1, 4),
  },

  fileButton: {
    padding: 0,
    minWidth: 42,
    height: 42,

    '&:disabled': {
      borderWidth: 2,
    },
  },

  playButton: {
    padding: 0,
    minWidth: 72,
    height: 42,
  },

  dialog: {
    maxWidth: 600,
    textAlign: 'center',
  },

  dialogButton: {
    marginTop: theme.spacing(1.5),
  },

  dialogButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
}));

const getWithinClips = async ({ clips, cutRange }: { clips: VideoClip[]; cutRange: CutRange }) => {
  if (clips[clips.length - 1].start <= cutRange[0]) {
    try {
      const lastClipDuration = await getVideoDuration(clips[clips.length - 1].url).promise;
      const clipsEnd = clips[clips.length - 1].start + lastClipDuration * msOfSec;
      return clipsEnd < cutRange[0] ? [] : [clips[clips.length - 1]];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return clips.filter(
    ({ start }, i, arr) =>
      (cutRange[0] <= start && start <= cutRange[1]) ||
      (start < cutRange[0] && cutRange[0] <= arr[i + 1]?.start),
  );
};

interface FullPageVideoPlayerProps {
  device: Pick<IDevice, 'deviceId' | 'name'>;
  from: Date;
  to: Date;
  thumbnailTime: number;
  header?: ReactNode | ((classes: { showOnHover: string }) => ReactNode);
  enableDownload?: boolean;
  onToggleScreen: (isFullPage: boolean) => void;
}

const FullPageVideoPlayer: VoidFunctionComponent<FullPageVideoPlayerProps> = ({
  device: { deviceId, name },
  from,
  to,
  thumbnailTime,
  header,
  enableDownload = false,
  onToggleScreen,
}: FullPageVideoPlayerProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common', 'variables']);
  const {
    download,
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();

  const isMountedRef = useIsMountedRef();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);
  const [isWaiting, setIsWaiting] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [cutRange, setCutRange] = useState<CutRange>();
  const [errorType, setErrorType] = useState<ErrorType>();
  const [draggingTime, setDraggingTime] = useState<number>();
  const [manualAppointedTime, setManualAppointedTime] = useState<number>();
  const [currTime, setCurrTime] = useState<number>(thumbnailTime);
  const [playingIdx, setPlayingIdx] = useState<number>(-1);
  const [openMultiDownloadWarning, setOpenMultiDownloadWarning] = useState(false);
  const [openMobileDownloadWarning, setOpenMobileDownloadWarning] = useState(false);

  const playWithinClip = usePlayWithinClip();

  const handleError = useCallback((type: ErrorType) => {
    setIsWaiting(false);
    setErrorType(type);
  }, []);

  const updateAppointedTime = useCallback((newTime?: number) => {
    setManualAppointedTime(newTime);
    setIsWaiting(!!newTime);
  }, []);

  const { data: eventData, fetchMore } = useQuery<
    CameraEventHistoryResponse,
    CameraEventHistoryPayload
  >(CAMERA_EVENT_HISTORY, {
    skip: !divisionGroup?.id,
    fetchPolicy: 'cache-and-network',
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        from: from.getTime(),
        to: to.getTime(),
        deviceIds: [deviceId],
      },
      size: 100,
    },
    onCompleted: ({
      cameraEventHistory: {
        pageInfo: { hasNextPage, endCursor },
      },
    }) => {
      if (hasNextPage) {
        void fetchMore({
          variables: { after: endCursor },
          updateQuery: (previousQueryResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previousQueryResult;
            if (!previousQueryResult.cameraEventHistory) return fetchMoreResult;
            const newResult: CameraEventHistoryResponse = {
              cameraEventHistory: {
                ...fetchMoreResult.cameraEventHistory,
                edges: [
                  ...previousQueryResult.cameraEventHistory.edges,
                  ...fetchMoreResult.cameraEventHistory.edges,
                ],
              },
            };
            return newResult;
          },
        });
      }
    },
  });

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
          setErrorType(ErrorType.UNKNOWN_ERROR);
          return;
        }
        updateAppointedTime(thumbnailTime);
      },
      onError: (error) => {
        if (isGqlError(error, ErrorCode.CAMERA_ID_NOT_EXIST)) {
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

  const showWarning = useCallback(() => {
    dispatch({
      type: ReducerActionType.ShowSnackbar,
      payload: {
        severity: 'warning',
        message: t(
          'common:(There is no video available during this period_) Jump to the next accessible part_',
        ),
      },
    });
  }, [dispatch, t]);

  const validatePlayingIdx = useCallback(
    (clipIdx: number) => {
      if (clipIdx < 0) {
        setPlayingIdx(-1);
        handleError(ErrorType.UNKNOWN_ERROR);
        return false;
      }
      if (clipIdx !== playingIdx) {
        setPlayingIdx(clipIdx);
        return false;
      }
      return true;
    },
    [handleError, playingIdx],
  );

  const onWaiting = useCallback(() => {
    setIsWaiting(true);
    setErrorType(undefined);
  }, []);

  const onPlaying = useCallback(() => {
    setIsWaiting(false);
    setErrorType(undefined);
  }, []);

  const onPlay = useCallback(async () => {
    const videoNode = videoRef.current;
    if (!videoNode || clipList.length === 0 || playingIdx < 0) return;
    try {
      await videoNode.play();
      if (isMountedRef.current) {
        setAutoPlay(true);
      }
    } catch (err) {
      if (D_DEBUG) {
        console.log(err);
      }
    }
  }, [clipList.length, isMountedRef, playingIdx]);

  const togglePause = useCallback(() => {
    if (isPaused && currTime >= to.getTime()) {
      setCurrTime(from.getTime());
      updateAppointedTime(from.getTime());
    }
    setIsPaused((prev) => !prev);
  }, [currTime, from, isPaused, to, updateAppointedTime]);

  const onSkip = useCallback(
    (skipTime: number) => {
      const videoNode = videoRef.current;
      if (!videoNode || clipList.length === 0) return;
      const newCurrTime = currTime + skipTime * msOfSec;
      updateAppointedTime(newCurrTime);
      setCurrTime(newCurrTime);
    },
    [clipList, currTime, updateAppointedTime],
  );

  const onEnded = useCallback(() => {
    const videoNode = videoRef.current;
    if (!videoNode || playingIdx < 0) return;
    const nextClipStartTime = clipList[playingIdx + 1]?.start;
    const newStartTime =
      nextClipStartTime !== undefined && nextClipStartTime < to.getTime()
        ? nextClipStartTime
        : undefined;
    if (newStartTime === undefined) {
      updateAppointedTime(undefined);
      handleError(ErrorType.UNKNOWN_ERROR);
      return;
    }
    updateAppointedTime(newStartTime);
    if (Math.abs(newStartTime - currTime) > msOfSec) {
      showWarning();
    }
  }, [playingIdx, clipList, to, updateAppointedTime, currTime, handleError, showWarning]);

  const onLoadedMetadata = useCallback(async () => {
    const videoNode = videoRef.current;
    if (!videoNode || clipList.length === 0) return;
    const loadedStart = manualAppointedTime ?? currTime;
    const clipIdx = findClosestClipIndex(clipList, loadedStart);
    if (clipIdx !== playingIdx) return;
    await playWithinClip({
      clip: clipList[clipIdx],
      currentDateTime: loadedStart,
      videoNode,
      onCanPlay: () => {
        setCurrTime(loadedStart);
      },
      onError: () => {
        if (D_DEBUG) {
          console.log('Appointed time is out of clip duration, see the details:', {
            deviceId,
            clipIdx,
            clips: clipList.map(({ url }) => ({ file: url.slice(url.length - 10), url })),
          });
        }
        onEnded();
      },
    });
  }, [clipList, manualAppointedTime, currTime, playingIdx, playWithinClip, deviceId, onEnded]);

  const onCloseMobileDownloadWarning = useCallback(() => {
    setOpenMobileDownloadWarning(false);
  }, []);

  const onStartClipMode = useCallback(() => {
    onCloseMobileDownloadWarning();
    setCutRange([
      from.getTime(),
      Math.min(to.getTime(), from.getTime() + downloadDurationLimit * msOfMinute),
    ]);
  }, [from, to, onCloseMobileDownloadWarning]);

  const onOpenClipMode = useCallback(() => {
    if (Object.keys(download).length) {
      setOpenMultiDownloadWarning(true);
    } else if (isMobile) {
      setOpenMobileDownloadWarning(true);
    } else {
      onStartClipMode();
    }
  }, [download, onStartClipMode]);

  const onCloseClipMode = useCallback(() => {
    setCutRange(undefined);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const videoNode = videoRef.current;
    if (
      !videoNode ||
      clipList[playingIdx] === undefined ||
      errorType ||
      videoNode.readyState < videoNode.HAVE_CURRENT_DATA
    )
      return;
    const newCurrTime = getClipCurrentDateTime(clipList[playingIdx].start, videoNode.currentTime);
    if (
      manualAppointedTime !== undefined &&
      Math.round(manualAppointedTime / msOfSec) !== Math.round(newCurrTime / msOfSec)
    )
      return;
    updateAppointedTime(undefined);
    setCurrTime(newCurrTime);
  }, [clipList, errorType, manualAppointedTime, playingIdx, updateAppointedTime]);

  const onSliderTimeChange = useCallback((newTime: number) => {
    setDraggingTime(newTime);
  }, []);

  const onPlaybackTimeChange = useCallback(
    (newTime: number) => {
      updateAppointedTime(newTime);
      setDraggingTime(undefined);
      setCurrTime(newTime);
    },
    [updateAppointedTime],
  );

  const onCloseMultiDownloadWarning = useCallback(() => {
    setOpenMultiDownloadWarning(false);
  }, []);

  const onDownload = useCallback(async () => {
    onCloseMobileDownloadWarning();
    if (!clipList.length || !cutRange) return;
    const clips = await getWithinClips({
      clips: clipList,
      cutRange,
    });
    onToggleScreen(false);
    if (clips.length === 0) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'warning',
          message: t(
            'common:(There is no video available during this period_) Please change the download range and try again_',
          ),
        },
      });
    } else {
      const downloadClips = clips.map(({ url, start }) => ({
        url,
        name: `${deviceId}-${formatDate(start, 'yyyyMMdd_HHmmss')}.mp4`,
      }));
      const downloadId = uuidv4();
      const controller = new AbortController();
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'info',
          message: t(
            'common:Preparing to download_ Do not close the browser_ ** Due to the download size limitation of browser, it is not guaranteed to fully download the selected range_',
          ),
        },
      });
      dispatch({
        type: ReducerActionType.StartDownload,
        payload: {
          id: downloadId,
          cancel: () => {
            controller.abort();
          },
          title: name,
          subtitle: `${formatDate(cutRange[0], t('variables:dateFormat.common.download'))} -
        ${formatDate(cutRange[1], t('variables:dateFormat.common.download'))}`,
        },
      });
      const result = await downloadVideos({
        zipName: `${formatDate(cutRange[0], 'yyyyMMdd_HHmmss')}-${formatDate(
          cutRange[1],
          'yyyyMMdd_HHmmss',
        )}.zip`,
        videos: downloadClips,
        signal: controller.signal,
        onProgress: (progress) => {
          dispatch({
            type: ReducerActionType.UpdateDownload,
            payload: {
              id: downloadId,
              progress,
            },
          });
        },
      });
      if (result.status === 'failed' && !controller.signal.aborted) {
        if (result.reason === DownloadErrorCode.PARTIAL_FAILED) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t(
                'common:Some video files can not be downloaded, please check them out and try again_',
              ),
            },
          });
        } else if (result.reason === DownloadErrorCode.ALL_FAILED) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('common:Download failed_ Please try again_'),
            },
          });
        }
      }
      dispatch({
        type: ReducerActionType.EndDownload,
        payload: {
          id: downloadId,
        },
      });
    }
  }, [
    name,
    deviceId,
    clipList,
    cutRange,
    onCloseMobileDownloadWarning,
    onToggleScreen,
    dispatch,
    t,
  ]);

  const onSnapshot = useCallback(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoNode.offsetWidth;
    canvas.height = videoNode.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoNode, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadFile(blob, `${deviceId}-${formatDate(currTime, 'yyyyMMdd_HHmmss')}.png`);
    }, 'image/png');
  }, [currTime, deviceId]);

  const onFullPageClose = useCallback(() => {
    onToggleScreen(false);
  }, [onToggleScreen]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode || isPaused === videoNode.paused) return;
    if (isPaused) {
      videoNode.pause();
      setAutoPlay(false);
      return;
    }
    if (errorType) return;
    if (videoNode.readyState < videoNode.HAVE_CURRENT_DATA) {
      setIsWaiting(true);
      return;
    }
    if (isWaiting) return;
    void onPlay();
  }, [errorType, isPaused, isWaiting, onPlay]);

  // Pause if the video is ended
  useEffect(() => {
    if (currTime < to.getTime() || isPaused) return;
    togglePause();
  }, [currTime, isPaused, to, togglePause]);

  // Find closest clip & update video currentTime if appointed by external operation
  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode || !manualAppointedTime || clipList.length === 0) return;
    const clipIdx = findClosestClipIndex(clipList, manualAppointedTime);
    if (!validatePlayingIdx(clipIdx)) return;
    // Update video currentTime directly without 'onLoadedmetadata' if playingIdx is not changed
    void playWithinClip({
      clip: clipList[clipIdx],
      currentDateTime: manualAppointedTime,
      videoNode,
      onCanPlay: () => {
        setCurrTime(manualAppointedTime);
      },
      onError: () => {
        if (D_DEBUG) {
          console.log('Appointed time is out of clip duration, see the details:', {
            deviceId,
            clipIdx,
            clips: clipList.map(({ url }) => ({ file: url.slice(url.length - 10), url })),
          });
        }
        onEnded();
      },
    });
  }, [
    clipList,
    from,
    onEnded,
    manualAppointedTime,
    validatePlayingIdx,
    handleError,
    updateAppointedTime,
    playWithinClip,
    deviceId,
  ]);

  return (
    <FullPageViewer isFullPage onClose={onFullPageClose}>
      <div className={classes.videoPlayerWrapper}>
        <VideoPlayerBase
          ref={videoRef}
          crossOrigin="anonymous"
          isWaiting={loading || isWaiting}
          header={header}
          errorType={errorType}
          autoPlay={autoPlay}
          src={clipList[playingIdx]?.url}
          classes={{
            root: classes.videoPlayer,
            header: classes.header,
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onLoadedMetadata={onLoadedMetadata}
          onCanPlay={onPlaying}
          onPlaying={onPlaying}
          onWaiting={onWaiting}
          onAbort={onWaiting}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onError={onEnded}
        />
        <div className={classes.controlPanel}>
          {cutRange ? (
            <div className={classes.downloadBar}>
              <div className={clsx(classes.controlButtons, classes.cutRangeButtons)}>
                <Button
                  variant="outlined"
                  color="primary"
                  className={classes.downloadButton}
                  onClick={onCloseClipMode}
                >
                  {t('common:Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.downloadButton}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={onDownload}
                >
                  {t('common:Download')}
                </Button>
              </div>
              <div className={clsx(classes.controlButtons, classes.playerController)}>
                <Typography>
                  {formatDate(currTime, t('variables:dateFormat.common.dateTime'))}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  className={classes.playButton}
                  onClick={togglePause}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </Button>
              </div>
            </div>
          ) : (
            <div className={classes.controlButtons}>
              <PlayerController
                from={from}
                to={to}
                isPaused={isPaused}
                currentTime={draggingTime ?? currTime}
                togglePause={togglePause}
                onSkip={onSkip}
              />
              {enableDownload && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.fileButton}
                    onClick={onSnapshot}
                    disabled={isWaiting}
                  >
                    <SnapshotIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.fileButton}
                    onClick={onOpenClipMode}
                    disabled={isWaiting}
                  >
                    <DownloadIcon />
                  </Button>
                </>
              )}
            </div>
          )}
          <Divider />
          <PlaybackVideoToolbar
            from={from.getTime()}
            to={to.getTime()}
            deviceIds={[deviceId]}
            cutRange={cutRange}
            playbackTime={draggingTime ?? currTime}
            cameraEvents={eventData?.cameraEventHistory}
            onCutRangeChange={(newCutRange) => {
              setCutRange(newCutRange);
            }}
            onSliderTimeChange={onSliderTimeChange}
            onPlaybackTimeChange={onPlaybackTimeChange}
          />
        </div>
      </div>
      <BaseDialog
        open={openMultiDownloadWarning}
        onClose={onCloseMultiDownloadWarning}
        classes={{ dialog: classes.dialog }}
        title={t('common:You can not enable a new download processing')}
        content={
          <>
            <Typography variant="body1" align="left">
              {t(
                'common:Due to another download process existing, you can not initiate a new download right now_ Please wait for the download complete, or delete the process and try again_',
              )}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onCloseMultiDownloadWarning}
              className={classes.dialogButton}
            >
              {t('common:OK')}
            </Button>
          </>
        }
      />
      <BaseDialog
        open={openMobileDownloadWarning}
        onClose={onCloseMobileDownloadWarning}
        classes={{ dialog: classes.dialog }}
        title={t('common:Are you sure you want to download it?')}
        content={
          <>
            <Typography variant="body1" align="left">
              {t(
                "common:Mobile devices' video download size is limited_ A personal computer or laptop is recommended to download videos_",
              )}
            </Typography>
            <div className={classes.dialogButtons}>
              <Button
                variant="outlined"
                color="primary"
                onClick={onCloseMobileDownloadWarning}
                className={classes.dialogButton}
              >
                {t('common:No, cancel it_')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onStartClipMode}
                className={classes.dialogButton}
              >
                {t('common:Yes, download it_')}
              </Button>
            </div>
          </>
        }
      />
    </FullPageViewer>
  );
};

export default memo(FullPageVideoPlayer);
