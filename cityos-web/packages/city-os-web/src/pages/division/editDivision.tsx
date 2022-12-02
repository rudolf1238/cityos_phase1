import { SubmitHandler, useForm } from 'react-hook-form';
import { fade, makeStyles } from '@material-ui/core/styles';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo } from 'react';
import isEqual from 'lodash/isEqual';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import getGenealogy from 'city-os-common/libs/getGenealogy';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';

import {
  EDIT_GROUP,
  EditGroupInput,
  EditGroupPayload,
  EditGroupResponse,
} from '../../api/editGroup';
import { GET_GROUP, GetGroupPayload, GetGroupResponse } from '../../api/getGroup';
import { GET_USER_PROFILE, GetUserProfileResponse } from '../../api/getUserProfile';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  basicInfo: {
    border: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 20),
    width: '100%',
    height: 258,

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(5, 6),
    },
  },

  textRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(5, 0, 6),
  },

  nameField: {
    width: 366,

    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(2),
      width: '100%',
      maxWidth: 366,
    },
  },

  projectKey: {
    marginBottom: theme.spacing(2),
  },

  enableMask: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(5),
    width: '100%',
  },
}));

const EditDivision: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'division']);
  const router = useRouter();
  const {
    dispatch,
    userProfile: { permissionGroup, joinedGroups },
  } = useStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, errors },
  } = useForm<EditGroupInput>({ mode: 'onChange' });

  const [resetProfile] = useLazyQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
    onCompleted: ({ userProfile }) => {
      dispatch({
        type: ReducerActionType.SetProfile,
        payload: {
          profile: userProfile,
        },
      });
    },
  });

  const groupId = useMemo(() => (isString(router.query.id) ? router.query.id : undefined), [
    router.query.id,
  ]);

  const isRoot = useMemo(() => groupId === permissionGroup?.group.id, [
    groupId,
    permissionGroup?.group.id,
  ]);

  const { data: getGroupData, refetch: refetchGroup, error, loading: getGroupLoading } = useQuery<
    GetGroupResponse,
    GetGroupPayload
  >(GET_GROUP, {
    skip: !groupId,
    variables: {
      groupId: groupId || '',
    },
    fetchPolicy: 'cache-and-network',
  });

  const [editGroup, { loading }] = useMutation<EditGroupResponse, EditGroupPayload>(EDIT_GROUP);

  const groupData = useMemo(() => getGroupData?.getGroup, [getGroupData?.getGroup]);

  const initGroupData = useMemo(
    () => ({
      name: groupData?.name,
      sensorMaskInput: {
        enable: groupData?.sensorMask?.enable,
        sensors: groupData?.sensorMask?.sensors,
      },
    }),
    [groupData?.name, groupData?.sensorMask],
  );

  const groupGenealogy = useMemo(
    () => (groupId && joinedGroups ? getGenealogy(groupId, joinedGroups) : ''),
    [groupId, joinedGroups],
  );

  const submitGroupData = useCallback<SubmitHandler<EditGroupInput>>(
    async ({ name, sensorMaskInput: { enable, sensors } }) => {
      try {
        if (!groupId) throw new Error();
        const { data } = await editGroup({
          variables: {
            groupId,
            editGroupInput: {
              name,
              sensorMaskInput: {
                enable,
                sensors,
              },
            },
          },
        });
        if (data?.editGroup) {
          await refetchGroup();
          await resetProfile();
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('common:The value has been saved successfully_'),
            },
          });
        }
      } catch (err) {
        if (D_DEBUG) console.error(err);

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Failed to save_ Please try again_'),
          },
        });
      }
    },
    [groupId, editGroup, refetchGroup, resetProfile, dispatch, t],
  );

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  useEffect(() => {
    setValue('name', initGroupData?.name || '');
    setValue('sensorMaskInput.enable', initGroupData?.sensorMaskInput.enable || false);
    setValue('sensorMaskInput.sensors', initGroupData?.sensorMaskInput.sensors || []);
  }, [initGroupData, setValue]);

  return (
    <MainLayout>
      <Guard subject={Subject.GROUP} action={Action.MODIFY} forbidden={isForbidden}>
        <PageContainer>
          <Header
            title={t('division:Edit Division')}
            description={t('division:Edit and show the division info')}
            backLinkText={t('division:Division Management')}
            backLinkHref={subjectRoutes.GROUP}
          />
          <form onSubmit={handleSubmit(submitGroupData)}>
            <div className={classes.basicInfo}>
              <Typography variant="body2">{isRoot ? '' : groupGenealogy}</Typography>
              <div className={classes.textRow}>
                <TextField
                  label={t('division:Division Name')}
                  variant="outlined"
                  value={watch('name')}
                  type="text"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  className={classes.nameField}
                  inputProps={register('name', {
                    maxLength: {
                      value: 200,
                      message: t('common:Max_ {{count}} character', { count: 200 }),
                    },
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
                <div>
                  <Typography variant="body2" align="right" className={classes.projectKey}>
                    {t('common:Project Key')}
                  </Typography>
                  <Typography variant="body1" align="right">
                    {groupData?.projectKey || ''}
                  </Typography>
                </div>
              </div>
            </div>
            <div className={classes.buttonWrapper}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                disabled={isEqual(initGroupData, watch()) || loading || getGroupLoading || !isValid}
              >
                {t('common:Save')}
              </Button>
            </div>
          </form>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default EditDivision;
