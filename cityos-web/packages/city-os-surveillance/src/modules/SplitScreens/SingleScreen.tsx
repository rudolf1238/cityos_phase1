import { fade, makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  CSSProperties,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import { Action, IDevice, Subject } from 'city-os-common/libs/schema';
import useHiddenStyles from 'city-os-common/styles/hidden';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import FullPageVideoPlayer from 'city-os-common/modules/videoPlayer/FullPageVideoPlayer';
import LiveStreamPlayer from 'city-os-common/modules/videoPlayer/LiveStreamPlayer';

import {
  GET_DEVICES_ON_SURVEILLANCE,
  GetDevicesOnSurveillancePayload,
  GetDevicesOnSurveillanceResponse,
} from '../../api/getDevicesOnSurveillance';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useAnimationStyles from '../../styles/animation';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';

import PinIcon from '../../assets/icon/pin.svg';
import VideoPlayer from './VideoPlayer';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    border: `4px solid ${theme.palette.background.container}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.background.light,
    width: '100%',
  },

  warning: {
    borderColor: theme.palette.gadget.alarm,
  },

  playerHeader: {
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
  },

  orderLabel: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    width: 24,
    height: 24,
    color: theme.palette.primary.contrastText,
  },

  biggerOrderLabel: {
    width: 48,
    height: 48,
    fontSize: 30,
  },

  name: {
    textOverflow: 'ellipsis',
    color: theme.palette.primary.contrastText,
  },

  biggerLabel: {
    fontSize: 30,
  },

  noVideo: {
    border: 0,
    backgroundColor: theme.palette.grey[100],
  },

  noDataRoot: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1.5),

    '&:hover $showOnHover': {
      visibility: 'visible',
    },
  },

  showOnHover: {
    visibility: 'hidden',
  },

  noDataLabel: {
    display: 'flex',
    gap: theme.spacing(1),
  },

  iconButton: {
    marginLeft: 'auto',
    borderWidth: 0,
    backgroundColor: fade(theme.palette.primary.contrastText, 0.7),
    width: 30,
    height: 30,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: fade(theme.palette.primary.contrastText, 0.7),
    },
  },

  pinIcon: {
    width: 12,
    color: fade(theme.palette.gadget.dark, 0.12),
  },

  pinIconSelected: {
    color: theme.palette.primary.main,
  },
}));

interface PlayerProps {
  device: Pick<IDevice, 'deviceId' | 'name'>;
  selectedLabel: string;
  isLeader: boolean;
  isFixed: boolean;
  isHidden?: boolean;
  onToggleFixed?: () => void;
}

const Player: VoidFunctionComponent<PlayerProps> = memo(
  ({ device, selectedLabel, isLeader, isFixed, isHidden, onToggleFixed }: PlayerProps) => {
    const classes = useStyles();
    const hiddenClasses = useHiddenStyles();
    const enableDownload = useIsEnableRule({
      subject: Subject.IVS_SURVEILLANCE,
      action: Action.EXPORT,
    });

    const { playbackRange, playbackTime } = useSurveillanceContext();

    const [showFullPage, setShowFullPage] = useState(false);
    const [frozenTime, setFrozenTime] = useState<number | null>(null);

    const handleToggleScreen = useCallback(
      (isFullPage: boolean) => {
        setShowFullPage(isFullPage);
        if (isFullPage) {
          setFrozenTime(playbackTime);
        }
      },
      [playbackTime],
    );

    const renderLiveStreamHeader = useCallback(
      (headerClasses: { showOnHover: string }) => (
        <div className={classes.playerHeader}>
          <Typography
            variant="subtitle2"
            className={clsx(classes.orderLabel, { [classes.biggerOrderLabel]: showFullPage })}
          >
            {selectedLabel}
          </Typography>
          <Typography
            variant="body1"
            noWrap
            className={clsx(classes.name, headerClasses.showOnHover, {
              [classes.biggerLabel]: showFullPage,
            })}
          >
            {device.name}
          </Typography>
          <IconButton
            size="small"
            className={clsx(classes.iconButton, { [hiddenClasses.hidden]: showFullPage })}
            onClick={onToggleFixed}
          >
            <PinIcon
              className={clsx(classes.pinIcon, {
                [classes.pinIconSelected]: isFixed,
              })}
            />
          </IconButton>
        </div>
      ),
      [
        device.name,
        isFixed,
        selectedLabel,
        classes,
        showFullPage,
        hiddenClasses.hidden,
        onToggleFixed,
      ],
    );

    const renderFullVideoHeader = useCallback(
      (headerClasses: { showOnHover: string }) => (
        <div className={classes.playerHeader}>
          <Typography
            variant="subtitle2"
            className={clsx(classes.orderLabel, classes.biggerOrderLabel)}
          >
            {selectedLabel}
          </Typography>
          <Typography
            variant="body1"
            noWrap
            className={clsx(classes.name, classes.biggerLabel, headerClasses.showOnHover)}
          >
            {device.name}
          </Typography>
        </div>
      ),
      [device.name, selectedLabel, classes],
    );

    const renderVideoHeader = useCallback(
      (headerClasses: { showOnHover: string }) => (
        <div className={classes.playerHeader}>
          <Typography variant="subtitle2" className={classes.orderLabel}>
            {selectedLabel}
          </Typography>
          <Typography
            variant="body1"
            noWrap
            className={clsx(classes.name, headerClasses.showOnHover)}
          >
            {device.name}
          </Typography>
          <IconButton size="small" className={classes.iconButton} onClick={onToggleFixed}>
            <PinIcon
              className={clsx(classes.pinIcon, {
                [classes.pinIconSelected]: isFixed,
              })}
            />
          </IconButton>
        </div>
      ),
      [device.name, isFixed, selectedLabel, classes, onToggleFixed],
    );

    useEffect(() => {
      if (isHidden) setShowFullPage(false);
    }, [isHidden]);

    if (!playbackRange) {
      return (
        <LiveStreamPlayer
          device={device}
          roundedCorner
          isControllable
          enableFullPage
          isFullPage={showFullPage}
          classes={{ noVideo: classes.noVideo }}
          onToggleScreen={handleToggleScreen}
          header={renderLiveStreamHeader}
        />
      );
    }
    if (playbackTime === null) return null;
    return (
      <>
        {showFullPage && frozenTime && (
          <FullPageVideoPlayer
            device={device}
            from={playbackRange.from}
            to={playbackRange.to}
            onToggleScreen={handleToggleScreen}
            thumbnailTime={frozenTime}
            enableDownload={enableDownload}
            header={renderFullVideoHeader}
          />
        )}
        <VideoPlayer
          device={device}
          from={playbackRange.from}
          to={playbackRange.to}
          playbackTime={playbackTime}
          enableUpdateTime={isLeader}
          onToggleScreen={handleToggleScreen}
          header={renderVideoHeader}
        />
      </>
    );
  },
);

interface SingleScreenProps {
  deviceId?: string;
  selectedLabel: string;
  isLeader?: boolean;
  isFixed?: boolean;
  isHidden?: boolean;
  detectedEvent?: 'highlight' | 'warning';
  className?: string;
  style?: CSSProperties | undefined;
  onToggleFixed?: () => void;
}

const SingleScreen: VoidFunctionComponent<SingleScreenProps> = ({
  deviceId,
  selectedLabel,
  isLeader = false,
  isFixed = false,
  isHidden,
  detectedEvent,
  className,
  style,
  onToggleFixed,
}: SingleScreenProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const animationClasses = useAnimationStyles();
  const { t } = useSurveillanceTranslation('surveillance');

  const { data } = useQuery<GetDevicesOnSurveillanceResponse, GetDevicesOnSurveillancePayload>(
    GET_DEVICES_ON_SURVEILLANCE,
    {
      variables: {
        deviceIds: deviceId ? [deviceId] : [],
      },
      skip: !deviceId,
    },
  );

  const device = data?.getDevices?.[0];

  return (
    <div
      className={clsx(
        classes.root,
        {
          [animationClasses.highlight]: device && detectedEvent === 'highlight',
          [classes.warning]: device && detectedEvent === 'warning',
          [hiddenClasses.hidden]: isHidden,
        },
        className,
      )}
      style={style}
    >
      {device ? (
        <Player
          device={device}
          selectedLabel={selectedLabel}
          isLeader={isLeader}
          isFixed={isFixed}
          isHidden={isHidden}
          onToggleFixed={onToggleFixed}
        />
      ) : (
        <AspectRatio ratio={16 / 9}>
          <div className={classes.noDataRoot}>
            <div className={classes.noDataLabel}>
              <Typography variant="subtitle2" className={classes.orderLabel}>
                {selectedLabel}
              </Typography>
              <Typography
                variant="body1"
                noWrap
                className={clsx(classes.name, classes.showOnHover)}
              >
                {t('No Data')}
              </Typography>
            </div>
          </div>
        </AspectRatio>
      )}
    </div>
  );
};

export default memo(SingleScreen);
