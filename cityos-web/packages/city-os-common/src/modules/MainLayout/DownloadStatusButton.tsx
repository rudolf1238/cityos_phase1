import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import CloseIcon from '@material-ui/icons/Close';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';

import { useStore } from '../../reducers';
import useCommonTranslation from '../../hooks/useCommonTranslation';

import BaseDialog from '../BaseDialog';
import DeleteIcon from '../../assets/icon/delete.svg';
import DownloadIcon from '../DownloadIcon';
import ReducerActionType from '../../reducers/actions';
import ThemeIconButton from '../ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  rootButton: {
    borderWidth: 0,
    borderRadius: theme.shape.borderRadius * 6,
    backgroundColor: theme.palette.secondary.main,
    width: 44,
    height: 30,
    color: theme.palette.secondary.contrastText,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  '@keyframes downloading': {
    from: {
      d: 'path("M1.5 20 H0")',
    },

    to: {
      d: 'path("M1.5 20 H21.5")',
    },
  },

  popper: {
    zIndex: theme.zIndex.modal,
    marginTop: theme.spacing(1),
  },

  popperContent: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.warning.contrastText,
    padding: theme.spacing(1.5, 1.5, 1, 2),
    minWidth: 270,
    color: theme.palette.primary.contrastText,
  },

  popperTitle: {
    color: theme.palette.text.hint,
  },

  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    width: 'auto',
    height: 'auto',

    '& svg': {
      width: 20,
      height: 20,
    },
  },

  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },

  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },

  statusInfoWrapper: {
    display: 'flex',
  },

  statusText: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  statusProgressWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  progress: {
    flex: 1,
    height: 4,
  },

  progressText: {
    minWidth: 44,
    textAlign: 'right',
  },

  bar1Determinate: {
    transition: 'none',
  },

  statusCancelButton: {
    margin: 'auto',
    width: 28,
    height: 28,
  },

  cancelDialog: {
    width: 'min(600px, 90vw)',
  },

  cancelDialogButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    marginTop: theme.spacing(6),
  },
}));

interface DownloadStatusButtonProps {
  className?: string;
}

const DownloadStatusButton: VoidFunctionComponent<DownloadStatusButtonProps> = ({
  className,
}: DownloadStatusButtonProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { download, dispatch } = useStore();

  const [openPopper, setOpenPopper] = useState(false);
  const [downloadId, setDownloadId] = useState<string>();

  const handleOpenPopper = useCallback(() => {
    setOpenPopper(true);
  }, []);

  const handleClosePopper = useCallback(() => {
    setOpenPopper(false);
  }, []);

  const handleOpenCancelDialog = useCallback(
    (id: string) => () => {
      setDownloadId(id);
    },
    [],
  );

  const handleCloseCancelDialog = useCallback(() => {
    setDownloadId(undefined);
  }, []);

  const handleCancel = useCallback(() => {
    handleCloseCancelDialog();
    if (downloadId === undefined) return;
    dispatch({
      type: ReducerActionType.CancelDownload,
      payload: {
        id: downloadId,
      },
    });
  }, [downloadId, dispatch, handleCloseCancelDialog]);

  return (
    <>
      <IconButton
        ref={anchorRef}
        className={clsx(classes.rootButton, className)}
        onClick={handleOpenPopper}
      >
        <DownloadIcon animated />
      </IconButton>
      <Popper
        placement="bottom-end"
        open={openPopper}
        anchorEl={anchorRef.current}
        className={classes.popper}
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClosePopper}>
            <Grow {...TransitionProps}>
              <div className={classes.popperContent}>
                <ThemeIconButton
                  color="primary"
                  aria-label={t('Close')}
                  size="small"
                  variant="miner"
                  className={classes.closeButton}
                  onClick={handleClosePopper}
                >
                  <CloseIcon />
                </ThemeIconButton>
                <Typography variant="overline" className={classes.popperTitle}>
                  {t('Download preparing...')}
                </Typography>
                <div className={classes.statusList}>
                  {Object.entries(download).map(([id, { progress, title, subtitle }]) => (
                    <div key={id} className={classes.statusItem}>
                      <div className={classes.statusInfoWrapper}>
                        <div className={classes.statusText}>
                          <Typography variant="body2">{title}</Typography>
                          <Typography variant="body2">{subtitle}</Typography>
                        </div>
                        <ThemeIconButton
                          aria-label={t('Cancel')}
                          color="primary"
                          size="small"
                          variant="miner"
                          className={classes.statusCancelButton}
                          onClick={handleOpenCancelDialog(id)}
                        >
                          <DeleteIcon />
                        </ThemeIconButton>
                      </div>
                      <div className={classes.statusProgressWrapper}>
                        <LinearProgress
                          variant="determinate"
                          color="secondary"
                          value={progress}
                          classes={{
                            root: classes.progress,
                            bar1Determinate: classes.bar1Determinate,
                          }}
                        />
                        <Typography variant="subtitle1" className={classes.progressText}>
                          {progress}%
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Grow>
          </ClickAwayListener>
        )}
      </Popper>
      <BaseDialog
        open={downloadId !== undefined}
        onClose={handleCloseCancelDialog}
        title={t('Are you sure you want to delete this download processing?')}
        classes={{ dialog: classes.cancelDialog }}
        content={
          <>
            <Typography variant="body1" align="left">
              {t(
                'This operation will delete the downloading process_ Are you sure you want to delete this download?',
              )}
            </Typography>
            <div className={classes.cancelDialogButtons}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={handleCloseCancelDialog}
              >
                {t('No, keep it_')}
              </Button>
              <Button variant="contained" size="small" color="primary" onClick={handleCancel}>
                {t('Yes, delete it_')}
              </Button>
            </div>
          </>
        }
      />
    </>
  );
};

export default memo(DownloadStatusButton);
