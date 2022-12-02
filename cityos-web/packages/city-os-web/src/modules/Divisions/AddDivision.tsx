import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { CREATE_GROUP, CreateGroupPayload, CreateGroupResponse } from '../../api/createGroup';
import { useDivisionsContext } from './DivisionsProvider';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: theme.spacing(6, 27, 11),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 10, 11),
    },
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    width: 360,
  },

  buttonWrapper: {
    padding: theme.spacing(0, 6),
    width: '100%',
  },

  button: {
    padding: theme.spacing(2),
  },
}));

interface AddDivisionProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

type AddDivisionPayload = {
  divisionName: string;
};

const AddDivision: VoidFunctionComponent<AddDivisionProps> = ({
  open,
  onClose,
  onChanged,
  onUpdating,
}: AddDivisionProps) => {
  const { t } = useWebTranslation(['common', 'division']);
  const classes = useStyles();
  const { dispatch } = useStore();
  const { groups, selected } = useDivisionsContext();
  const isMountedRef = useIsMountedRef();

  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isValid, errors },
  } = useForm<AddDivisionPayload>({
    defaultValues: {
      divisionName: '',
    },
    mode: 'onChange',
  });

  const [createGroup, { loading }] = useMutation<CreateGroupResponse, CreateGroupPayload>(
    CREATE_GROUP,
    {
      onCompleted: async () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('division:The division has been added successfully_'),
          },
        });
        onChanged();
        if (isMountedRef.current) {
          reset({
            divisionName: '',
          });
          onClose();
        }
      },
      onError: (error) => {
        if (D_DEBUG) console.log(error.graphQLErrors);
        const isOverLimit = isGqlError(error, ErrorCode.GROUP_LEVEL_LIMIT_REACH);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: isOverLimit
              ? t('division:Subtree number limited_ Unable to add a subtree to this division_')
              : t('common:Failed to save_ Please try again_'),
          },
        });
        reset({
          divisionName: '',
        });
        onClose();
      },
    },
  );

  const parentDivision = useMemo(() => groups.find(({ id }) => id === selected[0]), [
    groups,
    selected,
  ]);

  const onSubmit = useCallback<SubmitHandler<AddDivisionPayload>>(
    async ({ divisionName }) => {
      if (!parentDivision?.id) return;
      await createGroup({
        variables: {
          createGroupInput: {
            parentGroupId: parentDivision.id,
            name: divisionName,
          },
        },
      });
    },
    [parentDivision?.id, createGroup],
  );

  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={t('division:Add a Division')}
      titleVariant="h4"
      titleAlign="center"
      classes={{ dialog: classes.dialog }}
      content={
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label={t('division:Division Name')}
            placeholder={t('division:Insert a division name')}
            variant="outlined"
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={register('divisionName', {
              required: true,
              maxLength: {
                value: 200,
                message: t('common:Max_ {{count}} character', { count: 200 }),
              },
            })}
            error={!!errors.divisionName}
            helperText={errors.divisionName?.message}
          />
          <TextField
            label={t('division:Parent Division')}
            value={parentDivision?.name || ''}
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            disabled
          />
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              fullWidth
              disabled={!isDirty || !isValid}
              className={classes.button}
            >
              {t('common:Create')}
            </Button>
          </div>
        </form>
      }
    />
  );
};

export default AddDivision;
