import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import React, {
  FunctionComponent,
  PropsWithChildren,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Language, Theme } from '../../../libs/schema';
import {
  UPDATE_PROFILE,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../../../api/updateProfile';
import { languageOptions } from '../../../libs/i18n';
import { useStore } from '../../../reducers';
import ReducerActionType from '../../../reducers/actions';
import useCommonTranslation from '../../../hooks/useCommonTranslation';

import BaseDialog from '../../BaseDialog';
import LineIcon from '../../../assets/icon/line.svg';
import LineQRCodeDialog from './LineQRCodeDialog';
import PhoneField from '../../PhoneField';

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

  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },

  contact: {
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
  },

  phoneField: {
    flex: 1,
  },

  lineButton: {
    padding: theme.spacing(1, 2),
    width: 177,
  },

  startIcon: {
    marginRight: theme.spacing(2),
  },
}));

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

interface ProfileData {
  name: string;
  phone: string;
  email: string;
  language: Language;
  theme: Theme;
}

const UserProfile: FunctionComponent<UserProfileProps> = ({
  open,
  onClose,
}: PropsWithChildren<UserProfileProps>) => {
  const { t } = useCommonTranslation(['common', 'profileMenu']);
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields, isValid },
  } = useForm<ProfileData>({ mode: 'onChange' });
  const { dispatch, userProfile } = useStore();
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | undefined>(undefined);
  const [openLineQRCode, setOpenLineQRCode] = useState(false);

  const [updateProfile, { loading }] = useMutation<UpdateProfileResponse, UpdateProfilePayload>(
    UPDATE_PROFILE,
    {
      onCompleted: (profileData) => {
        dispatch({
          type: ReducerActionType.SetProfile,
          payload: {
            profile: profileData.updateProfile,
          },
        });
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The information has been saved successfully_'),
          },
        });
      },
      onError: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Failed to save_ Please try again_'),
          },
        });
      },
    },
  );

  const handleOpenLineQRCode = useCallback(() => {
    setOpenLineQRCode(true);
  }, []);

  const handleCloseLineQRCode = useCallback(() => {
    setOpenLineQRCode(false);
  }, []);

  const handleOnClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onChangePhone = useCallback(
    (phoneNumber: string, isPhoneNumberValid: boolean) => {
      setValue('phone', phoneNumber, { shouldDirty: true });
      setIsPhoneValid(isPhoneNumberValid);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async ({ name, phone, language, theme }: ProfileData) => {
      if (userProfile.profile) {
        await updateProfile({
          variables: {
            updateProfileInput: {
              name,
              phone,
              language,
              theme,
            },
          },
        });
      }
      onClose();
    },
    [userProfile, onClose, updateProfile],
  );

  const themeOptions = useMemo(
    () => [
      { label: t('profileMenu:Dark'), value: Theme.DARK },
      { label: t('profileMenu:Light'), value: Theme.LIGHT },
    ],
    [t],
  );

  useEffect(() => {
    if (userProfile.profile) {
      reset({
        name: userProfile.profile.name,
        phone: userProfile.profile.phone,
        email: userProfile.profile.email,
        language: userProfile.profile.language,
        theme: userProfile.profile.theme,
      });
    }
  }, [userProfile, reset]);

  return (
    <>
      <BaseDialog
        open={open}
        onClose={handleOnClose}
        title={t('profileMenu:User Profile')}
        titleAlign="center"
        titleVariant="h4"
        classes={{ dialog: classes.paper }}
        content={
          <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
            <TextField
              variant="outlined"
              type="text"
              label={t('common:Name')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.name}
              helperText={errors.name?.message}
              inputProps={register('name', {
                required: {
                  value: true,
                  message: t('common:Name is required_'),
                },
                maxLength: {
                  value: 32,
                  message: t('common:Name is too long (maximum is 32 characters)_'),
                },
              })}
            />
            <TextField
              variant="outlined"
              type="email"
              label={t('common:Email')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled
              inputProps={register('email', {
                required: true,
              })}
            />
            <div className={classes.contact}>
              <PhoneField
                value={watch('phone')}
                className={classes.phoneField}
                onChange={onChangePhone}
              />
              <Button
                className={classes.lineButton}
                onClick={handleOpenLineQRCode}
                startIcon={<LineIcon />}
                classes={{
                  startIcon: classes.startIcon,
                }}
              >
                <Typography variant="overline" color="textPrimary" align="left">
                  {userProfile.profile?.isLINEConnected
                    ? t('profileMenu:CONNECTED LINE APP')
                    : t('profileMenu:LINE APP NOT CONNECTED')}
                </Typography>
              </Button>
            </div>
            <TextField
              variant="outlined"
              type="text"
              label={t('profileMenu:Language')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('language') || ''}
              inputProps={register('language', {
                required: true,
              })}
              select
              SelectProps={{
                IconComponent: ExpandMoreRoundedIcon,
                MenuProps: {
                  getContentAnchorEl: null,
                  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                  className: classes.menu,
                  MenuListProps: {
                    className: classes.menuList,
                  },
                  PaperProps: {
                    variant: 'outlined',
                  },
                },
              }}
            >
              {Object.entries(languageOptions).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              variant="outlined"
              type="text"
              label={t('profileMenu:Appearance')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('theme') || ''}
              inputProps={register('theme', {
                required: true,
              })}
              select
              SelectProps={{
                IconComponent: ExpandMoreRoundedIcon,
                MenuProps: {
                  getContentAnchorEl: null,
                  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                  className: classes.menu,
                  MenuListProps: {
                    className: classes.menuList,
                  },
                  PaperProps: {
                    variant: 'outlined',
                  },
                },
              }}
            >
              {themeOptions.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                Object.keys(dirtyFields).length === 0 || loading || !isValid || !isPhoneValid
              }
            >
              {t('common:Save')}
            </Button>
          </form>
        }
      />
      <LineQRCodeDialog open={openLineQRCode} onClose={handleCloseLineQRCode} />
    </>
  );
};

export default memo(UserProfile);
