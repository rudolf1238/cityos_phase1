import { fade, makeStyles } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';

import Slider, { Mark } from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { CameraEventHistoryResponse } from '../../api/cameraEventHistory';
import { CutRange } from '../../libs/schema';
import { downloadDurationLimit } from '../../libs/parsedENV';
import { isCutRange, isNumber } from '../../libs/validators';
import { msOfHour, msOfMinute } from '../../libs/constants';
import { roundUpDate } from '../../libs/roundDate';
import formatDate from '../../libs/formatDate';
import omitUndefinedProps from '../../libs/omitUndefinedProps';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useHiddenStyles from '../../styles/hidden';

import VideoThumbnail from './VideoThumbnail';

const thumbBackgroundImage = `<svg width="6" height="30" viewBox="0 0 6 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M2 1C2 1.55228 1.55228 2 1 2C0.447723 2 0 1.55228 0 1C0 0.447715 0.447723 0 1 0C1.55228 0 2 0.447715 2 1ZM2 9C2 9.55228 1.55228 10 1 10C0.447723 10 0 9.55228 0 9C0 8.44771 0.447723 8 1 8C1.55228 8 2 8.44771 2 9ZM1 6C1.55228 6 2 5.55228 2 5C2 4.44772 1.55228 4 1 4C0.447723 4 0 4.44772 0 5C0 5.55228 0.447723 6 1 6ZM2 13C2 13.5523 1.55228 14 1 14C0.447723 14 0 13.5523 0 13C0 12.4477 0.447723 12 1 12C1.55228 12 2 12.4477 2 13ZM5 2C5.55228 2 6 1.55228 6 1C6 0.447715 5.55228 0 5 0C4.44772 0 4 0.447715 4 1C4 1.55228 4.44772 2 5 2ZM6 9C6 9.55228 5.55228 10 5 10C4.44772 10 4 9.55228 4 9C4 8.44771 4.44772 8 5 8C5.55228 8 6 8.44771 6 9ZM5 6C5.55228 6 6 5.55228 6 5C6 4.44772 5.55228 4 5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6ZM6 13C6 13.5523 5.55228 14 5 14C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13ZM2 17C2 17.5523 1.55228 18 1 18C0.447723 18 0 17.5523 0 17C0 16.4477 0.447723 16 1 16C1.55228 16 2 16.4477 2 17ZM2 25C2 25.5523 1.55228 26 1 26C0.447723 26 0 25.5523 0 25C0 24.4477 0.447723 24 1 24C1.55228 24 2 24.4477 2 25ZM1 22C1.55228 22 2 21.5523 2 21C2 20.4477 1.55228 20 1 20C0.447723 20 0 20.4477 0 21C0 21.5523 0.447723 22 1 22ZM2 29C2 29.5523 1.55228 30 1 30C0.447723 30 0 29.5523 0 29C0 28.4477 0.447723 28 1 28C1.55228 28 2 28.4477 2 29ZM5 18C5.55228 18 6 17.5523 6 17C6 16.4477 5.55228 16 5 16C4.44772 16 4 16.4477 4 17C4 17.5523 4.44772 18 5 18ZM6 25C6 25.5523 5.55228 26 5 26C4.44772 26 4 25.5523 4 25C4 24.4477 4.44772 24 5 24C5.55228 24 6 24.4477 6 25ZM5 22C5.55228 22 6 21.5523 6 21C6 20.4477 5.55228 20 5 20C4.44772 20 4 20.4477 4 21C4 21.5523 4.44772 22 5 22ZM6 29C6 29.5523 5.55228 30 5 30C4.44772 30 4 29.5523 4 29C4 28.4477 4.44772 28 5 28C5.55228 28 6 28.4477 6 29Z" fill="black" fillOpacity="0.1" /></svg>`;
const imageType = 'data:image/svg+xml';

const railStyle = {
  height: 9,
  borderWidth: 1,
};

const cutRangeStyle = {
  height: 96,
  borderWidth: 3,
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.playbackVideoToolbar,
    padding: theme.spacing(0, 5.5),
  },

  sliderWrapper: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
  },

  slider: {
    margin: theme.spacing(7, 0, 10),
    padding: 0,
    height: railStyle.height,
  },

  markLabelRoot: {
    display: 'flex',
    top: 'auto',
    bottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    color: theme.palette.info.main,
  },

  normalTick: {
    backgroundColor: theme.palette.info.main,
    width: 3,
    height: 21,
  },

  littleTick: {
    backgroundColor: theme.palette.info.main,
    width: 2,
    height: 15,
  },

  eventTick: {
    backgroundColor: theme.palette.secondary.main,
    width: 3,
    height: 47,
  },

  tickLabel: {
    display: 'flex',
    position: 'absolute',
    top: '100%',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    transform: `translateX(calc(50% - ${theme.spacing(0.5)}px))`,
    marginTop: theme.spacing(1.5),
  },

  rail: {
    boxSizing: 'border-box',
    opacity: 1,
    borderBottom: `${railStyle.borderWidth}px solid ${theme.palette.info.main}`,
    borderRadius: 0,
    backgroundColor: theme.palette.action.selected,
    height: railStyle.height,
  },

  track: {
    borderRadius: 0,
    height: railStyle.height - railStyle.borderWidth,
  },

  thumb: {
    [`&:hover,
    &.Mui-focusVisible`]: {
      boxShadow: `0 0 0 14px ${fade(theme.palette.primary.main, 0.3)}`,
    },
  },

  cutRangeSlider: {
    position: 'absolute',
    top: 0,
    pointerEvents: 'none',
  },

  cutRangeTrack: {
    top: -cutRangeStyle.height / 2,
    borderRadius: 0,
    backgroundColor: theme.palette.background.miniTab,
    height: cutRangeStyle.borderWidth,

    '&::after': {
      position: 'absolute',
      top: cutRangeStyle.height - cutRangeStyle.borderWidth,
      backgroundColor: theme.palette.background.miniTab,
      width: '100%',
      height: cutRangeStyle.borderWidth,
      content: '""',
    },
  },

  valueLabel: {
    top: '100%',

    '& span': {
      ...theme.typography.subtitle2,
      transform: 'none',
      borderRadius: 0,
      background: 'none',
      color: theme.palette.grey[700],
    },
  },

  cutRangeThumb: {
    margin: 0,
    borderWidth: 0,
    backgroundColor: theme.palette.background.miniTab,
    height: cutRangeStyle.height,
    pointerEvents: 'auto',

    '&::after': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 0.26,
      borderRadius: 0,
      background: 'no-repeat',
      backgroundImage: process.browser
        ? `url(${imageType},${window.encodeURI(thumbBackgroundImage)})`
        : undefined,
      width: 6,
      height: 30,
      content: '""',
    },

    '&:nth-last-of-type(1)': {
      transform: 'translate(0, -50%)',
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    },

    '&:nth-last-of-type(1) > $valueLabel': {
      left: 0,
      transform: 'none',
    },

    '&:nth-last-of-type(1) > $valueLabel > span': {
      justifyContent: 'flex-start',
    },

    '&:nth-last-of-type(2)': {
      transform: 'translate(-100%, -50%)',
      borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    },

    '&:nth-last-of-type(2) > $valueLabel': {
      right: 0,
      transform: 'none',
    },

    '&:nth-last-of-type(2) > $valueLabel > span': {
      justifyContent: 'flex-end',
    },

    [`&:hover,
    &.Mui-focusVisible,
    &.MuiSlider-active`]: {
      boxShadow: 'none',
    },
  },
}));

const desiredTickCount = 13;
const littleTickCount = 1; // amount of little ticks between two normal ticks
const tickStepBreakpoint = msOfHour * 2;

interface CustomTickProps {
  value: number;
  labelType?: 'time' | 'dateTime';
  type?: 'little' | 'normal' | 'event';
}

const CustomTick: VoidFunctionComponent<CustomTickProps> = ({
  value,
  labelType,
  type = 'normal',
}: CustomTickProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('variables');

  return (
    <>
      <div
        className={clsx({
          [classes.normalTick]: type === 'normal',
          [classes.littleTick]: type === 'little',
          [classes.eventTick]: type === 'event',
        })}
      />
      {labelType && (
        <div className={classes.tickLabel}>
          <Typography variant="caption">
            {formatDate(value, t('dateFormat.common.hourMinute'))}
          </Typography>
          {labelType === 'dateTime' && (
            <Typography variant="caption">
              {formatDate(value, t('dateFormat.common.monthDay'))}
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

interface PlaybackVideoToolbarProps {
  from: number;
  to: number;
  deviceIds: string[];
  /** first number represent 'cut from', second number represent 'cut to' */
  cutRange?: CutRange;
  playbackTime?: number;
  cameraEvents?: CameraEventHistoryResponse['cameraEventHistory'];
  disableThumbnail?: boolean;
  onCutRangeChange?: (newCutRange: CutRange) => void;
  onSliderTimeChange?: (newTime: number) => void;
  onPlaybackTimeChange: (newTime: number) => void;
}

const PlaybackVideoToolbar: VoidFunctionComponent<PlaybackVideoToolbarProps> = ({
  from,
  to,
  deviceIds,
  cutRange,
  playbackTime,
  cameraEvents,
  disableThumbnail = false,
  onCutRangeChange,
  onSliderTimeChange,
  onPlaybackTimeChange,
}: PlaybackVideoToolbarProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { t } = useCommonTranslation('variables');

  const [sliderTime, setSliderTime] = useState(playbackTime || from);
  const [thumbnailTime, setThumbnailTime] = useState<number>();

  const sliderRef = useRef<HTMLElement | null>(null);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const target = event.currentTarget;
      if (target instanceof HTMLElement) {
        const { left: sliderLeft, width: sliderWidth } = target.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseTime = ((mouseX - sliderLeft) * (to - from)) / sliderWidth + from;
        setThumbnailTime(mouseTime);
      }
    },
    [from, to],
  );

  const onMouseLeave = useCallback(() => {
    setThumbnailTime(undefined);
  }, []);

  const handleSliderOnChange = useCallback(
    (_, newTime: number | number[]) => {
      if (isNumber(newTime)) {
        setSliderTime(newTime);
        if (onSliderTimeChange) onSliderTimeChange(newTime);
      }
    },
    [onSliderTimeChange],
  );

  const handleSliderOnChangeCommitted = useCallback(
    (_, newTime: number | number[]) => {
      if (isNumber(newTime)) onPlaybackTimeChange(newTime);
    },
    [onPlaybackTimeChange],
  );

  const handleCutRangeOnChange = useCallback(
    (_, newRange: number | number[]) => {
      if (!cutRange || !isCutRange(newRange) || !onCutRangeChange) return;
      if (newRange[0] === cutRange[0]) {
        onCutRangeChange([
          Math.max(newRange[0], newRange[1] - downloadDurationLimit * msOfMinute),
          newRange[1],
        ]);
      } else {
        onCutRangeChange([
          newRange[0],
          Math.min(newRange[1], newRange[0] + downloadDurationLimit * msOfMinute),
        ]);
      }
    },
    [cutRange, onCutRangeChange],
  );

  const valueLabelFormat = useCallback(
    (value: number) => formatDate(value, t('dateFormat.surveillance.cutRangeLabel')),
    [t],
  );

  const ticks: CustomTickProps[] = useMemo(() => {
    const initDuration = to - from;
    const baseStep = initDuration > tickStepBreakpoint ? msOfHour : msOfMinute * 10;
    const roundUpFrom = roundUpDate(
      from,
      initDuration > tickStepBreakpoint ? 'hour' : 'minute',
    ).getTime();
    const duration = to - roundUpFrom;
    const step = Math.ceil(duration / (baseStep * desiredTickCount)) * baseStep;
    const tickCount = duration / step + 1;
    const newTicks: CustomTickProps[] = [];
    let lastDateString: string | undefined;
    for (let i = 0; i < tickCount; i += 1) {
      const value = roundUpFrom + i * step;
      if (value > to) break;
      const isNormalTick = i % (littleTickCount + 1) === 0;
      const newDateString = new Date(value).toDateString();
      const newLabelType = lastDateString !== newDateString ? 'dateTime' : 'time';
      newTicks.push({
        value,
        type: isNormalTick ? 'normal' : 'little',
        ...omitUndefinedProps({ labelType: isNormalTick ? newLabelType : undefined }),
      });
      if (isNormalTick) {
        lastDateString = newDateString;
      }
    }
    return newTicks;
  }, [from, to]);

  const eventTicks: CustomTickProps[] = useMemo(
    () =>
      cameraEvents?.edges.map(({ node }) => ({
        value: node.time,
        type: 'event',
        showLabel: false,
      })) || [],
    [cameraEvents],
  );

  const combinedTicks: Mark[] = useMemo(() => {
    const combinedTickPropsList = cloneDeep(ticks);
    eventTicks.forEach((eventTick) => {
      const existedIdx = combinedTickPropsList.findIndex((tick) => tick.value === eventTick.value);
      if (existedIdx !== -1) {
        combinedTickPropsList[existedIdx].type = eventTick.type;
      } else {
        combinedTickPropsList.push({ ...eventTick });
      }
    });
    return combinedTickPropsList.map((tickProps) => ({
      value: tickProps.value,
      label: <CustomTick {...tickProps} />,
    }));
  }, [ticks, eventTicks]);

  useEffect(() => {
    if (playbackTime === undefined) return;
    setSliderTime(playbackTime);
  }, [playbackTime]);

  useEffect(() => {
    const sliderNode = sliderRef.current;
    if (!sliderNode) return () => {};

    sliderNode.addEventListener('mousemove', onMouseMove);
    sliderNode.addEventListener('mouseleave', onMouseLeave);

    return () => {
      sliderNode.removeEventListener('mousemove', onMouseMove);
      sliderNode.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseLeave, onMouseMove]);

  return (
    <div className={classes.root}>
      <div className={classes.sliderWrapper}>
        {!disableThumbnail && thumbnailTime !== undefined && (
          <VideoThumbnail
            from={from}
            to={to}
            deviceId={deviceIds[0]}
            thumbnailTime={Math.min(Math.max(thumbnailTime, from), to)}
          />
        )}
        <Slider
          ref={sliderRef}
          classes={{
            root: classes.slider,
            mark: hiddenClasses.hidden,
            markLabel: classes.markLabelRoot,
            markLabelActive: classes.markLabelRoot,
            rail: classes.rail,
            track: classes.track,
            thumb: classes.thumb,
          }}
          min={from}
          max={to}
          value={sliderTime}
          marks={combinedTicks}
          onChange={handleSliderOnChange}
          onChangeCommitted={handleSliderOnChangeCommitted}
        />
        {cutRange && (
          <Slider
            classes={{
              root: clsx(classes.slider, classes.cutRangeSlider),
              rail: hiddenClasses.hidden,
              track: classes.cutRangeTrack,
              thumb: classes.cutRangeThumb,
              valueLabel: classes.valueLabel,
            }}
            min={from}
            max={to}
            value={cutRange}
            valueLabelDisplay="on"
            valueLabelFormat={valueLabelFormat}
            onChange={handleCutRangeOnChange}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PlaybackVideoToolbar);
