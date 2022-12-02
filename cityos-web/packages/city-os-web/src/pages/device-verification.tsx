import { Trans } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useSubscription } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';

import Image from 'next/image';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';
import PaperWrapper from 'city-os-common/modules/PaperWrapper';

import { DEVICE_BINDING, DeviceBindingPayload, DeviceBindingResponse } from '../api/deviceBinding';
import {
  SUBSCRIBE_DEVICE_TOKEN,
  SubscribeDeviceTokenPayload,
  SubscribeDeviceTokenResponse,
} from '../api/subscribeDeviceToken';
import useInitialRoute from '../hooks/useInitialRoute';
import useWebTranslation from '../hooks/useWebTranslation';

import cityOSBackground from '../assets/img/city-background.png';
import loadingIconDark from '../assets/logo/loading-dark.gif';

const useStyles = makeStyles((theme) => ({
  cityBackground: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 'calc(var(--vh) * 100)',
  },

  root: {
    minHeight: 'calc(var(--vh) * 100)',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paper: {
    padding: 0,
    maxWidth: 748,
    overflow: 'hidden',
  },

  loadingBackground: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.landingPage.main,
    height: 386,
    color: theme.palette.landingPage.contrastText,

    [theme.breakpoints.down('xs')]: {
      gap: theme.spacing(2),
      height: 300,
    },
  },

  sendLink: {
    paddingTop: theme.spacing(2),
  },

  resend: {
    cursor: 'pointer',
  },

  footer: {
    '& > p': {
      color: theme.palette.primary.contrastText,
    },
  },

  textWrapper: {
    padding: theme.spacing(1.5, 11, 5),

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1.5, 4, 2),
    },
  },

  emphasisText: {
    color: theme.palette.error.main,
  },
}));

const DeviceVerification: VoidFunctionComponent = () => {
  const classes = useStyles();
  const {
    user,
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const { t } = useWebTranslation(['login', 'common']);
  const router = useRouter();
  const isSent = useRef(false);

  const isAuthorized = !!user.email;

  const initialRoute = useInitialRoute();

  const [deviceBinding, { loading }] = useMutation<DeviceBindingResponse, DeviceBindingPayload>(
    DEVICE_BINDING,
  );
  useSubscription<SubscribeDeviceTokenResponse, SubscribeDeviceTokenPayload>(
    SUBSCRIBE_DEVICE_TOKEN,
    {
      shouldResubscribe: !user.deviceToken && !!user.refreshToken,
      variables: { refreshToken: user.refreshToken || '' },
      onSubscriptionData: ({ subscriptionData: { data } }) => {
        if (data?.listenVerifyStatusChanged.deviceToken) {
          dispatch({
            type: ReducerActionType.SetDeviceToken,
            payload: {
              deviceToken: data?.listenVerifyStatusChanged.deviceToken,
            },
          });
        }
      },
    },
  );

  const handleDeviceBinding = useCallback(() => {
    if (!user.refreshToken) return;

    void deviceBinding({
      variables: {
        refreshToken: user.refreshToken,
      },
    });
  }, [deviceBinding, user.refreshToken]);

  useEffect(() => {
    const redirect = Array.isArray(router.query.redirect)
      ? router.query.redirect[0]
      : router.query.redirect;
    if (!isAuthorized) {
      void router.push({
        pathname: '/login',
        query: redirect?.startsWith('/')
          ? {
              redirect,
            }
          : undefined,
      });
    } else if (user.deviceToken && permissionGroup !== null) {
      void router.push(redirect || initialRoute);
    } else if (!isSent.current) {
      void handleDeviceBinding();
      isSent.current = true;
    }
  }, [handleDeviceBinding, initialRoute, isAuthorized, permissionGroup, router, user.deviceToken]);

  if (!isAuthorized || user.deviceToken) {
    return null;
  }

  return (
    <BackgroundImage
      className={classes.cityBackground}
      imageData={cityOSBackground}
      objectFit="cover"
    >
      <PageWithFooter
        classes={{
          root: classes.root,
          content: classes.content,
          footer: classes.footer,
        }}
      >
        <PaperWrapper classes={{ paper: classes.paper }}>
          <div className={classes.loadingBackground}>
            <Image src={loadingIconDark} width={140} height={140} alt={t('common:Loading')} />
            <Typography variant="h4" align="center">
              {t('login:DO NOT close this window_')}
            </Typography>
          </div>
          <div className={classes.textWrapper}>
            <Typography variant="h6">
              <Trans
                t={t}
                i18nKey="login:Please click the login verification link we’ve just sent to your email inbox_ <1>DO NOT close this window,</1> access will be granted upon login verification_"
              >
                {'Please click the login verification link we’ve just sent to your email inbox_ '}
                <span className={classes.emphasisText}> DO NOT close this window,</span>
                {' access will be granted upon login verification_'}
              </Trans>
            </Typography>
            <Typography
              variant="h6"
              color={loading ? 'textPrimary' : 'primary'}
              align="center"
              className={clsx(classes.sendLink, { [classes.resend]: !loading })}
              onClick={handleDeviceBinding}
            >
              {loading ? t('login:Email sent') : t('login:Resend email')}
            </Typography>
          </div>
        </PaperWrapper>
      </PageWithFooter>
    </BackgroundImage>
  );
};

export default DeviceVerification;
