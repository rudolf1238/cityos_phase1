import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useRef, useState } from 'react';
import subHours from 'date-fns/subHours';

import Typography from '@material-ui/core/Typography';

import {
  GET_VIDEO_HISTORY,
  GetVideoHistoryPayload,
  GetVideoHistoryResponse,
} from '../../api/getVideoHistory';
import findClosestClipIndex from '../../libs/findClosestClipIndex';
import formatDate from '../../libs/formatDate';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import usePlayWithinClip from '../../hooks/usePlayWithinClip';

import AspectRatio from '../AspectRatio';

const videoRatio = 16 / 9;

const useStyles = makeStyles((theme) => ({
  thumbnailWrapper: {
    position: 'absolute',
    bottom: '100%',
    transform: 'translate(-50%)',
    zIndex: theme.zIndex.tooltip,
    marginBottom: theme.spacing(3),
    width: 120 * videoRatio,
    height: 120,
  },

  thumbnail: {
    border: `2px solid ${theme.palette.primary.contrastText}`,
    backgroundColor: theme.palette.background.dark,
  },

  timeTag: {
    margin: theme.spacing(1, 'auto'),
    backgroundColor: theme.palette.background.light,
    padding: theme.spacing(0.5, 1.5),
    width: 'fit-content',
    textAlign: 'center',
  },
}));

interface VideoThumbnailProps {
  from: number;
  to: number;
  deviceId: string;
  /** Date number in milliseconds */
  thumbnailTime: number;
}

const VideoThumbnail: VoidFunctionComponent<VideoThumbnailProps> = ({
  from,
  to,
  deviceId,
  thumbnailTime,
}: VideoThumbnailProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('variables');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [clipIdx, setClipIdx] = useState<number>(-1);

  const playWithinClip = usePlayWithinClip();

  const { data: videoHistoryData } = useQuery<GetVideoHistoryResponse, GetVideoHistoryPayload>(
    GET_VIDEO_HISTORY,
    {
      variables: {
        deviceId,
        from: subHours(new Date(from), 1), // move up an hour to prevent from some camera return clips not covering the playback range
        to: new Date(to),
      },
    },
  );

  const clipList = useMemo(
    () => videoHistoryData?.getVideoHistory.clips || [],
    [videoHistoryData?.getVideoHistory.clips],
  );

  useEffect(() => {
    const videoNode = videoRef.current;
    const closestClipIdx = findClosestClipIndex(clipList, thumbnailTime);
    if (!videoNode || closestClipIdx < 0 || !clipList[closestClipIdx]) return;
    void playWithinClip({
      clip: clipList[closestClipIdx],
      currentDateTime: thumbnailTime,
      videoNode,
      onCanPlay: () => {
        if (closestClipIdx === clipIdx) return;
        setClipIdx(closestClipIdx);
      },
      onError: () => {
        setClipIdx(-1);
      },
    });
  }, [clipIdx, clipList, playWithinClip, thumbnailTime]);

  return (
    <div
      className={classes.thumbnailWrapper}
      style={{
        left: `${((thumbnailTime - from) * 100) / (to - from)}%`,
      }}
    >
      <div className={classes.thumbnail}>
        <AspectRatio ratio={videoRatio}>
          <video ref={videoRef} src={clipList[clipIdx]?.url}>
            <track kind="captions" />
          </video>
        </AspectRatio>
      </div>
      <Typography variant="body2" className={classes.timeTag}>
        {formatDate(thumbnailTime, t('dateFormat.surveillance.cutRangeLabel'))}
      </Typography>
    </div>
  );
};

export default memo(VideoThumbnail);
