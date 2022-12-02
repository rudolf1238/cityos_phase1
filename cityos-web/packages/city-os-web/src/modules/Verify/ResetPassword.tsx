import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import PaperWrapper from 'city-os-common/modules/PaperWrapper';

import {
  RESET_PASSWORD,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '../../api/resetPassword';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& > div:nth-child(1)': {
      marginBottom: theme.spacing(6),
    },
  },

  paper: {
    [theme.breakpoints.up('sm')]: {
      paddingRight: theme.spacing(22),
      paddingLeft: theme.spacing(22),
    },
  },

  buttonWrapper: {
    padding: theme.spacing(6, 17, 0),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 10, 0),
    },
  },

  button: {
    padding: theme.spacing(2, 14),
    wordBreak: 'keep-all',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 8),
    },
  },
}));

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordProps {
  accessCode: string;
}

const ResetPassword: VoidFunctionComponent<ResetPasswordProps> = ({
  accessCode,
}: ResetPasswordProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['password', 'common']);
  const { dispatch } = useStore();
  const router = useRouter();

  useEffect(() => {
    dispatch({
      type: ReducerActionType.UserLogout,
    });
  }, [dispatch]);

  const [resetPassword, { loading }] = useMutation<ResetPasswordResponse, ResetPasswordPayload>(
    RESET_PASSWORD,
    {
      onCompleted: (data) => {
        if (data.resetPassword) {
          void router.push('/login');
        } else {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('common:Failed to save_ Please try again_'),
            },
          });
        }
      },
      onError: (error) => {
        if (D_DEBUG) {
          console.error(error);
        }
      },
    },
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    mode: 'onChange',
  });

  const onSubmit = useCallback<SubmitHandler<ResetPasswordFormData>>(
    async ({ password }) => {
      await resetPassword({
        variables: {
          resetPasswordInput: {
            accessCode,
            password,
          },
        },
      });
    },
    [accessCode, resetPassword],
  );

  const requireNewPassword = t('common:New password is required_');
  const confirmNewPassword = t("common:You'll need to confirm your new password_");
  const passwordNotMatch = t('common:Passwords do not match_');

  return (
    <PaperWrapper title={t('password:Choose a new password')} classes={{ paper: classes.paper }}>
      <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
        <TextField
          variant="outlined"
          type="password"
          label={t('common:New Password')}
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message || t('common:Min 8 chars_')}
          InputLabelProps={{ shrink: true }}
          inputProps={register('password', {
            required: requireNewPassword,
            minLength: {
              value: 8,
              message: t('common:Password is too short_ Enter at least 8 chars_'),
            },
            maxLength: {
              value: 200,
              message: t('common:Password is too long_ Enter no more than 200 chars_'),
            },
            shouldUnregister: true,
          })}
        />
        <TextField
          variant="outlined"
          type="password"
          label={t('common:Confirm New Password')}
          fullWidth
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputLabelProps={{ shrink: true }}
          inputProps={register('confirmPassword', {
            required: confirmNewPassword,
            validate: (value) => value === getValues('password') || passwordNotMatch,
            shouldUnregister: true,
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
            disabled={!isValid || loading}
          >
            {t('common:Submit')}
          </Button>
        </div>
      </form>
    </PaperWrapper>
  );
};

export default ResetPassword;
