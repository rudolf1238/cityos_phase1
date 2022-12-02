import { makeStyles } from '@material-ui/core/styles';
import React, {
  DetailedHTMLProps,
  ForwardRefRenderFunction,
  PropsWithChildren,
  ReactNode,
  Ref,
  VideoHTMLAttributes,
  forwardRef,
} from 'react';
import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';

import { ErrorType } from './type';
import useHiddenStyles from '../../styles/hidden';

import AspectRatio from '../AspectRatio';
import ErrorCameraIcon from '../../assets/icon/camera-unknown-error.svg';
import NoCameraResourceIcon from '../../assets/icon/camera-no-resource.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    backgroundColor: theme.palette.grey[100],

    '&:hover $showOnHover': {
      visibility: 'visible',
    },
  },

  showOnHover: {
    visibility: 'hidden',
  },

  roundedCorner: {
    borderRadius: theme.shape.borderRadius,
  },

  errorVideo: {
    visibility: 'hidden',
  },

  noVideo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  interactionLayer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
  },

  header: {
    overflow: 'hidden',
  },
}));

interface VideoPlayerBaseProps
  extends DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
  ratio?: number;
  isWaiting: boolean;
  errorType?: ErrorType;
  roundedCorner?: boolean;
  header?: ReactNode | ((classes: { showOnHover: string }) => ReactNode);
  classes?: {
    root?: string;
    video?: string;
    noVideo?: string;
    header?: string;
  };
}

const VideoPlayerBase: ForwardRefRenderFunction<HTMLVideoElement, VideoPlayerBaseProps> = (
  {
    ratio = 16 / 9,
    isWaiting,
    roundedCorner = false,
    errorType,
    classes: customClasses,
    header,
    children,
    ...props
  }: PropsWithChildren<VideoPlayerBaseProps>,
  ref: Ref<HTMLVideoElement>,
) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();

  return (
    <div
      className={clsx(
        classes.root,
        { [classes.roundedCorner]: roundedCorner },
        customClasses?.root,
      )}
    >
      <AspectRatio ratio={ratio}>
        <video
          {...props}
          ref={ref}
          muted
          className={clsx(
            { [classes.roundedCorner]: roundedCorner, [classes.errorVideo]: !!errorType },
            customClasses?.video,
          )}
        />
        <div
          className={clsx(
            classes.noVideo,
            {
              [hiddenClasses.hidden]: !errorType && !isWaiting,
              [classes.roundedCorner]: roundedCorner,
            },
            customClasses?.noVideo,
          )}
        >
          {errorType === ErrorType.NO_CAMERA_ID && <NoCameraResourceIcon />}
          {errorType === ErrorType.UNKNOWN_ERROR && <ErrorCameraIcon />}
          {!errorType && isWaiting && <CircularProgress />}
        </div>
        <div className={classes.interactionLayer}>
          <div className={clsx(classes.header, customClasses?.header)}>
            {typeof header === 'function' ? header({ showOnHover: classes.showOnHover }) : header}
          </div>
          {children}
        </div>
      </AspectRatio>
    </div>
  );
};

export default forwardRef<HTMLVideoElement, VideoPlayerBaseProps>(VideoPlayerBase);
