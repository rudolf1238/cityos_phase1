import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import {
  DELETE_ROLE_TEMPLATE,
  DeleteRoleTemplatePayload,
  DeleteRoleTemplateResponse,
} from '../../api/deleteRoleTemplate';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    width: 'min(600px, 90vw)',
  },

  subtitle: {
    alignSelf: 'flex-start',
  },
}));

interface DeleteRoleTemplateDialogProps {
  open: boolean;
  roleId?: string;
  onClose: (isDeleted: boolean) => void;
  onDelete?: () => void;
}

const DeleteRoleTemplateDialog: VoidFunctionComponent<DeleteRoleTemplateDialogProps> = ({
  open,
  roleId,
  onClose,
  onDelete,
}: DeleteRoleTemplateDialogProps) => {
  const { t } = useWebTranslation(['common', 'role']);
  const classes = useStyles();
  const { dispatch } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useIsMountedRef();

  const handleError = useCallback(
    (error: Error) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to delete_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    },
    [dispatch, t],
  );

  const [deleteRoleTemplate] = useMutation<DeleteRoleTemplateResponse, DeleteRoleTemplatePayload>(
    DELETE_ROLE_TEMPLATE,
    {
      onError: (err) => {
        handleError(err);
      },
    },
  );

  const handleDelete = useCallback(async () => {
    if (!roleId) return;
    setIsDeleting(true);
    let isDeleted = false;
    if (onDelete) {
      onDelete();
      isDeleted = true;
    } else {
      const { data } = await deleteRoleTemplate({
        variables: {
          templateId: roleId,
        },
      });
      isDeleted = data?.deleteRoleTemplate || false;
    }
    if (isDeleted) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('role:This role has been deleted successfully_'),
        },
      });
    } else {
      handleError(new Error('Unknown error'));
    }
    if (isMountedRef.current) {
      setIsDeleting(false);
      onClose(true);
    }
  }, [deleteRoleTemplate, dispatch, handleError, isMountedRef, onClose, onDelete, roleId, t]);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('common:Are you sure you want to delete?')}
      content={
        <div className={classes.content}>
          <Typography variant="body1" className={classes.subtitle}>
            {t('role:This role will no longer be available for use_')}
          </Typography>
          <Button variant="contained" color="primary" disabled={isDeleting} onClick={handleDelete}>
            {t('common:Delete')}
          </Button>
        </div>
      }
    />
  );
};

export default DeleteRoleTemplateDialog;
