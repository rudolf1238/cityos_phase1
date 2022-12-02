import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import i18n from 'i18next';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ReCAPTCHA from 'react-google-recaptcha';
import TextField from '@material-ui/core/TextField';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';

import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import Logo from 'city-os-common/modules/Logo';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';

import { GET_USER_PROFILE, GetUserProfileResponse } from '../api/getUserProfile';
import { LOGIN, LoginPayload, LoginResponse } from '../api/login';
import useInitialRoute from '../hooks/useInitialRoute';
import useWebTranslation from '../hooks/useWebTranslation';

import cityBackground from '../assets/img/city-background.png';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'inherit',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(10, 8.5),
    width: 'min(540px, 90vw)',

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(5),
    },
  },

  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(6),

    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1),
    },
  },

  errorMsgBlock: {
    minHeight: theme.spacing(6.25),

    '& > .MuiAlert-root': {
      lineHeight: 1.5,
    },
  },

  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(5),
    textAlign: 'center',
  },

  buttonWrapper: {
    marginTop: theme.spacing(12),
    padding: theme.spacing(0, 6),

    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(0),
    },
  },

  loginButton: {
    padding: theme.spacing(2, 14),

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 0),
    },
  },

  forgotPassword: {
    margin: 'auto',
    padding: theme.spacing(1),
  },

  footer: {
    '& > p': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const Login: VoidFunctionComponent = () => {
  const router = useRouter();
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'login', 'password']);
  const {
    dispatch,
    user,
    userProfile: { permissionGroup },
  } = useStore();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginPayload['loginInput']>();
  const reCaptchaRef = useRef<ReCAPTCHA>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorized = !!user.email;

  const initialRoute = useInitialRoute();

  const { refetch: refetchUserProfile } = useQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    skip: !isAuthorized,
    onCompleted: (res) => {
      dispatch({
        type: ReducerActionType.SetProfile,
        payload: {
          profile: res.userProfile,
        },
      });
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error);
    },
  });

  const [login, { error: loginError }] = useMutation<LoginResponse, LoginPayload>(LOGIN);

  const onSubmit = useCallback<SubmitHandler<LoginPayload['loginInput']>>(
    async ({ email, password }) => {
      const reCaptchaValue = await reCaptchaRef.current?.executeAsync();
      if (!reCaptchaValue) return;
      setIsSubmitting(true);
      try {
        const { data } = await login({
          variables: {
            loginInput: {
              email,
              password,
            },
          },
          context: {
            headers: {
              recaptcha: reCaptchaValue,
            },
          },
        });
        if (data) {
          dispatch({
            type: ReducerActionType.UserLogin,
            payload: {
              email,
              refreshToken: data.login.refreshToken,
            },
          });
        }
        await refetchUserProfile();
      } catch (error) {
        if (D_DEBUG) {
          console.error(error);
        }
      }
      setIsSubmitting(false);
      reCaptchaRef.current?.reset();
    },
    [dispatch, login, refetchUserProfile],
  );

  const isAccountLocked = useMemo(
    () => isGqlError(loginError, ErrorCode.AUTH_EXCEED_RETRY_PASSWORD_MAXIMUM),
    [loginError],
  );

  useEffect(() => {
    if (isAuthorized) {
      let redirect = Array.isArray(router.query.redirect)
        ? router.query.redirect[0]
        : router.query.redirect;
      if (redirect && !redirect.startsWith('/')) {
        redirect = undefined;
      }
      if (!user.deviceToken) {
        void router.push({
          pathname: '/device-verification',
          query: redirect
            ? {
                redirect,
              }
            : undefined,
        });
      } else if (permissionGroup !== null) {
        // permissionGroup is undefined before getUserProfile, and is null if the user doesn't belong to any group
        void router.push(redirect || initialRoute);
      }
    }
  }, [router, isAuthorized, permissionGroup, user.deviceToken, initialRoute, user]);

  if (isAuthorized) {
    return null;
  }

  return (
    <PageWithFooter
      classes={{
        content: classes.content,
        footer: classes.footer,
      }}
    >
      <BackgroundImage imageData={cityBackground} objectFit="cover" className={classes.root}>
        <Paper className={classes.paper} elevation={3}>
          <div className={classes.titleBlock}>
            <Logo />
          </div>
          <div className={classes.errorMsgBlock}>
            {loginError && (
              <Alert
                severity="error"
                icon={<WarningRoundedIcon aria-label={t('common:warning')} fontSize="small" />}
              >
                {isAccountLocked
                  ? t('login:Account locked_ Please try again in 30 minutes_')
                  : t('login:Email does not exist or password is invalid_')}
              </Alert>
            )}
          </div>
          <form className={classes.loginForm} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              id={D_TEST ? 'email' : undefined}
              variant="outlined"
              type="email"
              label={t('common:Email')}
              fullWidth
              disabled={isSubmitting}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputLabelProps={{ shrink: true }}
              inputProps={register('email', {
                required: true,
              })}
            />
            <TextField
              id={D_TEST ? 'password' : undefined}
              variant="outlined"
              type="password"
              label={t('common:Password')}
              fullWidth
              disabled={isSubmitting}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputLabelProps={{ shrink: true }}
              inputProps={register('password', {
                required: true,
              })}
            />
            <div className={classes.buttonWrapper}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                className={classes.loginButton}
                size="large"
                fullWidth
              >
                {t('login:Log In')}
              </Button>
            </div>
            <ReCAPTCHA
              ref={reCaptchaRef}
              size="invisible"
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              hl={i18n.language}
            />
          </form>
          <Button
            variant="text"
            className={classes.forgotPassword}
            onClick={() => router.push('/forgot-password')}
          >
            {t('password:Forgot Password')}
          </Button>
        </Paper>
      </BackgroundImage>
    </PageWithFooter>
  );
};

export default Login;
