import { SubmitHandler, useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import React, {
  MouseEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  POSSIBLE_USERS,
  PossibleUsersPayload,
  PossibleUsersResponse,
} from 'city-os-common/api/possibleUsers';
import { Rule } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import ErrorCode from 'city-os-common/libs/errorCode';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { INVITE_USER, InviteUserPayload, InviteUserResponse } from '../../api/inviteUser';
import { PermissionInput } from '../../libs/schema';
import { ROLE_TEMPLATES, RoleTemplatesResponse } from '../../api/roleTemplates';
import { basicRules, intersectRules } from '../../libs/permission';
import useWebTranslation from '../../hooks/useWebTranslation';

import PermissionTable from '../AddUserPermission/PermissionTable';
import RoleTemplateIcon from '../../assets/icon/role-template.svg';
import RoleTemplateMenu from '../AddUserPermission/RoleTemplateMenu';
import UserField from '../AddUserPermission/UserField';

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const useStyles = makeStyles((theme) => ({
  form: {
    width: '80vw',
    minWidth: 550,
  },

  dialog: {
    padding: theme.spacing(6, 5, 5),
  },

  basicInfo: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },

  permissionTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
  },

  submitButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(10),
  },

  textField: {
    flex: 1,
    maxWidth: 360,
  },

  subtitle: {
    color: theme.palette.info.main,
  },
}));

interface InviteUserForm {
  emailValue: string;
  emailName: string | null;
  permission: Rule[];
}

interface InviteUserProps {
  open: boolean;
  onClose: (invitedId?: string) => void;
}

const InviteUser: VoidFunctionComponent<InviteUserProps> = ({ open, onClose }: InviteUserProps) => {
  const { t } = useWebTranslation(['common', 'user']);
  const classes = useStyles();
  const client = useApolloClient();
  const isMountedRef = useIsMountedRef();
  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    watch,
    reset,
    formState: { isValid, isDirty, errors },
  } = useForm<InviteUserForm>({
    defaultValues: {
      emailValue: '',
      emailName: null,
      permission: [],
    },
    mode: 'onChange',
  });
  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();

  const watchEmailValue = watch('emailValue');
  const watchEmailName = watch('emailName');
  const watchPermission = watch('permission');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [possibleUsers, setPossibleUsers] = useState<PossibleUsersResponse['possibleUsers'] | null>(
    null,
  );
  const [hasNewOption, setHasNewOption] = useState(false);

  const { data: roleTemplatesData } = useQuery<RoleTemplatesResponse>(ROLE_TEMPLATES);

  const getUsers = useCallback(
    async (variables: PossibleUsersPayload) =>
      client.query<PossibleUsersResponse, PossibleUsersPayload>({
        query: POSSIBLE_USERS,
        variables,
      }),
    [client],
  );

  const debounceGetUsers = useMemo(
    () =>
      debounce(async () => {
        try {
          const getUsersResult = await getUsers({
            keyword: getValues('emailValue'),
            size: 5,
          });
          if (isMountedRef.current && getUsersResult.data.possibleUsers !== null) {
            setPossibleUsers(getUsersResult.data.possibleUsers);
          }
        } catch (error) {
          if (D_DEBUG) console.log(error);
        }
      }, 500),
    [isMountedRef, getUsers, getValues],
  );

  const [inviteUser] = useMutation<InviteUserResponse, InviteUserPayload>(INVITE_USER, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('user:Invitation sent_'),
        },
      });
    },
    onError: (error) => {
      const isExistedError = isGqlError(error, ErrorCode.USER_ALREADY_EXISTED);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: isExistedError
            ? t('user:The user exists in the group already_')
            : t('user:Invite user failed_ Please try again_'),
        },
      });
    },
  });

  const changeEmailValue = useCallback(
    (option: { name: string | null; email: string }) => {
      setValue('emailValue', option.email, { shouldDirty: true, shouldValidate: true });
      setValue('emailName', option.name);
    },
    [setValue],
  );

  const resetHasNewOption = useCallback(() => {
    setHasNewOption(false);
  }, []);

  const openRoleTemplateMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setIsRoleMenuOpen(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const permissionOnChange = useCallback(
    (permissionsInputs: PermissionInput[]) => {
      setValue('permission', permissionsInputs, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const roleMenuOnClick = useCallback(
    (permission: Rule[]) => {
      const permissionsInputs: PermissionInput[] = permission.map(({ subject, action }) => ({
        subject,
        action,
      }));
      const showableRules = intersectRules(permissionsInputs, basicRules);
      const editableRules = intersectRules(
        showableRules,
        permissionGroup?.permission?.rules ?? undefined,
      );
      permissionOnChange(editableRules);
    },
    [permissionGroup, permissionOnChange],
  );

  const dialogOnClose = useCallback(
    (invitedId?: string) => {
      resetHasNewOption();
      reset();
      onClose(invitedId);
    },
    [resetHasNewOption, reset, onClose],
  );

  const onSubmit = useCallback<SubmitHandler<InviteUserForm>>(
    async (data) => {
      if (!data.emailValue || !divisionGroup) return;
      await inviteUser({
        variables: {
          inviteUserInput: {
            email: data.emailValue,
            groupId: divisionGroup.id,
            permissions: data.permission,
          },
        },
      });
      if (isMountedRef.current) dialogOnClose(data.emailValue);
    },
    [divisionGroup, isMountedRef, inviteUser, dialogOnClose],
  );

  useEffect(() => {
    if (open) {
      register('emailValue', { required: true, maxLength: 200, pattern: emailRegex });
      register('permission', { required: true });
    }
  }, [open, register]);

  useEffect(() => {
    if (watchEmailValue === '' && isDirty) {
      setPossibleUsers([]);
    } else {
      void debounceGetUsers();
    }
  }, [watchEmailValue, debounceGetUsers, isDirty]);

  return (
    <BaseDialog
      open={open}
      onClose={() => dialogOnClose()}
      title={t('user:Invite User')}
      titleVariant="h4"
      titleAlign="center"
      classes={{ dialog: classes.dialog }}
      content={
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="subtitle2" align="left" className={classes.subtitle}>
            {t('user:Basic info')}
            <Divider orientation="horizontal" />
          </Typography>
          <section className={classes.basicInfo}>
            <UserField
              inputLabel={t('user:Invite User')}
              classes={{ textField: classes.textField }}
              placeholder={t('common:Insert user name or email')}
              possibleUsers={possibleUsers}
              emailValue={watchEmailValue}
              emailName={watchEmailName}
              newOptionValid={errors.emailValue?.type !== 'pattern'}
              hasNewOption={hasNewOption}
              changeEmail={changeEmailValue}
              setHasNewOption={setHasNewOption}
            />
            <BaseDialog
              open={hasNewOption && errors.emailValue?.type === 'maxLength'}
              onClose={resetHasNewOption}
              title={t('user:Email is too long')}
              content={t('user:Maximum length 200 characters_')}
              buttonText={t('user:Ok')}
            />
            <BaseDialog
              open={hasNewOption && errors.emailValue?.type === 'pattern'}
              onClose={resetHasNewOption}
              title={t('user:Email format invalid_')}
              content={t(
                "user:Email is invalid_ Please make sure that the format is 'name@mail_com'_",
              )}
              buttonText={t('user:Ok')}
            />
            <TextField
              variant="outlined"
              label={t('common:Division')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={divisionGroup?.name || ''}
              className={classes.textField}
              disabled
            />
          </section>
          <div className={classes.permissionTitleWrapper}>
            <Typography variant="subtitle2" align="left" className={classes.subtitle}>
              {t('user:Permission')}
            </Typography>
            <ThemeIconButton
              aria-label={t('common:Role Templates')}
              tooltip={t('common:Role Templates')}
              color="primary"
              onClick={openRoleTemplateMenu}
            >
              <RoleTemplateIcon />
            </ThemeIconButton>
            <RoleTemplateMenu
              open={isRoleMenuOpen}
              anchorEl={anchorEl}
              roleTemplateList={roleTemplatesData?.roleTemplates || []}
              onClose={() => setIsRoleMenuOpen(false)}
              onSelect={roleMenuOnClick}
            />
          </div>
          <PermissionTable
            rules={watchPermission}
            onChange={permissionOnChange}
            acceptedRules={permissionGroup?.permission?.rules ?? undefined}
          />
          <div className={classes.submitButtonWrapper}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!isValid || !isDirty}
            >
              {t('user:Send Invitation')}
            </Button>
          </div>
        </form>
      }
    />
  );
};

export default InviteUser;
