import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import React, { FunctionComponent, PropsWithChildren, useCallback, useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {
  CHANGE_PASSWORD,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../../../api/changePassword';
import { useStore } from '../../../reducers';
import ErrorCode from '../../../libs/errorCode';
import ReducerActionType from '../../../reducers/actions';
import isGqlError from '../../../libs/isGqlError';
import useCommonTranslation from '../../../hooks/useCommonTranslation';

import BaseDialog from '../../BaseDialog';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(6, 16, 10),
    width: 750,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: FunctionComponent<ChangePasswordProps> = ({
  open,
  onClose,
}: PropsWithChildren<ChangePasswordProps>) => {
  const { t } = useCommonTranslation(['common', 'profileMenu']);
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({ mode: 'onChange' });
  const { dispatch } = useStore();

  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  const handleOnClose = useCallback(() => {
    reset();
    onClose();
    setIsUnauthenticated(false);
  }, [reset, onClose]);

  const handleError = useCallback(() => {
    dispatch({
      type: ReducerActionType.ShowSnackbar,
      payload: {
        severity: 'error',
        message: t('common:Failed to save_ Please try again_'),
      },
    });
  }, [dispatch, t]);

  const [changePassword, { loading }] = useMutation<ChangePasswordResponse, ChangePasswordPayload>(
    CHANGE_PASSWORD,
    {
      onCompleted: (data) => {
        if (data.changePassword) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('common:The information has been saved successfully_'),
            },
          });
        } else {
          handleError();
        }
        handleOnClose();
      },
      onError: (error) => {
        if (isGqlError(error, ErrorCode.UNAUTHENTICATED)) {
          setIsUnauthenticated(true);
        } else {
          handleError();
          handleOnClose();
        }
      },
    },
  );

  const onSubmit = useCallback(
    async ({ currentPassword, newPassword }: FormData) => {
      await changePassword({
        variables: {
          changePasswordInput: {
            oldPassword: currentPassword,
            newPassword,
          },
        },
      });
    },
    [changePassword],
  );

  const invalidValue = t('profileMenu:Invalid value');
  const requireNewPassword = t('common:New password is required_');
  const requireConfirmNewPassword = t("common:You'll need to confirm your new password_");
  const passwordNotMatch = t('common:Passwords do not match_');

  const currentPassword = register('currentPassword', {
    required: invalidValue,
    shouldUnregister: true,
  });

  return (
    <BaseDialog
      open={open}
      onClose={handleOnClose}
      title={t('profileMenu:Change Password')}
      titleAlign="center"
      titleVariant="h4"
      classes={{ dialog: classes.paper }}
      content={
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <TextField
            variant="outlined"
            type="password"
            label={t('profileMenu:Current Password')}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.currentPassword || isUnauthenticated}
            helperText={
              errors.currentPassword?.message ||
              (isUnauthenticated && t('profileMenu:Invalid value'))
            }
            onChange={(e) => {
              void currentPassword.onChange(e);
              if (isUnauthenticated) setIsUnauthenticated(false);
            }}
            name={currentPassword.name}
            onBlur={currentPassword.onBlur}
            inputRef={currentPassword.ref}
          />
          <TextField
            id="password"
            variant="outlined"
            type="password"
            label={t('common:New Password')}
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message || t('common:Min 8 chars_')}
            InputLabelProps={{ shrink: true }}
            inputProps={register('newPassword', {
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
            id="confirmPassword"
            variant="outlined"
            type="password"
            label={t('common:Confirm New Password')}
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputLabelProps={{ shrink: true }}
            inputProps={register('confirmPassword', {
              required: requireConfirmNewPassword,
              validate: (value) => value === getValues('newPassword') || passwordNotMatch,
              shouldUnregister: true,
            })}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isValid || isUnauthenticated || loading}
          >
            {t('common:Save')}
          </Button>
        </form>
      }
    />
  );
};

export default ChangePassword;
