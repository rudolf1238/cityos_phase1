import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from '../reducers';
import ReducerActionType from '../reducers/actions';
import useCommonTranslation from '../hooks/useCommonTranslation';

import BaseDialog from './BaseDialog';

const useStyles = makeStyles((theme) => ({
  dialog: {
    maxWidth: 600,
  },

  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  leave: {
    marginTop: theme.spacing(10),
    padding: theme.spacing(1.5, 12.5),
  },
}));

const ExitDialog: VoidFunctionComponent = () => {
  const router = useRouter();
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const { dispatch, exitDialog } = useStore();
  const [to, setTo] = useState<string>('');

  const title = t('Leave without saving?');
  const message = t('Are you sure you wish to leave? Your changes will not be saved_');

  const handleOpenExitDialog = useCallback(() => {
    dispatch({
      type: ReducerActionType.ShowExitDialog,
      payload: {
        title,
        message,
      },
    });
  }, [dispatch, message, title]);

  const handleCloseExitDialog = useCallback(() => {
    dispatch({
      type: ReducerActionType.HideExitDialog,
    });
  }, [dispatch]);

  const handleLeave = useCallback(() => {
    handleCloseExitDialog();
    void router.push(to);
  }, [handleCloseExitDialog, router, to]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (exitDialog.disable) return;
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      event.returnValue = `${title}\n\n${message}`;
    },
    [exitDialog.disable, message, title],
  );

  const handleRouteChangeStart = useCallback(
    (url: string) => {
      if (exitDialog.disable) return;
      handleOpenExitDialog();
      setTo(url);
      router.events.emit('routeChangeError');
      // throw error to abort route changed because Next.js cannot abort by itself
      // throw string instead of Error object to avoid Error Window showing up in Debug mode
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'abort';
    },
    [exitDialog.disable, handleOpenExitDialog, router.events],
  );

  useEffect(() => {
    if (exitDialog.disable) return () => {};
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [exitDialog.disable, handleBeforeUnload]);

  useEffect(() => {
    if (exitDialog.disable) return () => {};
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [exitDialog.disable, handleRouteChangeStart, router.events]);

  return (
    <BaseDialog
      open={exitDialog.open}
      onClose={handleCloseExitDialog}
      title={title}
      classes={{ dialog: classes.dialog }}
      content={
        <div className={classes.wrapper}>
          <Typography variant="body1">{message}</Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.leave}
            onClick={handleLeave}
          >
            {t('Leave')}
          </Button>
        </div>
      }
    />
  );
};

export default ExitDialog;
