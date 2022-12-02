import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useCallback, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { isString } from 'city-os-common/libs/validators';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import Logo from 'city-os-common/modules/Logo';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';

import { LINE_BINDING, LineBindingPayload, LineBindingResponse } from '../api/lineBinding';
import useWebTranslation from '../hooks/useWebTranslation';

import ExclamationMarkImg from '../assets/img/exclamation-mark.svg';
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
    padding: theme.spacing(9, 4, 5),
    width: 'min(378px, 90vw)',
  },

  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(6),
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },

  button: {
    margin: theme.spacing(3, 'auto', 0),
    width: 'min(220px, 100%)',
  },

  failedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(5),
    alignItems: 'center',
  },

  failedTitle: {
    color: theme.palette.pageContainer.title,
  },

  failedText: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    textAlign: 'center',
  },
}));

const LineBinding: VoidFunctionComponent = () => {
  const router = useRouter();
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'login']);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LineBindingPayload>();

  const linkToken = isString(router.query.linkToken) ? router.query.linkToken : '';

  const [lineBinding, { error: lineBindingError, reset }] = useMutation<
    LineBindingResponse,
    LineBindingPayload
  >(LINE_BINDING, {
    onCompleted: ({ lineBinding: { nonce } }) => {
      window.location.href = `https://access.line.me/dialog/bot/accountLink?linkToken=${linkToken}&nonce=${nonce}`;
    },
  });

  const onSubmit = useCallback<SubmitHandler<LineBindingPayload>>(
    async ({ email, password }) => {
      try {
        await lineBinding({
          variables: {
            email,
            password,
          },
        });
      } catch (err) {
        if (D_DEBUG) {
          console.error(err);
        }
      }
    },
    [lineBinding],
  );

  const requireEmail = t('common:Email is required_');
  const requirePassword = t('common:Password is required_');

  useEffect(() => {
    if (!router.isReady) return;
    if (!linkToken) {
      void router.push('/404');
    }
  }, [linkToken, router]);

  if (!linkToken) return null;

  return (
    <BackgroundImage imageData={cityBackground} objectFit="cover">
      <PageWithFooter
        classes={{ root: classes.root, content: classes.pageContent, footer: classes.footer }}
      >
        <Paper className={classes.paper} elevation={3}>
          {isGqlError(lineBindingError, ErrorCode.AUTH_INVALID_PASSWORD) ? (
            <div className={classes.failedContent}>
              <ExclamationMarkImg />
              <div className={classes.failedText}>
                <Typography variant="h5" className={classes.failedTitle}>
                  {t('login:Login Failed')}
                </Typography>
                <Typography variant="body1">
                  {t('login:Email does not exist or password is invalid_')}
                </Typography>
              </div>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={() => {
                  reset();
                }}
              >
                {t('common:Try Again')}
              </Button>
            </div>
          ) : (
            <>
              <div className={classes.titleBlock}>
                <Logo />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
                <TextField
                  variant="outlined"
                  type="email"
                  label={t('common:Email')}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputLabelProps={{ shrink: true }}
                  inputProps={register('email', {
                    required: requireEmail,
                  })}
                />
                <TextField
                  variant="outlined"
                  type="password"
                  label={t('common:Password')}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputLabelProps={{ shrink: true }}
                  inputProps={register('password', {
                    required: requirePassword,
                  })}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  className={classes.button}
                >
                  {t('login:Binding')}
                </Button>
              </form>
            </>
          )}
        </Paper>
      </PageWithFooter>
    </BackgroundImage>
  );
};

export default memo(LineBinding);
