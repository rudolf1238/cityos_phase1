import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { DELETE_GROUP, DeleteGroupPayload, DeleteGroupResponse } from '../../api/deleteGroup';
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

  textField: {
    minWidth: 280,
    maxWidth: 360,
  },
}));

interface DeleteDivisionDialogProps {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

const DeleteDivisionDialog: VoidFunctionComponent<DeleteDivisionDialogProps> = ({
  open,
  selected,
  onClose,
  onChanged,
  onUpdating,
}: DeleteDivisionDialogProps) => {
  const { t } = useWebTranslation(['common', 'division']);
  const classes = useStyles();
  const { dispatch } = useStore();
  const isMountedRef = useIsMountedRef();

  const [deleteGroup, { loading }] = useMutation<DeleteGroupResponse, DeleteGroupPayload>(
    DELETE_GROUP,
  );

  const [confirmValue, setConfirmValue] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = useCallback(async () => {
    setIsDeleting(true);
    try {
      if (!selected[0]) throw new Error('can not find selected group');
      await deleteGroup({
        variables: {
          groupId: selected[0],
        },
      });
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('division:The division has been deleted successfully_'),
        },
      });
      onChanged();
    } catch (error) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to delete_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    }
    if (isMountedRef.current) {
      setIsDeleting(false);
      setConfirmValue('');
      onClose();
    }
  }, [isMountedRef, selected, deleteGroup, dispatch, t, onChanged, onClose]);

  const isValid = useMemo(() => confirmValue === 'DELETE', [confirmValue]);

  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={t('common:Are you sure you want to delete?')}
      content={
        <div className={classes.content}>
          <Typography variant="body1" className={classes.subtitle}>
            {t('division:This division will no longer be able to be used_')}
          </Typography>
          <TextField
            value={confirmValue}
            onChange={(event) => setConfirmValue(event.target.value.toUpperCase())}
            placeholder={t('division:Type "DELETE" to confirm_')}
            fullWidth
            variant="outlined"
            className={classes.textField}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!isValid || isDeleting}
            onClick={handleRemove}
          >
            {t('common:OK')}
          </Button>
        </div>
      }
    />
  );
};

export default DeleteDivisionDialog;
