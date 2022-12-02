import { fade, makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import Hls from 'hls.js';
import React, {
  ReactEventHandler,
  ReactNode,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import PauseIcon from '@material-ui/icons/PauseRounded';
import PlayIcon from '@material-ui/icons/PlayArrowRounded';

import { ErrorType } from './type';
import { GET_VIDEO_URL, GetVideoURLResponse, GetVideoURLVars } from '../../api/getVideoURL';
import { IDevice } from '../../libs/schema';
import {
  KEEP_VIDEO_ALIVE,
  KeepVideoAlivePayload,
  KeepVideoAliveResponse,
} from '../../api/keepVideoAlive';
import ErrorCode from '../../libs/errorCode';
import isGqlError from '../../libs/isGqlError';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useHiddenStyles from '../../styles/hidden';
import useIsMountedRef from '../../hooks/useIsMountedRef';

import FullPageIcon from '../../assets/icon/full-page.svg';
import FullPageViewer from '../FullPageViewer';
import ThemeIconButton from '../ThemeIconButton';
import VideoPlayerBase from './VideoPlayerBase';

/** in milliseconds */
const keepAliveBuffer = 60_000;
/** in seconds */
const restartBuffer = 1;
const videoRatio = 16 / 9;

const useStyles = makeStyles((theme) => ({
  videoPlayer: {
    margin: 'auto',
    backgroundColor: theme.palette.background.light,
    maxWidth: `min(calc(var(--vh) * 100 * ${videoRatio}), 100vw)`,
  },

  noVideo: {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.light,
  },

  header: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  iconButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
  },

  iconButton: {
    borderWidth: 0,
    backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    padding: theme.spacing(0.4),
    width: 30,
    height: 30,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    },
  },

  biggerIcon: {
    transform: 'scale(1.5)',
  },

  biggerPause: {
    backgroundColor: theme.palette.themeIconButton.outlined,
  },
}));

interface CustomClasses {
  pause?: string;
  controlIcon?: string;
  noVideo?: string;
}

interface VideoPlayerProps {
  device: Pick<IDevice, 'deviceId'>;
  roundedCorner?: boolean;
  isControllable?: boolean;
  isFullPage?: boolean;
  enableFullPage?: boolean;
  header?: ReactNode | ((classes: { showOnHover: string }) => ReactNode);
  classes?: CustomClasses;
  onForbidden?: (newIsForbidden: boolean) => void;
  onToggleScreen?: (isFullPage: boolean) => void;
}

const LiveStreamPlayer: VoidFunctionComponent<VideoPlayerProps> = ({
  device,
  roundedCorner = false,
  isControllable = false,
  isFullPage: initIsFullPage,
  enableFullPage = false,
  header,
  classes: customClasses,
  onForbidden,
  onToggleScreen: initOnToggleScreen,
}: VideoPlayerProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { t } = useCommonTranslation('common');

  const [expiredTime, setExpiredTime] = useState<number | undefined>(undefined);
  const [errorType, setErrorType] = useState<ErrorType | undefined>(undefined);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullPage, setIsFullPage] = useState(initIsFullPage || false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useIsMountedRef();

  const handleError = useCallback((type: ErrorType) => {
    setIsWaiting(false);
    setErrorType(type);
  }, []);

  const deviceIds = useMemo(() => {
    if (!device) return [];
    return [device.deviceId];
  }, [device]);

  const {
    data: getVideoURLData,
    loading,
    error: getVideoError,
  } = useQuery<GetVideoURLResponse, GetVideoURLVars>(GET_VIDEO_URL, {
    variables: { deviceIds },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
      if (isGqlError(error, ErrorCode.CAMERA_ID_NOT_EXIST)) {
        handleError(ErrorType.NO_CAMERA_ID);
      } else {
        handleError(ErrorType.UNKNOWN_ERROR);
      }
    },
  });

  const [keepVideoAlive, { error: keepVideoAliveError }] = useMutation<
    KeepVideoAliveResponse,
    KeepVideoAlivePayload
  >(KEEP_VIDEO_ALIVE);

  const videoToken = useMemo(
    () => getVideoURLData?.getVideoURL.token,
    [getVideoURLData?.getVideoURL.token],
  );

  const videoUrlToken = useMemo(
    () => getVideoURLData?.getVideoURL.urlToken,
    [getVideoURLData?.getVideoURL.urlToken],
  );

  const onWaiting = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsWaiting(true);
  }, []);

  const onPlaying = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsWaiting(false);
    setErrorType(undefined);
  }, []);

  const onPause = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPaused(true);
  }, []);

  const onPlay = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPaused(false);
  }, []);

  const triggerPlay = useCallback(async () => {
    const videoNode = videoRef.current;
    if (!videoNode || videoNode.readyState < videoNode.HAVE_CURRENT_DATA) return;
    try {
      videoNode.currentTime = videoNode.duration - restartBuffer;
      await videoNode.play();
    } catch (error) {
      if (D_DEBUG) console.log(error);
    }
  }, []);

  const togglePause = useCallback(() => {
    const videoNode = videoRef.current;
    if (!videoNode || isWaiting) return;
    if (videoNode.paused) {
      void triggerPlay();
    } else {
      videoNode.pause();
    }
  }, [isWaiting, triggerPlay]);

  const tooltipText = useMemo(() => {
    if (!isFullPage) return undefined;
    return isPaused ? t('Play') : t('Pause');
  }, [isFullPage, isPaused, t]);

  const onToggleScreen = useCallback(
    (newIsFullPage: boolean) => {
      if (initIsFullPage === undefined) setIsFullPage(newIsFullPage);
      if (initOnToggleScreen) initOnToggleScreen(newIsFullPage);
    },
    [initIsFullPage, initOnToggleScreen],
  );

  const onFullPageClose = useCallback(() => {
    onToggleScreen(false);
  }, [onToggleScreen]);

  useEffect(() => {
    if (initIsFullPage !== undefined && initIsFullPage !== isFullPage) {
      setIsFullPage(initIsFullPage);
    }
  }, [initIsFullPage, isFullPage]);

  useEffect(() => {
    if (!getVideoURLData || !videoRef.current) return () => {};
    const videoURL = getVideoURLData.getVideoURL.streamList[0]?.url;
    if (!videoURL) {
      handleError(ErrorType.UNKNOWN_ERROR);
      return () => {};
    }
    const videoNode = videoRef.current;
    const hls = new Hls();
    if (videoNode.canPlayType('application/vnd.apple.mpegurl')) {
      videoNode.src = videoURL;
    } else if (Hls.isSupported()) {
      hls.attachMedia(videoNode);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(videoURL);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (D_DEBUG) {
                console.log('fatal network error encountered, try to recover');
              }
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (D_DEBUG) {
                console.log('fatal media error encountered, try to recover');
              }
              hls.recoverMediaError();
              break;
            default:
              // cannot recover
              handleError(ErrorType.UNKNOWN_ERROR);
              hls.destroy();
              break;
          }
        }
      });
    }

    setExpiredTime(getVideoURLData?.getVideoURL.expiredAt);

    return () => {
      hls.destroy();
    };
  }, [getVideoURLData, handleError]);

  useEffect(() => {
    if (!expiredTime || !videoRef.current || !videoToken || !videoUrlToken) return () => {};
    const nowTime = Date.now();
    const countDown = expiredTime - nowTime;
    timerRef.current = window.setTimeout(() => {
      void (async () => {
        const result = await keepVideoAlive({
          variables: { token: videoToken, urlTokenList: [videoUrlToken] },
        });
        const expiredAt = result?.data?.keepVideoAlive?.expiredAt;
        if (typeof expiredAt !== 'number' || !isMountedRef.current) return;
        setExpiredTime(expiredAt);
      })();
    }, countDown - keepAliveBuffer);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [deviceIds, expiredTime, isMountedRef, keepVideoAlive, videoToken, videoUrlToken]);

  useEffect(() => {
    if (onForbidden) {
      const newIsForbidden = [getVideoError, keepVideoAliveError].some(
        (err) => err && isGqlError(err, ErrorCode.FORBIDDEN),
      );
      onForbidden(newIsForbidden);
    }
  }, [getVideoError, keepVideoAliveError, onForbidden]);

  useEffect(() => {
    const restart = () => {
      void triggerPlay();
    };
    document.addEventListener('visibilitychange', restart);

    return () => {
      document.removeEventListener('visibilitychange', restart);
    };
  }, [triggerPlay]);

  return (
    <FullPageViewer disabled={!enableFullPage} isFullPage={isFullPage} onClose={onFullPageClose}>
      <VideoPlayerBase
        ref={videoRef}
        ratio={videoRatio}
        isWaiting={loading || isWaiting}
        roundedCorner={roundedCorner && !isFullPage}
        header={header}
        errorType={errorType}
        classes={{
          root: classes.videoPlayer,
          noVideo: clsx(classes.noVideo, customClasses?.noVideo),
          header: classes.header,
        }}
        autoPlay
        playsInline
        onPlay={onPlay}
        onPause={onPause}
        onPlaying={onPlaying}
        onWaiting={onWaiting}
      >
        <div
          className={clsx(classes.iconButtons, {
            [hiddenClasses.hidden]: errorType || loading,
          })}
        >
          {isControllable && (
            <ThemeIconButton
              color="primary"
              tooltip={tooltipText}
              className={clsx(
                isFullPage ? classes.biggerPause : classes.iconButton,
                customClasses?.pause,
              )}
              onClick={togglePause}
            >
              {isPaused ? (
                <PlayIcon
                  className={clsx(customClasses?.controlIcon, {
                    [classes.biggerIcon]: isFullPage,
                  })}
                />
              ) : (
                <PauseIcon
                  className={clsx(customClasses?.controlIcon, {
                    [classes.biggerIcon]: isFullPage,
                  })}
                />
              )}
            </ThemeIconButton>
          )}
          {enableFullPage && !isFullPage && (
            <ThemeIconButton
              color="primary"
              className={clsx(classes.iconButton, { [hiddenClasses.hidden]: isFullPage })}
              onClick={() => {
                onToggleScreen(true);
              }}
            >
              <FullPageIcon />
            </ThemeIconButton>
          )}
        </div>
      </VideoPlayerBase>
    </FullPageViewer>
  );
};

export default memo(LiveStreamPlayer);
