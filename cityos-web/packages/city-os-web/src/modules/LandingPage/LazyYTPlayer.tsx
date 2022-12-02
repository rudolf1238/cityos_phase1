import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import Image from 'next/image';
import Typography from '@material-ui/core/Typography';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeOnIcon from '@material-ui/icons/VolumeUp';

import AspectRatio from 'city-os-common/modules/AspectRatio';

import useOnScreen from '../../hooks/useOnScreen';

import YTPlayer from './YTPlayer';

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.contrastText,

    '& > h1': {
      maxWidth: 750,
    },
  },

  player: {
    position: 'absolute',
    overflow: 'hidden',

    '& > div': {
      height: '100%',
    },

    '& iframe': {
      marginLeft: '-100%',
      // force youtube toolbar to be out of window
      width: '300%',
      height: '100%',
      // disable youtube control bar
      pointerEvents: 'none',
    },
  },

  muteButton: {
    position: 'absolute',
    right: theme.spacing(7),
    bottom: theme.spacing(7),
    borderColor: theme.palette.primary.contrastText,
    color: theme.palette.primary.contrastText,

    '&:hover': {
      backgroundColor: fade(theme.palette.primary.contrastText, 0.3),
    },

    [theme.breakpoints.down('md')]: {
      right: theme.spacing(4),
      bottom: theme.spacing(4),
    },

    [theme.breakpoints.down('xs')]: {
      right: theme.spacing(2),
      bottom: theme.spacing(2),
    },
  },
}));

interface LazyYTPlayerProps {
  videoId: string;
  title?: string;
  backgroundImage?: StaticImageData;
  imagePriority?: boolean;
}

const LazyYTPlayer: VoidFunctionComponent<LazyYTPlayerProps> = ({
  videoId,
  title,
  backgroundImage,
  imagePriority,
}: LazyYTPlayerProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);

  const isOnScreen = useOnScreen(rootRef);

  const handleMuteToggle = useCallback(() => {
    if (playerRef.current && isReady) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [isMuted, isReady]);

  const playerOptions: YT.PlayerOptions = useMemo(
    () => ({
      events: {
        onStateChange: (event) => {
          const playerState = event.data;
          if (playerState === YT.PlayerState.PLAYING) setIsPlaying(true);
        },
        onReady: () => {
          setIsReady(true);
        },
      },
    }),
    [],
  );

  useEffect(() => {
    if (
      isOnScreen &&
      isReady &&
      playerRef.current &&
      playerRef.current.getPlayerState() !== YT.PlayerState.PLAYING
    ) {
      playerRef.current.playVideo();
    }
  }, [videoId, isOnScreen, isReady]);

  return (
    <AspectRatio ratio={16 / 9} disabledMaxWidth>
      {backgroundImage && (
        <Image layout="fill" objectFit="cover" src={backgroundImage} priority={imagePriority} />
      )}
      {title && (
        <div className={classes.title}>
          <Typography variant={xsDown ? 'h5' : 'h1'} align="center" color="inherit">
            {title}
          </Typography>
        </div>
      )}
      <Fade in={isPlaying} timeout={1500}>
        <div className={classes.player} ref={rootRef}>
          <YTPlayer ref={playerRef} videoId={videoId} playerOptions={playerOptions} />
          <IconButton size="small" className={classes.muteButton} onClick={handleMuteToggle}>
            {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeOnIcon fontSize="small" />}
          </IconButton>
        </div>
      </Fade>
    </AspectRatio>
  );
};

export default memo(LazyYTPlayer);
