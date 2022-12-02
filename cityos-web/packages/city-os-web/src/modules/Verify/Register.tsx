import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import Loading from 'city-os-common/modules/Loading';
import Logo from 'city-os-common/modules/Logo';
import PaperWrapper from 'city-os-common/modules/PaperWrapper';
import PhoneField from 'city-os-common/modules/PhoneField';

import { CREATE_USER, CreateUserPayload, CreateUserResponse } from '../../api/createUser';
import { GET_USER_PROFILE, GetUserProfileResponse } from '../../api/getUserProfile';
import { parseI18nLanguage } from '../../libs/i18n';
import useInitialRoute from '../../hooks/useInitialRoute';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  registerPaper: {
    padding: theme.spacing(10, 8.5),
    width: 540,
    maxWidth: `calc(100% - ${theme.spacing(5)}px)`,
  },

  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(10),
  },

  registerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(5),
    textAlign: 'center',
  },

  registerButtonWrapper: {
    marginTop: theme.spacing(7),
    padding: theme.spacing(0, 6),
  },

  registerButton: {
    padding: theme.spacing(2, 14),
  },

  createPaper: {
    padding: theme.spacing(4, 24, 17),
  },

  createForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    paddingTop: theme.spacing(8),
  },

  createButtonWrapper: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 5),
  },

  createButton: {
    padding: theme.spacing(2, 10),
  },
}));

interface NewPasswordProps {
  email: string;
  onSubmitPassword: (value: string) => void;
}

const NewPassword: VoidFunctionComponent<NewPasswordProps> = ({
  email,
  onSubmitPassword,
}: NewPasswordProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'user']);
  const { dispatch } = useStore();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
  });

  useEffect(() => {
    dispatch({
      type: ReducerActionType.UserLogout,
    });
  }, [dispatch]);

  const onSubmit = useCallback<SubmitHandler<RegisterFormData>>(
    ({ password }) => {
      onSubmitPassword(password);
    },
    [onSubmitPassword],
  );

  return (
    <Paper className={classes.registerPaper} elevation={3}>
      <div className={classes.titleBlock}>
        <Logo />
      </div>
      <form className={classes.registerForm} onSubmit={handleSubmit(onSubmit)}>
        <TextField
          variant="outlined"
          type="email"
          label={t('common:Email')}
          value={email}
          fullWidth
          InputLabelProps={{ shrink: true }}
          disabled
        />
        <TextField
          variant="outlined"
          type="password"
          label={t('common:Password')}
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message || t('common:Min 8 chars_')}
          InputLabelProps={{ shrink: true }}
          inputProps={register('password', {
            required: true,
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
        <div className={classes.registerButtonWrapper}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isValid}
            className={classes.registerButton}
            size="large"
            fullWidth
          >
            {t('common:Next')}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

interface CreateUserProps {
  email: string;
  password: string;
  accessCode: string;
}

interface CreateUserFormData {
  name: string;
  phone: string;
}

const CreateUser: VoidFunctionComponent<CreateUserProps> = ({
  email,
  password,
  accessCode,
}: CreateUserProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['verify', 'common']);
  const router = useRouter();
  const { dispatch, user } = useStore();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateUserFormData>({
    mode: 'onChange',
  });
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const initialRoute = useInitialRoute();

  const handleError = useCallback(
    (error: Error) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to save_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    },
    [dispatch, t],
  );

  const onChangePhone = useCallback(
    (phoneNumber: string, isPhoneNumberValid: boolean) => {
      setValue('phone', phoneNumber);
      setIsPhoneValid(isPhoneNumberValid);
    },
    [setValue],
  );

  useQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    skip: !user.deviceToken || !user.refreshToken,
    onCompleted: (data) => {
      dispatch({
        type: ReducerActionType.SetProfile,
        payload: {
          profile: data.userProfile,
        },
      });
    },
  });

  const [createUser] = useMutation<CreateUserResponse, CreateUserPayload>(CREATE_USER, {
    onCompleted: (data) => {
      const { createUser: newUser } = data;
      if (newUser.refreshToken && newUser.deviceToken) {
        dispatch({
          type: ReducerActionType.UserLogin,
          payload: {
            email,
            refreshToken: newUser.refreshToken,
          },
        });
        dispatch({
          type: ReducerActionType.SetDeviceToken,
          payload: {
            deviceToken: newUser.deviceToken,
          },
        });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const onSubmit = useCallback<SubmitHandler<CreateUserFormData>>(
    async ({ name, phone }) => {
      if (!email || !accessCode) return;
      setIsLoading(true);
      await createUser({
        variables: {
          createUserInput: {
            email,
            password,
            name,
            phone,
            accessCode,
            language: parseI18nLanguage(i18n.language),
          },
        },
      });
    },
    [accessCode, createUser, email, password],
  );

  useEffect(() => {
    if (!user.email || !user.accessToken) return;
    void router.push(initialRoute);
  }, [initialRoute, router, user.accessToken, user.email]);

  const requireName = t('common:Name is required_');

  return (
    <PaperWrapper
      title={t('verify:Tell us about yourself')}
      classes={{ paper: classes.createPaper }}
    >
      <form className={classes.createForm} onSubmit={handleSubmit(onSubmit)}>
        <TextField
          variant="outlined"
          type="text"
          label={t('common:Name')}
          placeholder={t('common:Insert your name')}
          fullWidth
          error={!!errors.name}
          helperText={errors.name ? errors.name.message : ''}
          InputLabelProps={{ shrink: true }}
          inputProps={register('name', {
            required: requireName,
            maxLength: {
              value: 32,
              message: t('common:Name is too long (maximum is 32 characters)_'),
            },
          })}
        />
        <PhoneField onChange={onChangePhone} />
        <div className={classes.createButtonWrapper}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !isValid || !isPhoneValid}
            className={classes.createButton}
            size="large"
            fullWidth
          >
            {t('verify:Create account')}
          </Button>
        </div>
      </form>
      <Loading open={isLoading} />
    </PaperWrapper>
  );
};

interface RegisterFormData {
  password: string;
}

interface RegisterProps {
  email: string;
  accessCode: string;
}

const Register: VoidFunctionComponent<RegisterProps> = ({ email, accessCode }: RegisterProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState('');

  const onSubmitPassword = useCallback((password: string) => {
    setNewPassword(password);
    setStep(2);
  }, []);

  const content = useMemo(() => {
    if (step === 1) return <NewPassword email={email} onSubmitPassword={onSubmitPassword} />;
    if (step === 2)
      return <CreateUser email={email} password={newPassword} accessCode={accessCode} />;
    return null;
  }, [accessCode, email, newPassword, onSubmitPassword, step]);

  return <>{content}</>;
};

export default Register;
