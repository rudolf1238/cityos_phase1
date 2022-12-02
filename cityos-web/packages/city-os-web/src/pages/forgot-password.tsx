import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import ReCAPTCHA from 'react-google-recaptcha';
import React, { VoidFunctionComponent, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import i18n from 'i18next';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';
import PaperWrapper from 'city-os-common/modules/PaperWrapper';

import {
  FORGOT_PASSWORD,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
} from '../api/forgotPassword';
import useWebTranslation from '../hooks/useWebTranslation';

import cityBackground from '../assets/img/city-background.png';

const valueAsStrippedString = (v: unknown) => (isString(v) ? v.trim() : '');

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 'calc(var(--vh) * 100)',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitPaper: {
    padding: theme.spacing(4, 15, 7),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4, 6, 7),
    },
  },

  resetPaper: {
    padding: theme.spacing(4.5, 12, 5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4.5, 6, 5),
    },
  },

  resetTitle: {
    marginBottom: theme.spacing(4.5),
  },

  buttonWrapper: {
    padding: theme.spacing(8, 5.5, 0),
  },

  button: {
    padding: theme.spacing(2, 10),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 5),
    },
  },

  footer: {
    '& > p': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'password']);
  const router = useRouter();
  const { dispatch } = useStore();

  const [openResetMessage, setOpenResetMessage] = useState<boolean>(false);
  const isMountedRef = useIsMountedRef();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleError = useCallback(
    (error: Error) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Something went wrong_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    },
    [dispatch, t],
  );

  const [forgotPassword] = useMutation<ForgotPasswordResponse, ForgotPasswordPayload>(
    FORGOT_PASSWORD,
    {
      onCompleted: (data) => {
        if (data.forgotPassword && isMountedRef.current) {
          setOpenResetMessage(true);
        } else {
          handleError(new Error('Unknown error'));
        }
      },
      onError: (error) => {
        handleError(error);
      },
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onChange',
  });

  const onSubmit = useCallback<SubmitHandler<ForgotPasswordFormData>>(
    async ({ email }) => {
      const recaptchaValue = await recaptchaRef.current?.executeAsync();
      if (!recaptchaValue) return;
      await forgotPassword({
        variables: {
          email,
        },
        context: {
          headers: {
            recaptcha: recaptchaValue,
          },
        },
      });
      recaptchaRef.current?.reset();
    },
    [forgotPassword],
  );

  const handleBackLogin = useCallback(() => {
    void router.push('/login');
  }, [router]);

  const requireEmail = t('common:Email is required_');

  return (
    <BackgroundImage imageData={cityBackground} objectFit="cover">
      <PageWithFooter
        classes={{
          root: classes.root,
          content: classes.content,
          footer: classes.footer,
        }}
      >
        <PaperWrapper
          title={
            openResetMessage
              ? t('password:Your password reset link is on its way_')
              : t('password:Enter your email to reset your password')
          }
          message={
            openResetMessage
              ? t(
                  "password:If an account with that email address exists and has been activated, you’ll soon get an email with your password reset link_ If it doesn't arrive, be sure to check your spam folder_",
                )
              : ''
          }
          actionText={openResetMessage ? t('password:Back to Log In') : undefined}
          onAction={handleBackLogin}
          classes={{
            paper: openResetMessage ? classes.resetPaper : classes.submitPaper,
            title: clsx({ [classes.resetTitle]: openResetMessage }),
          }}
        >
          {openResetMessage || (
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                id="email"
                variant="outlined"
                type="email"
                label={t('common:Email')}
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{ shrink: true }}
                inputProps={register('email', {
                  required: requireEmail,
                  setValueAs: valueAsStrippedString,
                })}
              />
              <div className={classes.buttonWrapper}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  size="large"
                  fullWidth
                  disabled={!isValid}
                >
                  {t('password:Reset password')}
                </Button>
              </div>
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                hl={i18n.language}
              />
            </form>
          )}
        </PaperWrapper>
      </PageWithFooter>
    </BackgroundImage>
  );
};

export default ForgotPassword;
