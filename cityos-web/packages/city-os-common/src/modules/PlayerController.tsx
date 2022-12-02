import { makeStyles } from '@material-ui/core/styles';
import React, { MouseEvent, VoidFunctionComponent, useCallback } from 'react';

import Button from '@material-ui/core/Button';
import PauseIcon from '@material-ui/icons/PauseRounded';
import PlayIcon from '@material-ui/icons/PlayArrowRounded';
import Typography from '@material-ui/core/Typography';

import { fastBackwardSec, fastForwardSec, msOfSec } from '../libs/constants';
import formatDate from '../libs/formatDate';
import useCommonTranslation from '../hooks/useCommonTranslation';

import SkipNextIcon from '../assets/icon/skip-next.svg';
import SkipPrevIcon from '../assets/icon/skip-prev.svg';

const useStyles = makeStyles(() => ({
  playButton: {
    padding: 0,
    minWidth: 72,
    height: 42,

    '&:disabled': {
      borderWidth: 2,
    },
  },
}));

interface PlayerControllerProps {
  isPaused: boolean;
  /** in millisecond */
  currentTime: number | null;
  from: Date;
  to: Date;
  disabled?: boolean;
  togglePause: () => void;
  /** skipTime is in seconds */
  onSkip: (skipTime: number) => void;
}

const PlayerController: VoidFunctionComponent<PlayerControllerProps> = ({
  isPaused,
  currentTime,
  from,
  to,
  disabled = false,
  togglePause,
  onSkip,
}: PlayerControllerProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('variables');

  const handleSkip = useCallback(
    (skipTime: number) => (_event: MouseEvent<HTMLButtonElement>) => {
      onSkip(skipTime);
    },
    [onSkip],
  );

  return (
    <>
      {currentTime !== null && (
        <Typography variant="body1">
          {formatDate(currentTime, t('dateFormat.common.dateTime'))}
        </Typography>
      )}
      <Button
        variant="outlined"
        color="primary"
        className={classes.playButton}
        disabled={
          disabled ||
          (currentTime !== null && currentTime - fastBackwardSec * msOfSec < from.getTime())
        }
        onClick={handleSkip(-fastBackwardSec)}
      >
        <SkipPrevIcon />
      </Button>
      <Button
        variant="contained"
        color="primary"
        className={classes.playButton}
        disabled={disabled}
        onClick={togglePause}
      >
        {isPaused ? <PlayIcon /> : <PauseIcon />}
      </Button>
      <Button
        variant="outlined"
        color="primary"
        className={classes.playButton}
        disabled={
          disabled ||
          (currentTime !== null && currentTime + fastForwardSec * msOfSec > to.getTime())
        }
        onClick={handleSkip(fastForwardSec)}
      >
        <SkipNextIcon />
      </Button>
    </>
  );
};

export default PlayerController;
