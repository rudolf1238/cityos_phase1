import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { DELETE_USERS, DeleteUsersPayload, DeleteUsersResponse } from '../../api/deleteUsers';
import { PartialNode } from '../../api/searchUsers';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles(() => ({
  dialog: {
    width: 600,
    height: 300,
  },

  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },
}));

interface RowData extends PartialNode {
  key: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  selectedRows: RowData[];
  onClose: (isDeleted: boolean) => void;
  onChanged: (isChanged: boolean) => void;
}

const DeleteUserDialog: VoidFunctionComponent<DeleteUserDialogProps> = ({
  open,
  selectedRows,
  onClose,
  onChanged,
}: DeleteUserDialogProps) => {
  const { t } = useWebTranslation(['common', 'user']);
  const classes = useStyles();
  const {
    dispatch,
    user,
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();
  const isMountedRef = useIsMountedRef();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleError = useCallback(
    (error: Error) => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('user:Remove user failed_ Please try again_'),
        },
      });
      if (D_DEBUG) console.error(error);
    },
    [dispatch, t],
  );

  const [deleteUsers, { loading }] = useMutation<DeleteUsersResponse, DeleteUsersPayload>(
    DELETE_USERS,
    {
      onCompleted: (data) => {
        if (data.deleteUsers.length > 0) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('user:This user has been removed successfully_'),
            },
          });
        } else {
          handleError(new Error('Unknown error'));
        }
      },
      onError: (error) => {
        handleError(error);
      },
    },
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    if (!divisionGroup) {
      handleError(new Error('No division group'));
      return;
    }
    const isInRootGroup = permissionGroup?.group?.id === divisionGroup.id;
    const deleteEmails = selectedRows.reduce<string[]>((emailList, { email }) => {
      if (isInRootGroup && email === user.email) return emailList;
      return emailList.concat(email);
    }, []);
    await deleteUsers({
      variables: {
        groupId: divisionGroup.id,
        emails: deleteEmails,
      },
    });
    if (isMountedRef.current) onClose(true);
    if (isMountedRef.current) setIsDeleting(false);
  }, [
    divisionGroup,
    permissionGroup?.group?.id,
    selectedRows,
    isMountedRef,
    user.email,
    deleteUsers,
    onClose,
    handleError,
  ]);

  useEffect(() => {
    onChanged(loading);
  }, [loading, onChanged]);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('user:Are you sure you want to remove this user_')}
      content={
        <div className={classes.dialogContent}>
          {t('user:This user will not be able to access this division_')}
          <Button
            variant="contained"
            size="small"
            color="primary"
            className={classes.dialogButton}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {t('common:Remove')}
          </Button>
        </div>
      }
      classes={{ dialog: classes.dialog }}
    />
  );
};

export default DeleteUserDialog;
