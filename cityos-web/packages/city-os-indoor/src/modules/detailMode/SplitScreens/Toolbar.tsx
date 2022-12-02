import { fade, makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import React, {
  ChangeEvent,
  ReactElement,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { isNumberString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  SAVE_LIVE_VIEW_CONFIG,
  SaveLiveViewConfigPayload,
  SaveLiveViewConfigResponse,
} from '../../../api/saveLiveViewConfig';
import { SplitMode } from '../../../libs/type';
import { splitModeColumnCount } from '../../../libs/constants';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import SandClockIcon from '../../../assets/icon/sand-clock.svg';
import SplitScreen16Icon from '../../../assets/icon/split-screen-16.svg';
import SplitScreen1Icon from '../../../assets/icon/split-screen-1.svg';
import SplitScreen4Icon from '../../../assets/icon/split-screen-4.svg';
import SplitScreen9Icon from '../../../assets/icon/split-screen-9.svg';

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
    border: `1px solid ${fade(theme.palette.text.primary, 0.2)}`,
    borderRadius: theme.shape.borderRadius,
    padding: 0,
    width: 30,
    height: 'auto',
    minHeight: 30,
    color: theme.palette.gadget.reserved,

    '&:hover': {
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

const Toolbar: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useIndoorTranslation(['indoor']);
  const { dispatch } = useStore();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<TimerData>({ mode: 'onChange' });
  const {
    selectedDevices,
    page,
    splitMode,
    autoplay,
    autoplayInSeconds,
    setPage,
    setSplitMode,
    setAutoplay,
    setAutoplayInSeconds,
    setSelectedDevices,
  } = useSurveillanceContext();
  const isMountedRef = useIsMountedRef();
  const [duration, setDuration] = useState<number>(0);
  const [openTimerDialog, setOpenTimerDialog] = useState(false);

  const gridsPerPage = splitModeColumnCount[splitMode] ** 2;

  const pageCount = useMemo(() => {
    const fixedCount = selectedDevices.reduce((count, { fixedIndex }) => {
      if (fixedIndex !== null) {
        return count + 1;
      }
      return count;
    }, 0);
    if (fixedCount >= gridsPerPage) return 1;
    return Math.ceil((selectedDevices.length - fixedCount) / (gridsPerPage - fixedCount)) || 1;
  }, [selectedDevices, gridsPerPage]);

  const [saveLiveViewConfig] = useMutation<SaveLiveViewConfigResponse, SaveLiveViewConfigPayload>(
    SAVE_LIVE_VIEW_CONFIG,
  );

  const handleSplitModeChange = useCallback(
    (newSplitMode: SplitMode) => {
      const newGridsPerPage = splitModeColumnCount[newSplitMode] ** 2;
      setSplitMode(newSplitMode);
      setPage(1);
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
              'indoor:Autoplay turned off_ The number of pinned cameras equals or more than split screens_',
            ),
          },
        });
      }

      void saveLiveViewConfig({
        variables: {
          input: {
            splitMode: newSplitMode,
            devices: newDevices,
            autoplay: isOverFixed && autoplay ? false : undefined,
          },
        },
      });
    },
    [
      autoplay,
      selectedDevices,
      dispatch,
      saveLiveViewConfig,
      setAutoplay,
      setPage,
      setSelectedDevices,
      setSplitMode,
      t,
    ],
  );

  const handlePrevPageClick = useCallback(() => {
    setPage((prev) => (prev <= 1 ? prev : prev - 1));
  }, [setPage]);

  const handleNextPageClick = useCallback(() => {
    setPage((prev) => (prev >= pageCount ? prev : prev + 1));
  }, [pageCount, setPage]);

  const handleAutoplayChange = useCallback(
    (_: ChangeEvent<HTMLInputElement>, newAutoplay: boolean) => {
      setAutoplay(newAutoplay);
      void saveLiveViewConfig({
        variables: {
          input: {
            autoplay: newAutoplay,
          },
        },
      });
    },
    [saveLiveViewConfig, setAutoplay],
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
      void saveLiveViewConfig({
        variables: {
          input: {
            autoplayInSeconds: autoplayInterval,
          },
        },
      });
      if (!isMountedRef.current) return;
      setAutoplayInSeconds(autoplayInterval);
      setOpenTimerDialog(false);
    },
    [isMountedRef, saveLiveViewConfig, setAutoplayInSeconds],
  );

  const handleAutoplayNextPage = useCallback(() => {
    setPage((prev) => (prev >= pageCount ? 1 : prev + 1));
  }, [pageCount, setPage]);

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
      handleAutoplayNextPage();
    }
  }, [autoplay, autoplayInSeconds, countDown, duration, handleAutoplayNextPage]);

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
              'indoor:Autoplay turned off_ The number of selected cameras equals or less than split screens_',
            )
          : t(
              'indoor:Autoplay turned off_ The number of pinned cameras equals or more than split screens_',
            ),
      },
    });
    void saveLiveViewConfig({
      variables: {
        input: {
          autoplay: false,
        },
      },
    });
  }, [autoplay, isSinglePage, isDisabled, saveLiveViewConfig, setAutoplay, dispatch, t]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount, setPage]);

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
            disabled={page === 1}
            onClick={handlePrevPageClick}
          >
            <NavigateBeforeIcon />
          </ThemeIconButton>
          <ThemeIconButton
            color="primary"
            variant="miner"
            disabled={page === pageCount}
            onClick={handleNextPageClick}
          >
            <NavigateNextIcon />
          </ThemeIconButton>
        </div>
        <Typography variant="caption">{t('indoor:Autoplay')}</Typography>
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
      </div>
      <BaseDialog
        open={openTimerDialog}
        title={t('indoor:Timer Settings')}
        titleAlign="center"
        classes={{ dialog: classes.timerSettingDialog, content: classes.timerSettingContent }}
        onClose={handleCloseTimerDialog}
        content={
          <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('indoor:Timer (ex_MM_SS)')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.timerInput}
              inputProps={register('timerInput', {
                pattern: timerRegex,
                validate: (value) => value !== '00:00',
                required: true,
              })}
            />
            <Button type="submit" variant="contained" color="primary" disabled={!isValid}>
              {t('indoor:Set')}
            </Button>
          </form>
        }
      />
    </>
  );
};

export default memo(Toolbar);
