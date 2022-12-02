import { fade, makeStyles } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent, memo, useCallback, useState } from 'react';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';

import AspectRatio from './AspectRatio';
import FullPageIcon from '../assets/icon/full-page.svg';
import FullPageViewer from './FullPageViewer';

const useStyles = makeStyles((theme) => ({
  snapshot: {
    borderRadius: theme.shape.borderRadius,
    width: '100%',
  },

  smallSnapshot: {
    objectFit: 'cover',
  },

  clickableSnapshot: {
    cursor: 'pointer',
  },

  fullSnapshot: {
    maxHeight: 'calc(var(--vh) * 100)',
    objectFit: 'contain',
  },

  fullPageButton: {
    position: 'absolute',
    margin: 'auto 0 0 auto',
    borderWidth: 0,
    backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    width: 30,
    height: 30,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    },
  },

  rightTopButton: {
    top: theme.spacing(1.5),
    right: theme.spacing(1.5),
  },

  rightBottomButton: {
    right: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
  },
}));

interface SnapshotProps extends ComponentProps<'img'> {
  ratio?: number;
  buttonType?: 'iconButton' | 'button';
  iconButtonPlacement?: 'right-top' | 'right-bottom';
}

const Snapshot: VoidFunctionComponent<SnapshotProps> = ({
  src,
  alt,
  className,
  ratio = 16 / 9,
  buttonType = 'iconButton',
  iconButtonPlacement = 'right-bottom',
}: SnapshotProps) => {
  const classes = useStyles();
  const [isFullPage, setIsFullPage] = useState(false);

  const handleClose = useCallback(() => {
    setIsFullPage(false);
  }, []);

  return (
    <FullPageViewer isFullPage={isFullPage} onClose={handleClose}>
      {isFullPage ? (
        <img
          src={src}
          alt={alt}
          className={clsx(classes.snapshot, classes.fullSnapshot, className)}
        />
      ) : (
        <AspectRatio ratio={ratio}>
          <img
            src={src}
            alt={alt}
            className={clsx(
              classes.snapshot,
              classes.smallSnapshot,
              { [classes.clickableSnapshot]: buttonType === 'button' },
              className,
            )}
            /** aria-hidden for prevent ESLint error: click-events-have-key-events */
            aria-hidden="true"
            onClick={() => {
              if (buttonType === 'button') {
                setIsFullPage(true);
              }
            }}
          />
          {buttonType === 'iconButton' && (
            <IconButton
              size="small"
              color="primary"
              className={clsx(
                classes.fullPageButton,
                iconButtonPlacement === 'right-top'
                  ? classes.rightTopButton
                  : classes.rightBottomButton,
              )}
              onClick={() => setIsFullPage(true)}
            >
              <FullPageIcon />
            </IconButton>
          )}
        </AspectRatio>
      )}
    </FullPageViewer>
  );
};

export default memo(Snapshot);
