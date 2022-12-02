import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import React, {
  ChangeEvent,
  ReactElement,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import findLast from 'lodash/findLast';

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { isNumberString } from 'city-os-common/libs/validators';
import { msOfSec } from 'city-os-common/libs/constants';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import PlayerController from 'city-os-common/modules/PlayerController';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { SplitMode } from '../../libs/type';
import { splitModeColumnCount } from '../../libs/constants';
import { useSurveillanceContext } from '../SurveillanceProvider';
import findUnfixedDeviceIndexes, { getSequenceIndex } from '../../libs/findUnfixedDeviceIndexes';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';
import useUpdateAllVideosStartTime from '../../hooks/useUpdateAllVideosStartTime';

import SandClockIcon from '../../assets/icon/sand-clock.svg';
import SplitScreen16Icon from '../../assets/icon/split-screen-16.svg';
import SplitScreen1Icon from '../../assets/icon/split-screen-1.svg';
import SplitScreen4Icon from '../../assets/icon/split-screen-4.svg';
import SplitScreen9Icon from '../../assets/icon/split-screen-9.svg';

const timerRegex = /^[0-5]?\d:[0-5]\d$/;

const splitModeIconMapping: Record<SplitMode, ReactElement> = {
  [SplitMode.SINGLE]: <SplitScreen1Icon />,
  [SplitMode.FOUR]: <SplitScreen4Icon />,
  [SplitMode.NINE]: <SplitScreen9Icon />,
  [SplitMode.SIXTEEN]: <SplitScreen16Icon />,
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    backgroundColor: theme.palette.background.evenRow,
    padding: theme.spacing(1.5, 2),
    height: 56,
  },

  splitModeMenu: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: 0,
  },

  splitModeItem: {
    justifyContent: 'center',
    border: `1px solid ${theme.palette.themeIconButton.splitMode}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.themeIconButton.outlined,
    padding: 0,
    width: 30,
    height: 'auto',
    minHeight: 30,
    color: theme.palette.background.miniTab,

    '&:hover': {
      backgroundColor: theme.palette.themeIconButton.hoverMiner,
      color: theme.palette.grey[600],
    },

    '&.MuiListItem-button.Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },

  pagination: {
    display: 'flex',
    gap: theme.spacing(1),
    marginRight: 'auto',

    '& button': {
      width: 24,
      height: 24,
    },
  },

  playerController: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  sandClock: {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
  },

  activeSandClock: {
    color: theme.palette.primary.main,
  },

  timer: {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
  },

  activeTimer: {
    backgroundColor: theme.palette.action.selected,
  },

  timerSettingDialog: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 600,
    maxWidth: '90vw',
  },

  timerSettingContent: {
    width: '100%',
    maxWidth: 360,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    paddingTop: theme.spacing(4),
    width: '100%',
    maxWidth: 360,
  },
}));

interface TimerData {
  timerInput: string;
}

interface SplitScreensToolbarProps {
  toolbarTime?: number;
  onPlaybackTimeChange?: (newStartTime: number) => void;
}

const SplitScreensToolbar: VoidFunctionComponent<SplitScreensToolbarProps> = ({
  toolbarTime,
  onPlaybackTimeChange,
}: SplitScreensToolbarProps) => {
  const classes = useStyles();
  const { t } = useSurveillanceTranslation(['common', 'surveillance']);
  const { dispatch } = useStore();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<TimerData>({ mode: 'onChange' });
  const {
    selectedDevices,
    pageDeviceIds,
    splitMode,
    autoplay,
    autoplayInSeconds,
    playbackRange,
    playbackTime,
    videoStatusRecord,
    isPlaybackPaused,
    setCursorIndex,
    setSplitMode,
    setAutoplay,
    setAutoplayInSeconds,
    setSelectedDevices,
    setIsUpdating,
    setIsPlaybackPaused,
    setPlaybackTime,
  } = useSurveillanceContext();
  const updateAllVideosStartTime = useUpdateAllVideosStartTime();
  const [duration, setDuration] = useState<number>(0);
  const [openTimerDialog, setOpenTimerDialog] = useState(false);
  const isAutoPlayNextRef = useRef<boolean>(false);

  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;

  const handleSplitModeChange = useCallback(
    (newSplitMode: SplitMode) => {
      const newGridsPerPage = splitModeColumnCount[newSplitMode] ** 2;
      setSplitMode(newSplitMode);
      setCursorIndex(0);
      setDuration(0);
      let isOverFixed = false;
      const newDevices = selectedDevices.map(({ deviceId, fixedIndex }) => {
        const isCurrOverFixed = fixedIndex !== null && fixedIndex >= newGridsPerPage;
        if (isCurrOverFixed && !isOverFixed) {
          isOverFixed = true;
        }
        return {
          deviceId,
          fixedIndex: isCurrOverFixed ? null : fixedIndex,
        };
      });
      setSelectedDevices(newDevices);

      if (isOverFixed && autoplay) {
        setAutoplay(false);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t(
              'surveillance:Autoplay turned off_ The number of pinned cameras equals or more than split screens_',
            ),
          },
        });
      }
      setIsUpdating(true);
      if (playbackTime !== null && onPlaybackTimeChange) {
        onPlaybackTimeChange(playbackTime);
      }
    },
    [
      setSplitMode,
      setCursorIndex,
      selectedDevices,
      setSelectedDevices,
      autoplay,
      setIsUpdating,
      playbackTime,
      onPlaybackTimeChange,
      setAutoplay,
      dispatch,
      t,
    ],
  );

  const togglePause = useCallback(() => {
    if (
      isPlaybackPaused &&
      playbackTime !== null &&
      playbackRange !== undefined &&
      playbackTime >= playbackRange.to.getTime()
    ) {
      setPlaybackTime(playbackRange.from.getTime());
      updateAllVideosStartTime(playbackRange.from.getTime());
    }
    setIsPlaybackPaused((prev) => !prev);
  }, [
    isPlaybackPaused,
    playbackRange,
    playbackTime,
    setIsPlaybackPaused,
    setPlaybackTime,
    updateAllVideosStartTime,
  ]);

  const onSkip = useCallback(
    (skipTime: number) => {
      if (playbackTime === null) return;
      const newStartTime = playbackTime + skipTime * msOfSec;
      updateAllVideosStartTime(newStartTime);
      if (onPlaybackTimeChange) onPlaybackTimeChange(newStartTime);
    },
    [onPlaybackTimeChange, playbackTime, updateAllVideosStartTime],
  );

  const unfixedDevicePerPage = useMemo(() => {
    const fixedDeviceCount = selectedDevices.reduce(
      (acc, curr) => (curr.fixedIndex === null ? acc : acc + 1),
      0,
    );
    return gridsPerPage - fixedDeviceCount;
  }, [gridsPerPage, selectedDevices]);

  const handlePageClick = useCallback(
    (type: 'previous' | 'next') => {
      const firstOrLastUnfixedDeviceId =
        type === 'previous'
          ? pageDeviceIds.find(
              (deviceId) =>
                selectedDevices.find((device) => device.deviceId === deviceId)?.fixedIndex === null,
            )
          : findLast(
              pageDeviceIds,
              (deviceId) =>
                selectedDevices.find((device) => device.deviceId === deviceId)?.fixedIndex === null,
            );
      if (!firstOrLastUnfixedDeviceId) return;

      const firstOrLastUnfixedIdx = selectedDevices.findIndex(
        (device) => device.deviceId === firstOrLastUnfixedDeviceId,
      );
      if (firstOrLastUnfixedIdx === -1) return;

      const unfixedDeviceIndexes = findUnfixedDeviceIndexes({
        type,
        startIdx: getSequenceIndex({
          type,
          currentIdx: firstOrLastUnfixedIdx,
          devices: selectedDevices,
        }),
        devices: selectedDevices,
        times: type === 'previous' ? unfixedDevicePerPage : 1,
      });
      const newCursor =
        type === 'previous'
          ? unfixedDeviceIndexes[unfixedDevicePerPage - 1]
          : unfixedDeviceIndexes[0];
      if (newCursor !== undefined) {
        setCursorIndex(newCursor);
        if (playbackTime && onPlaybackTimeChange) {
          onPlaybackTimeChange(playbackTime);
        }
      }
    },
    [
      pageDeviceIds,
      selectedDevices,
      unfixedDevicePerPage,
      setCursorIndex,
      playbackTime,
      onPlaybackTimeChange,
    ],
  );

  const handleAutoplayChange = useCallback(
    (_: ChangeEvent<HTMLInputElement>, newAutoplay: boolean) => {
      setAutoplay(newAutoplay);
      setIsUpdating(true);
    },
    [setAutoplay, setIsUpdating],
  );

  const handleOpenTimerDialog = useCallback(() => {
    setOpenTimerDialog(true);
    reset({
      timerInput: formatDate(
        { minutes: Math.floor(autoplayInSeconds / 60), seconds: autoplayInSeconds % 60 },
        'mm:ss',
      ),
    });
  }, [autoplayInSeconds, reset]);

  const handleCloseTimerDialog = useCallback(() => {
    setOpenTimerDialog(false);
  }, []);

  const onSubmit = useCallback(
    ({ timerInput }: TimerData) => {
      const [minStr, secStr] = timerInput.split(':');
      const min = isNumberString(minStr) ? parseInt(minStr, 10) : 0;
      const sec = isNumberString(secStr) ? parseInt(secStr, 10) : 0;
      const autoplayInterval = min * 60 + sec;
      setAutoplayInSeconds(autoplayInterval);
      setOpenTimerDialog(false);
      setIsUpdating(true);
    },
    [setAutoplayInSeconds, setIsUpdating],
  );

  const countDown = autoplayInSeconds - (duration % autoplayInSeconds);

  useEffect(() => {
    const startAt = Date.now();
    setDuration(0);
    if (!autoplay) return () => {};
    const timer = window.setInterval(() => {
      setDuration(Math.trunc((Date.now() - startAt) / 1000));
    }, 1000 / 30);
    return () => {
      window.clearInterval(timer);
    };
  }, [autoplay, autoplayInSeconds]);

  useEffect(() => {
    if (autoplay && duration && countDown === autoplayInSeconds) {
      if (!isAutoPlayNextRef.current) {
        handlePageClick('next');
        isAutoPlayNextRef.current = true;
      }
    } else {
      isAutoPlayNextRef.current = false;
    }
  }, [autoplay, autoplayInSeconds, countDown, duration, handlePageClick]);

  const isSinglePage = selectedDevices.length <= gridsPerPage;

  const isAllFixed = useMemo(() => {
    const fixedList = Array.from({ length: gridsPerPage }, () => false);
    selectedDevices.forEach(({ fixedIndex }) => {
      if (fixedIndex !== null) {
        fixedList[fixedIndex] = true;
      }
    });
    return fixedList.every((isFixed) => isFixed);
  }, [selectedDevices, gridsPerPage]);

  const isDisabled = isSinglePage || isAllFixed;

  useEffect(() => {
    if (!autoplay || !isDisabled) return;

    setAutoplay(false);
    dispatch({
      type: ReducerActionType.ShowSnackbar,
      payload: {
        severity: 'error',
        message: isSinglePage
          ? t(
              'surveillance:Autoplay turned off_ The number of selected cameras equals or less than split screens_',
            )
          : t(
              'surveillance:Autoplay turned off_ The number of pinned cameras equals or more than split screens_',
            ),
      },
    });
    setIsUpdating(true);
  }, [autoplay, isSinglePage, isDisabled, setAutoplay, dispatch, t, setIsUpdating]);

  return (
    <>
      <div className={classes.root}>
        <MenuList className={classes.splitModeMenu}>
          {(Object.entries(splitModeIconMapping) as [SplitMode, ReactElement][]).map(
            ([mode, icon]) => (
              <MenuItem
                key={mode}
                selected={mode === splitMode}
                className={classes.splitModeItem}
                onClick={() => handleSplitModeChange(mode)}
              >
                {icon}
              </MenuItem>
            ),
          )}
        </MenuList>
        <div className={classes.pagination}>
          <ThemeIconButton
            color="primary"
            variant="miner"
            disabled={isDisabled}
            onClick={() => handlePageClick('previous')}
          >
            <NavigateBeforeIcon />
          </ThemeIconButton>
          <ThemeIconButton
            color="primary"
            variant="miner"
            disabled={isDisabled}
            onClick={() => handlePageClick('next')}
          >
            <NavigateNextIcon />
          </ThemeIconButton>
        </div>
        {playbackRange ? (
          <div className={classes.playerController}>
            <PlayerController
              from={playbackRange.from}
              to={playbackRange.to}
              isPaused={isPlaybackPaused}
              currentTime={toolbarTime !== undefined ? toolbarTime : playbackTime}
              disabled={
                selectedDevices.length === 0 ||
                Object.values(videoStatusRecord).every(({ errorType }) => !!errorType)
              }
              togglePause={togglePause}
              onSkip={onSkip}
            />
          </div>
        ) : (
          <>
            <Typography variant="caption">{t('surveillance:Autoplay')}</Typography>
            <Switch
              color="primary"
              checked={autoplay}
              disabled={isDisabled}
              onChange={handleAutoplayChange}
            />
            <Typography
              variant="body2"
              className={clsx(classes.timer, { [classes.activeTimer]: autoplay })}
            >
              {formatDate(
                {
                  minutes: Math.floor(countDown / 60),
                  seconds: countDown % 60,
                },
                'mm:ss',
              )}
            </Typography>
            <ThemeIconButton
              size="small"
              disabled={!autoplay}
              className={clsx(classes.sandClock, { [classes.activeSandClock]: autoplay })}
              onClick={handleOpenTimerDialog}
            >
              <SandClockIcon />
            </ThemeIconButton>
          </>
        )}
      </div>
      <BaseDialog
        open={openTimerDialog}
        title={t('surveillance:Timer Settings')}
        titleAlign="center"
        classes={{ dialog: classes.timerSettingDialog, content: classes.timerSettingContent }}
        onClose={handleCloseTimerDialog}
        content={
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('surveillance:Timer (ex_MM_SS)')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.timerInput}
              inputProps={register('timerInput', {
                pattern: timerRegex,
                validate: (value) => value !== '00:00',
                required: true,
              })}
            />
            <Button type="submit" variant="contained" color="primary" disabled={!isValid}>
              {t('surveillance:Set')}
            </Button>
          </form>
        }
      />
    </>
  );
};

export default memo(SplitScreensToolbar);
