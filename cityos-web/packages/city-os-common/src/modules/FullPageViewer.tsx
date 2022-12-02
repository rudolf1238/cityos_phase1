import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import clsx from 'clsx';

import CloseIcon from '@material-ui/icons/Close';

import ThemeIconButton from './ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    display: 'flex',
    position: 'fixed',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100vw',
    height: 'calc(var(--vh) * 100)',
  },

  wrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '100%',
    maxHeight: '100%',
  },

  smallWrapper: {
    position: 'relative',
  },

  close: {
    position: 'absolute',
    top: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
  },
}));

interface FullPageViewerProps {
  isFullPage: boolean;
  disabled?: boolean;
  onClose: () => void;
}

const FullPageViewer: FunctionComponent<FullPageViewerProps> = ({
  isFullPage,
  disabled = false,
  children,
  onClose,
}: PropsWithChildren<FullPageViewerProps>) => {
  const classes = useStyles();

  return (
    <div className={clsx({ [classes.backdrop]: !disabled && isFullPage })}>
      <div className={clsx(classes.wrapper, { [classes.smallWrapper]: !isFullPage })}>
        {children}
        {!disabled && isFullPage && (
          <ThemeIconButton
            size="small"
            color="primary"
            variant="miner"
            className={classes.close}
            onClick={onClose}
          >
            <CloseIcon />
          </ThemeIconButton>
        )}
      </div>
    </div>
  );
};

export default FullPageViewer;
