import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { MouseEvent, VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import isEqual from 'lodash/isEqual';
import xorWith from 'lodash/xorWith';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Action, Rule, Subject, UserStatus } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useHiddenStyles from 'city-os-common/styles/hidden';

import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { EDIT_USER, EditUserPayload, EditUserResponse } from '../../api/editUser';
import {
  PartialNode,
  SEARCH_USERS,
  SearchUsersPayload,
  SearchUsersResponse,
} from '../../api/searchUsers';
import { PermissionInput } from '../../libs/schema';
import { ROLE_TEMPLATES, RoleTemplatesResponse } from '../../api/roleTemplates';
import { basicRules, intersectRules, subtractRules } from '../../libs/permission';
import useWebTranslation from '../../hooks/useWebTranslation';

import PermissionTable from '../../modules/AddUserPermission/PermissionTable';
import RoleTemplateIcon from '../../assets/icon/role-template.svg';
import RoleTemplateMenu from '../../modules/AddUserPermission/RoleTemplateMenu';

const parseRulesToPermissionInputs = (rules: Rule[]): PermissionInput[] =>
  rules.map(({ subject, action }) => ({
    subject,
    action,
  }));

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
    textAlign: 'center',
  },

  template: {
    position: 'absolute',
    top: theme.spacing(-11),
    right: 0,
  },

  button: {
    marginTop: theme.spacing(5),
  },

  loading: {
    padding: theme.spacing(13, 0),
    textAlign: 'center',
  },
}));

const UserPermissionTab: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'user']);
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const router = useRouter();

  const queryEmail = isString(router.query.id) ? router.query.id : undefined;
  const backLink = isString(router.query.back) ? router.query.back : undefined;

  const {
    dispatch,
    user,
    userProfile: { divisionGroup, permissionGroup },
  } = useStore();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [permissionInputs, setPermissionInputs] = useState<PermissionInput[]>([]);
  const [initPermission, setInitPermission] = useState<PermissionInput[]>([]);
  const [currentUser, setCurrentUser] = useState<Required<PartialNode>>();

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

  const { data: roleTemplatesData, loading } = useQuery<RoleTemplatesResponse>(ROLE_TEMPLATES);
  const { error } = useQuery<SearchUsersResponse, SearchUsersPayload>(SEARCH_USERS, {
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        keyword: queryEmail,
      },
    },
    skip: !queryEmail || !permissionGroup?.group?.id || !divisionGroup?.id,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ searchUsers }) => {
      const newUser = searchUsers.edges.find(({ node }) => node.email === queryEmail);
      const newGroup = newUser?.node.groups.find((info) => info.group.id === divisionGroup?.id);
      if (newUser && newGroup) {
        setCurrentUser(newUser.node);
        const newInputs = parseRulesToPermissionInputs(newGroup.permission?.rules || []);
        setPermissionInputs(newInputs);
        setInitPermission(newInputs);
      }
    },
  });
  const [editUser, { loading: editLoading }] = useMutation<EditUserResponse, EditUserPayload>(
    EDIT_USER,
    {
      onCompleted: (data) => {
        if (data.editUser) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('common:This information has been saved successfully_'),
            },
          });
          void router.push(subjectRoutes.USER);
        } else {
          handleError(new Error('Unknown error'));
        }
      },
      onError: (err) => {
        handleError(err);
      },
    },
  );

  const acceptedRules = useMemo(() => permissionGroup?.permission?.rules || [], [permissionGroup]);

  const permissionOnChange = useCallback((newInputs: PermissionInput[]) => {
    setPermissionInputs(newInputs);
  }, []);

  const templateOnSelect = useCallback(
    (rules: Rule[]) => {
      const newPermission = parseRulesToPermissionInputs(rules);
      setPermissionInputs((prev) => {
        const editableRules = intersectRules(acceptedRules, basicRules);
        const readOnlyRules = subtractRules(prev, editableRules);
        const readonlyView = readOnlyRules.reduce<Rule[]>(
          (list, { subject, action }) =>
            action !== Action.VIEW && list.every((rule) => rule.subject !== subject)
              ? list.concat({ subject, action: Action.VIEW })
              : list,
          [],
        );

        const showableRules = intersectRules(newPermission, basicRules);
        const addableRules = intersectRules(showableRules, acceptedRules);

        return readOnlyRules.concat(readonlyView, addableRules);
      });
    },
    [acceptedRules],
  );

  const openRoleTemplateMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setIsRoleMenuOpen(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleSave = useCallback(async () => {
    if (!queryEmail || !divisionGroup?.id) return;
    await editUser({
      variables: {
        email: queryEmail,
        groupId: divisionGroup.id,
        permissions: permissionInputs,
      },
    });
  }, [queryEmail, divisionGroup?.id, permissionInputs, editUser]);

  const isDirty = useMemo(
    () =>
      xorWith(
        initPermission.map(({ subject, action }) => ({ subject, action })),
        permissionInputs.map(({ subject, action }) => ({ subject, action })),
        isEqual,
      ).length !== 0,

    [initPermission, permissionInputs],
  );

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  return (
    <MainLayout>
      <Guard subject={Subject.USER} action={Action.MODIFY} forbidden={isForbidden}>
        <PageContainer>
          <Header
            title={currentUser?.name || (currentUser && currentUser?.email)}
            backLinkText={t('user:User Management')}
            backLinkHref={backLink || subjectRoutes.USER}
            description={
              currentUser?.status === UserStatus.ACTIVE
                ? `${currentUser.email} / ${currentUser.phone}`
                : ''
            }
          />
          <div className={clsx(classes.loading, !loading && hiddenClasses.hidden)}>
            <CircularProgress />
          </div>
          <div className={clsx(classes.wrapper, loading && hiddenClasses.hidden)}>
            <PermissionTable
              rules={permissionInputs}
              acceptedRules={currentUser ? acceptedRules : []}
              disabled={user.email === queryEmail}
              onChange={permissionOnChange}
            />
            {user.email !== queryEmail && currentUser && (
              <>
                <div className={classes.template}>
                  <ThemeIconButton
                    aria-label={t('common:Role Templates')}
                    color="primary"
                    tooltip={t('common:Role Templates')}
                    onClick={openRoleTemplateMenu}
                  >
                    <RoleTemplateIcon />
                  </ThemeIconButton>
                  <RoleTemplateMenu
                    open={isRoleMenuOpen}
                    anchorEl={anchorEl}
                    roleTemplateList={roleTemplatesData?.roleTemplates || []}
                    onClose={() => setIsRoleMenuOpen(false)}
                    onSelect={templateOnSelect}
                  />
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!isDirty || !initPermission || editLoading}
                  className={classes.button}
                  onClick={handleSave}
                >
                  {t('common:Save')}
                </Button>
              </>
            )}
          </div>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default UserPermissionTab;
