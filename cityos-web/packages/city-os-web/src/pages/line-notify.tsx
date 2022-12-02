import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useEffect, useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { isString } from 'city-os-common/libs/validators';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import Loading from 'city-os-common/modules/Loading';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';

import {
  LINE_NOTIFY_BINDING,
  LineNotifyBindingPayload,
  LineNotifyBindingResponse,
} from '../api/lineNotifyBinding';
import useWebTranslation from '../hooks/useWebTranslation';

import ExclamationMarkImg from '../assets/img/exclamation-mark.svg';
import SuccessfulImg from '../assets/img/verification-successful.svg';
import cityBackground from '../assets/img/city-background.png';

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    minHeight: 'calc(var(--vh) * 100)',
  },

  pageContent: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },

  footer: {
    '& > p': {
      color: theme.palette.primary.contrastText,
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(11.5, 4, 14),
    width: 'min(360px, 90vw)',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
    alignItems: 'center',
  },

  title: {
    color: theme.palette.pageContainer.title,
  },

  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    textAlign: 'center',
  },
}));

const LineNotify: VoidFunctionComponent = () => {
  const router = useRouter();
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'verify']);

  const code = isString(router.query.code) ? router.query.code : '';
  const state = isString(router.query.state) ? router.query.state : '';

  const [isBinding, setIsBinding] = useState<boolean | undefined>();

  const [lineNotifyBinding] = useMutation<LineNotifyBindingResponse, LineNotifyBindingPayload>(
    LINE_NOTIFY_BINDING,
    {
      onCompleted: ({ lineNotifyBinding: isSuccessful }) => {
        setIsBinding(!!isSuccessful);
      },
      onError: (error) => {
        setIsBinding(false);
        if (D_DEBUG) {
          console.error(error);
        }
      },
    },
  );

  useEffect(() => {
    if (!code || !state) return;
    void lineNotifyBinding({
      variables: {
        code,
        state,
      },
    });
  }, [code, lineNotifyBinding, state]);

  return (
    <BackgroundImage imageData={cityBackground} objectFit="cover">
      <PageWithFooter
        classes={{ root: classes.root, content: classes.pageContent, footer: classes.footer }}
      >
        {isBinding === undefined ? (
          <Loading open />
        ) : (
          <Paper className={classes.paper} elevation={3}>
            <div className={classes.content}>
              {isBinding ? <SuccessfulImg /> : <ExclamationMarkImg />}
              <div className={classes.text}>
                <Typography variant="h5" className={classes.title}>
                  {isBinding ? t('verify:Connection Successful') : t('verify:Connection Failed')}
                </Typography>
                <Typography variant="body1">
                  {isBinding
                    ? t('verify:LINE Notify connected successfully_')
                    : t('verify:LINE Notify failed to connect_')}
                </Typography>
              </div>
            </div>
          </Paper>
        )}
      </PageWithFooter>
    </BackgroundImage>
  );
};

export default memo(LineNotify);
