import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  ComponentProps,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import ButtonBase from '@material-ui/core/ButtonBase';
import InsertPhotoOutlinedIcon from '@material-ui/icons/InsertPhotoOutlined';
import Typography from '@material-ui/core/Typography';

import { Action, IDevice, Subject } from 'city-os-common/libs/schema';
import useCHTSnapshot from 'city-os-common/hooks/useCHTSnapshot';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import FullPageVideoPlayer from 'city-os-common/modules/videoPlayer/FullPageVideoPlayer';

import {
  GET_DEVICES_ON_EVENTS,
  GetDevicesOnEventsPayload,
  GetDevicesOnEventsResponse,
} from '../../api/getDevicesOnEvents';
import { minPerClip } from '../../libs/constants';

const useStyles = makeStyles((theme) => ({
  snapshotWrapper: {
    borderRadius: theme.shape.borderRadius,
    width: 100,
    height: 100,
  },

  snapshotWrapperSrc: {
    overflow: 'hidden',
  },

  snapshotPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.grey[100]}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.light,
    width: '100%',
    height: '100%',
  },

  photoIcon: {
    width: 34,
    height: 34,
    color: theme.palette.grey[100],
  },

  snapshot: {
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    objectFit: 'cover',
    minHeight: '100%',
  },

  playerHeader: {
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
  },

  name: {
    textOverflow: 'ellipsis',
    color: theme.palette.primary.contrastText,
    fontSize: 30,
  },
}));

interface SnapshotButtonProps extends ComponentProps<'img'> {
  onClick: () => void;
}

const SnapshotButton: VoidFunctionComponent<SnapshotButtonProps> = ({
  src,
  alt,
  onClick,
}: SnapshotButtonProps) => {
  const classes = useStyles();

  return (
    <ButtonBase
      className={clsx(classes.snapshotWrapper, { [classes.snapshotWrapperSrc]: src })}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className={classes.snapshot} />
      ) : (
        <div className={classes.snapshotPlaceholder}>
          <InsertPhotoOutlinedIcon className={classes.photoIcon} />
        </div>
      )}
    </ButtonBase>
  );
};

interface EventSnapshotProps {
  device: Pick<IDevice, 'deviceId' | 'name'>;
  /**  Date number in millisecond */
  initialTime: number;
  alt: string;
  url?: string;
}

const EventSnapshot: VoidFunctionComponent<EventSnapshotProps> = ({
  device,
  initialTime,
  alt,
  url,
}: EventSnapshotProps) => {
  const classes = useStyles();
  const enableDownload = useIsEnableRule({ subject: Subject.IVS_EVENTS, action: Action.EXPORT });

  const [isFullPage, setIsFullPage] = useState(false);

  const { data } = useQuery<GetDevicesOnEventsResponse, GetDevicesOnEventsPayload>(
    GET_DEVICES_ON_EVENTS,
    {
      skip: !device.deviceId,
      variables: {
        deviceIds: device.deviceId ? [device.deviceId] : [],
      },
    },
  );

  const projectKey = data?.getDevices?.[0]?.groups?.[0]?.projectKey || null;
  const imgSrc = useCHTSnapshot(projectKey, url);

  const handleToggleScreen = useCallback((newIsFullPage: boolean) => {
    setIsFullPage(newIsFullPage);
  }, []);

  const handleSnapShotButtonOnClick = useCallback(() => {
    setIsFullPage(true);
  }, []);

  const adjustedFrom = useMemo(() => {
    const fromTime = new Date(initialTime);
    const initialMinute = fromTime.getMinutes();
    fromTime.setMinutes(Math.floor(initialMinute / minPerClip) * minPerClip, 0, 0);
    return fromTime;
  }, [initialTime]);

  const adjustedTo = useMemo(() => {
    const toTime = new Date(adjustedFrom);
    toTime.setMinutes(toTime.getMinutes() + minPerClip - 1, 59, 999);
    return toTime;
  }, [adjustedFrom]);

  return isFullPage ? (
    <FullPageVideoPlayer
      device={device}
      from={adjustedFrom}
      to={adjustedTo}
      thumbnailTime={initialTime}
      enableDownload={enableDownload}
      onToggleScreen={handleToggleScreen}
      header={({ showOnHover }) => (
        <div className={classes.playerHeader}>
          <Typography variant="body1" noWrap className={clsx(classes.name, showOnHover)}>
            {device.name}
          </Typography>
        </div>
      )}
    />
  ) : (
    <SnapshotButton src={imgSrc} alt={alt} onClick={handleSnapShotButtonOnClick} />
  );
};

export default memo(EventSnapshot);
