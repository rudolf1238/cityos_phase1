import { makeStyles } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import findKey from 'lodash/findKey';
import pick from 'lodash/pick';

import PlaybackVideoToolbar from 'city-os-common/modules/PlaybackVideoToolbar';

import { VideoStatusRecord } from '../../libs/type';
import { splitModeColumnCount } from '../../libs/constants';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useUpdateAllVideosStartTime from '../../hooks/useUpdateAllVideosStartTime';

import SingleScreen from './SingleScreen';
import SplitScreensToolbar from './SplitScreensToolbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
  },

  content: {
    display: 'grid',
    flex: 1,
    alignContent: 'start',
    alignSelf: 'center',
    padding: theme.spacing(1, 2),
    width: '100%',
    // back-calculation for maxWidth by content height & aspectRatio
    // height: 100vh - MainToolbar - PageTitle - SplitScreensToolbar
    maxWidth: 'calc((var(--vh) * 100 - 250px) / 9 * 16)',
  },

  playbackContent: {
    // back-calculation for maxWidth by content height & aspectRatio
    // height: 100vh - MainToolbar - PageTitle - SplitScreensToolbar - PlaybackVideoToolbar
    maxWidth: 'calc((var(--vh) * 100 - 370px) / 9 * 16)',
  },
}));

interface SplitScreensProps {
  className?: string;
  onChangeFixed: (deviceId: string, screenIdx: number | null) => void;
}

const SplitScreens: VoidFunctionComponent<SplitScreensProps> = ({
  className,
  onChangeFixed,
}: SplitScreensProps) => {
  const classes = useStyles();
  const {
    pageDeviceIds,
    splitMode,
    eventDeviceIds,
    selectedDevices,
    playbackRange,
    playbackTime,
    videoStatusRecord,
    isPlaybackPaused,
    setVideoStatusRecord,
    cameraEvents,
    setPlaybackTime,
    setIsPlaybackPaused,
  } = useSurveillanceContext();
  const updateAllVideosStartTime = useUpdateAllVideosStartTime();

  const playbackTimeRef = useRef<typeof playbackTime>();
  const [changingSliderTime, setChangingSliderTime] = useState<number>();
  const [leaderVideoId, setLeaderVideoId] = useState<string>();

  const columnCount = splitModeColumnCount[splitMode];
  const gridsPerPage = columnCount ** 2;

  const handleSliderChange = useCallback(
    (newTime: number) => {
      setChangingSliderTime(newTime);
    },
    [setChangingSliderTime],
  );

  const handlePlaybackTimeChange = useCallback(
    (newTime: number) => {
      updateAllVideosStartTime(newTime);
      setChangingSliderTime(undefined);
      setPlaybackTime(newTime);
    },
    [setPlaybackTime, updateAllVideosStartTime],
  );

  const filteredPageDeviceIds = useMemo(
    () => pageDeviceIds.filter((id): id is string => !!id),
    [pageDeviceIds],
  );

  // Decide which one is Leader VideoPlayer (enable to update playbackTime)
  useEffect(() => {
    if (playbackTime === null || !videoStatusRecord) return;
    setLeaderVideoId((prevId) => {
      if (filteredPageDeviceIds.length === 1) return filteredPageDeviceIds[0];

      const keepLeading =
        prevId && filteredPageDeviceIds.includes(prevId) && videoStatusRecord[prevId].canPlay;
      if (keepLeading) return prevId;

      const canPlayVideoId = findKey(videoStatusRecord, ({ canPlay }) => canPlay);
      if (canPlayVideoId) return canPlayVideoId;

      const deputyVideoId = Object.entries(videoStatusRecord).reduce<string | undefined>(
        (prevLeaderId, [newLeaderId, { nextClipStartTime, changingStartTime }]) => {
          if (nextClipStartTime === null) return prevLeaderId;
          const prevLeaderStatus = prevLeaderId ? videoStatusRecord[prevLeaderId] : undefined;
          return !prevLeaderStatus ||
            prevLeaderStatus.nextClipStartTime === null ||
            (changingStartTime === undefined &&
              nextClipStartTime < prevLeaderStatus.nextClipStartTime &&
              nextClipStartTime > playbackTime)
            ? newLeaderId
            : prevLeaderId;
        },
        undefined,
      );
      return deputyVideoId;
    });
  }, [playbackTime, filteredPageDeviceIds, videoStatusRecord]);

  // Pause if the videos are ended
  useEffect(() => {
    if (
      !playbackRange ||
      playbackTime === null ||
      playbackTime < playbackRange.to.getTime() ||
      isPlaybackPaused
    )
      return;
    setIsPlaybackPaused(true);
  }, [isPlaybackPaused, playbackRange, playbackTime, setIsPlaybackPaused]);

  // Preserve playbackTime to appoint to new VideoPlayers when current page changed
  useEffect(() => {
    playbackTimeRef.current = playbackTime;
  }, [playbackTime]);

  // Update VideoPlayers in videoStatusRecord when current page or selected cameras are changed
  useEffect(() => {
    if (!playbackRange) return;
    setVideoStatusRecord((prevRecord) => {
      const existedRecord = pick(
        prevRecord,
        Object.keys(prevRecord).filter((deviceId) => filteredPageDeviceIds.includes(deviceId)),
      );

      const initRecord = {
        canPlay: false,
        changingStartTime: playbackTimeRef.current ?? playbackRange.from.getTime(),
        nextClipStartTime: null,
        errorType: undefined,
      };

      const newRecord = filteredPageDeviceIds.reduce<VideoStatusRecord>((prev, deviceId) => {
        return {
          ...prev,
          [deviceId]: { ...initRecord, ...prev[deviceId] },
        };
      }, existedRecord);

      return newRecord;
    });
  }, [filteredPageDeviceIds, selectedDevices, setVideoStatusRecord, playbackRange]);

  const toolbarTime = useMemo(
    () => changingSliderTime ?? playbackTime ?? undefined,
    [changingSliderTime, playbackTime],
  );

  return (
    <div className={clsx(classes.root, className)}>
      <div
        className={clsx(classes.content, { [classes.playbackContent]: !!playbackRange })}
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {selectedDevices.map((device) => {
          const screenNo = pageDeviceIds.findIndex((deviceId) => deviceId === device.deviceId) + 1;
          return screenNo ? (
            <SingleScreen
              key={device.deviceId}
              deviceId={device.deviceId}
              selectedLabel={screenNo.toString()}
              detectedEvent={eventDeviceIds.includes(device.deviceId) ? 'highlight' : undefined}
              isLeader={leaderVideoId === device.deviceId}
              isFixed={device.fixedIndex !== null && device.fixedIndex < gridsPerPage}
              onToggleFixed={() => {
                onChangeFixed(device.deviceId, device.fixedIndex === null ? screenNo - 1 : null);
              }}
              style={{ order: screenNo - 1 }}
            />
          ) : (
            <SingleScreen
              key={device.deviceId}
              deviceId={device.deviceId}
              selectedLabel=""
              isHidden
            />
          );
        })}
        {pageDeviceIds.map((deviceId, i) =>
          deviceId ? null : (
            <SingleScreen
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              selectedLabel={(i + 1).toString()}
              style={{ order: i }}
            />
          ),
        )}
      </div>
      <SplitScreensToolbar
        toolbarTime={toolbarTime}
        onPlaybackTimeChange={handlePlaybackTimeChange}
      />
      {playbackRange && (
        <PlaybackVideoToolbar
          from={playbackRange.from.getTime()}
          to={playbackRange.to.getTime()}
          deviceIds={filteredPageDeviceIds}
          playbackTime={toolbarTime}
          cameraEvents={cameraEvents}
          onSliderTimeChange={handleSliderChange}
          onPlaybackTimeChange={handlePlaybackTimeChange}
          disableThumbnail
        />
      )}
    </div>
  );
};

export default memo(SplitScreens);
