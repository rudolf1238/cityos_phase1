import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, {
  ReactNode,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  CREATE_ROLE_TEMPLATE,
  CreateRoleTemplatePayload,
  CreateRoleTemplateResponse,
} from '../api/createRoleTemplate';
import {
  EDIT_ROLE_TEMPLATE,
  EditRoleTemplatePayload,
  EditRoleTemplateResponse,
} from '../api/editRoleTemplate';
import { PermissionInput, RoleTemplate } from '../libs/schema';
import { ROLE_TEMPLATES, RoleTemplatesResponse } from '../api/roleTemplates';
import { parseRulesToPermissionInputs } from '../libs/permission';
import useWebTranslation from '../hooks/useWebTranslation';

import DeleteRoleTemplateDialog from '../modules/Role/DeleteRoleTemplateDialog';
import PermissionTable from '../modules/AddUserPermission/PermissionTable';

const useStyles = makeStyles((theme) => ({
  titleArea: {
    [theme.breakpoints.down('sm')]: {
      width: 'fit-content',
    },

    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },

  buttons: {
    flex: 1,
    marginLeft: 'auto',
    paddingTop: theme.spacing(2),

    [`& > :first-child > .MuiDivider-vertical,
    & > :last-child > .MuiDivider-vertical`]: {
      display: 'none',
    },
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: theme.spacing(5),
    height: 640,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    padding: theme.spacing(5, 7),
  },

  roleName: {
    maxWidth: 360,
  },

  errorMessage: {
    marginTop: theme.spacing(1),
    minHeight: 16,
  },

  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },

  button: {
    maxWidth: 274,
  },

  scrollButtons: {
    backgroundColor: theme.palette.background.container,
  },
}));

interface RoleContentPayload extends RoleTemplate {
  type: Action.ADD | Action.MODIFY;
}

interface RoleFormData {
  name: string;
  rules: PermissionInput[];
}

interface RolePanelProps {
  role: RoleContentPayload;
  changeRoleId: (roleId: string) => void;
  onChanged: () => void;
}

const RolePanel: VoidFunctionComponent<RolePanelProps> = ({
  role,
  changeRoleId,
  onChanged,
}: RolePanelProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'role']);
  const router = useRouter();
  const { dispatch } = useStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { isValid, isDirty, errors, isSubmitting },
  } = useForm<RoleFormData>({
    mode: 'onChange',
  });
  const enableModify = useIsEnableRule({ subject: Subject.ROLE_TEMPLATE, action: Action.MODIFY });

  const handleSuccess = useCallback(() => {
    dispatch({
      type: ReducerActionType.ShowSnackbar,
      payload: {
        severity: 'success',
        message: t('role:The role settings have been saved successfully_'),
      },
    });
  }, [dispatch, t]);

  const handleError = useCallback(
    (error: ApolloError) => {
      if (D_DEBUG) console.log(error.graphQLErrors);
      const isNameDuplicated = isGqlError(error, ErrorCode.ROLE_TEMPLATE_DUPLICATED);
      const isLimitReached = isGqlError(error, ErrorCode.ROLE_TEMPLATES_LIMIT_REACH);

      let message: string;
      if (isNameDuplicated) {
        message = t('role:Role names cannot be duplicated_ Please choose another name_');
        setError('name', {
          type: 'manual',
          message: t('role:Role name already in use_'),
        });
      } else if (isLimitReached) {
        message = t('role:Role limited reached_ You can’t add more than 20 roles_');
      } else {
        message = t('common:Failed to save_ Please try again_');
      }

      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message,
        },
      });
    },
    [dispatch, setError, t],
  );

  const [createRoleTemplate] = useMutation<CreateRoleTemplateResponse, CreateRoleTemplatePayload>(
    CREATE_ROLE_TEMPLATE,
    {
      onCompleted: (data) => {
        handleSuccess();
        changeRoleId(data.createRoleTemplate.id);
        onChanged();
      },
      onError: (error) => {
        handleError(error);
      },
    },
  );

  const [editRoleTemplate] = useMutation<EditRoleTemplateResponse, EditRoleTemplatePayload>(
    EDIT_ROLE_TEMPLATE,
    {
      onCompleted: () => {
        handleSuccess();
        onChanged();
      },
      onError: (error) => {
        handleError(error);
      },
    },
  );

  const handleInit = useCallback(() => {
    reset({
      name: role.name || '',
      rules: role.permission?.rules?.map(({ subject, action }) => ({ subject, action })) || [], // remove typename from API response
    });
  }, [reset, role.name, role.permission?.rules]);

  const handleChangeRules = useCallback(
    (newRule: PermissionInput[]) => {
      setValue('rules', newRule, { shouldDirty: true });
    },
    [setValue],
  );

  const onSubmit = useCallback<SubmitHandler<RoleFormData>>(
    async ({ name, rules }) => {
      const permissionInputs = parseRulesToPermissionInputs(rules);
      if (role.type === Action.MODIFY) {
        await editRoleTemplate({
          variables: {
            templateId: role.id,
            name,
            permissionInputs,
          },
        });
      } else if (role.type === Action.ADD) {
        await createRoleTemplate({
          variables: {
            name,
            permissionInputs,
          },
        });
      }
    },
    [createRoleTemplate, editRoleTemplate, role.id, role.type],
  );

  const watchRules = watch('rules');

  const disableSave = useMemo(
    () => !isValid || !isDirty || watchRules?.length === 0 || isSubmitting,
    [isValid, isDirty, watchRules?.length, isSubmitting],
  );

  useEffect(() => {
    handleInit();
  }, [handleInit, router]);

  useEffect(() => {
    register('rules');
  }, [register]);

  useEffect(() => {
    dispatch({
      type: disableSave ? ReducerActionType.DisableExitDialog : ReducerActionType.EnableExitDialog,
    });
  }, [disableSave, dispatch]);

  const requireRoleName = t('role:Role name is required_');

  return (
    <form key={role.id} className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label={t('role:Role name')}
        type="text"
        variant="outlined"
        className={classes.roleName}
        InputLabelProps={{ shrink: true }}
        inputProps={register('name', {
          required: requireRoleName,
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <div>
        <PermissionTable
          rules={watch('rules')}
          onChange={handleChangeRules}
          disabled={!enableModify}
        />
        <div className={classes.errorMessage}>
          {watchRules?.length === 0 && (
            <Typography variant="body1" color="error">
              {t('role:Select at least one permission setting_')}
            </Typography>
          )}
        </div>
      </div>
      <div className={classes.buttonWrapper}>
        <Button type="submit" variant="contained" color="primary" disabled={disableSave}>
          {t('common:Save')}
        </Button>
      </div>
    </form>
  );
};

const Role: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useWebTranslation(['role', 'common']);
  const router = useRouter();

  const roleId = isString(router.query.rid) ? router.query.rid : '';

  const [roles, setRoles] = useState<RoleContentPayload[]>([]);
  const [openDelete, setOpenDelete] = useState(false);

  const setRoleId = useCallback(
    (rid: string) => {
      const newRoute = {
        pathname: router.pathname,
        query: {
          ...router.query,
          rid,
        },
      };
      void router.push(newRoute, newRoute, { shallow: true });
    },
    [router],
  );

  const roleIndex = useMemo(() => roles.findIndex(({ id }) => id === roleId), [roleId, roles]);

  const {
    data: { roleTemplates: savedRoles } = {},
    error,
    refetch: refetchRoles,
  } = useQuery<RoleTemplatesResponse>(ROLE_TEMPLATES, {
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ roleTemplates }) => {
      if (roleTemplates) {
        setRoles(
          roleTemplates.map((role) =>
            cloneDeep({
              ...role,
              type: Action.MODIFY,
            }),
          ),
        );
      }
    },
  });

  const handleSelectTab = useCallback(
    (index: number) => {
      setRoleId(roles[index].id);
      return false;
    },
    [setRoleId, roles],
  );

  const handleAdd = useCallback(() => {
    const newRole: RoleContentPayload = {
      id: 'newRole',
      name: t('role:Untitled'),
      permission: {
        rules: [],
      },
      type: Action.ADD,
    };
    setRoles(roles.concat(newRole));
    setRoleId(newRole.id);
  }, [setRoleId, roles, t]);

  const handleCloseDeleteDialog = useCallback(
    (isDeleted: boolean) => {
      if (isDeleted) {
        setRoleId(roles[0].id);
        void refetchRoles();
      }
      setOpenDelete(false);
    },
    [refetchRoles, roles, setRoleId],
  );

  const tabTitles = useMemo(
    () =>
      roles.map((role) => ({
        title: role.name || '',
        tabId: role.id,
      })),
    [roles],
  );

  const tabContent = useMemo<ReactNode>(() => {
    const selectedRole = roles.find((role) => role.id === roleId);
    if (!selectedRole) return null;
    return (
      <RolePanel
        key={selectedRole.id}
        role={selectedRole}
        changeRoleId={setRoleId}
        onChanged={refetchRoles}
      />
    );
  }, [refetchRoles, roleId, roles, setRoleId]);

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  useEffect(() => {
    if (!roleId && roles[0]?.id) setRoleId(roles[0].id);
  }, [roleId, roles, setRoleId]);

  return (
    <MainLayout>
      <Guard subject={Subject.ROLE_TEMPLATE} action={Action.VIEW} forbidden={isForbidden}>
        <PageContainer>
          <Header
            title={t('role:Role Settings')}
            description={t('role:Show the permission settings for different roles here_')}
            classes={{ titleArea: classes.titleArea }}
          >
            <Grid container justify="flex-end" spacing={2} className={classes.buttons}>
              <Guard subject={Subject.ROLE_TEMPLATE} action={Action.REMOVE} fallback={null}>
                <Grid item>
                  <ThemeIconButton
                    tooltip={t('common:Delete')}
                    color="primary"
                    onClick={() => {
                      setOpenDelete(true);
                    }}
                  >
                    <DeleteIcon />
                  </ThemeIconButton>
                </Grid>
                <DeleteRoleTemplateDialog
                  open={openDelete}
                  roleId={roleId}
                  onClose={handleCloseDeleteDialog}
                  onDelete={
                    roles[roleIndex]?.type === Action.MODIFY
                      ? undefined
                      : () => {
                          setRoles((prevRoles) => prevRoles.filter(({ id }) => id !== roleId));
                        }
                  }
                />
              </Guard>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
              <Guard subject={Subject.ROLE_TEMPLATE} action={Action.ADD} fallback={null}>
                <Grid item>
                  <ThemeIconButton
                    tooltip={t('common:Add')}
                    color="primary"
                    variant="contained"
                    onClick={handleAdd}
                    disabled={!!savedRoles && savedRoles.length !== roles.length}
                  >
                    <AddIcon />
                  </ThemeIconButton>
                </Grid>
              </Guard>
            </Grid>
          </Header>
          <div className={classes.panel}>
            <TabPanelSet
              tabsColor="transparent"
              tabTitles={tabTitles}
              index={roleIndex}
              classes={{
                scrollButtons: classes.scrollButtons,
              }}
              onSelect={handleSelectTab}
            >
              {tabContent}
            </TabPanelSet>
          </div>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default Role;
