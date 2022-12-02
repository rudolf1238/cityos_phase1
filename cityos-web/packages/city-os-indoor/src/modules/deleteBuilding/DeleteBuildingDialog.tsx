import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import { useMutation } from '@apollo/client';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import {
  DELETE_BUILDING,
  DeleteBuildingInfoPayload,
  DeleteBuildingInfoResponse,
} from '../../api/deleteBuildinginfo';
import I18nMapProvider from '../I18nIndoorProvider';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

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

interface DeleteBuildingDialogProps {
  open: boolean;
  onClose: () => void;
  buildingdeviceId: string;
  /*
  open: boolean;
  selected: string[];
  onClose: () => void;
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
  */
}

const DeleteBuildingDialog: VoidFunctionComponent<DeleteBuildingDialogProps> = ({
  open,
  onClose,
  buildingdeviceId,
}: DeleteBuildingDialogProps) => {
  const { t } = useIndoorTranslation(['indoor']);
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();

  const {
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();

  const [deleteBuilding] = useMutation<DeleteBuildingInfoResponse, DeleteBuildingInfoPayload>(
    DELETE_BUILDING,
  );

  const [confirmValue, setConfirmValue] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = useCallback(
    async () => {
      setIsDeleting(true);
      try {
        // if (!selected[0]) throw new Error('can not find selected group');
        const groupId = divisionGroup?.id ? divisionGroup?.id : '';
        await deleteBuilding({
          variables: {
            groupId,
            deviceId: buildingdeviceId,
          },
        });
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('indoor:The building has been deleted successfully_'),
          },
        });
        // onChanged();
      } catch (error) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('indoor:Delete failed_ Please try again_'),
          },
        });
        if (D_DEBUG) console.error(error);
      }
      if (isMountedRef.current) {
        setIsDeleting(false);
        setConfirmValue('');
        onClose();
      }
    } /* [isMountedRef, selected, deleteBuilding, dispatch, t, onChanged, onClose] */,
    [isMountedRef, divisionGroup?.id, deleteBuilding, buildingdeviceId, dispatch, t, onClose],
  );

  const isValid = useMemo(() => confirmValue === 'DELETE', [confirmValue]);

  /*
  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);
  */

  return (
    <I18nMapProvider>
      <BaseDialog
        open={open}
        onClose={onClose}
        title={t('indoor:Are you sure you want to delete?')}
        content={
          <div className={classes.content}>
            <Typography variant="body1" className={classes.subtitle}>
              {t('indoor:It will no longer be able to be used.')}
            </Typography>
            <TextField
              value={confirmValue}
              onChange={(event) => setConfirmValue(event.target.value.toUpperCase())}
              placeholder={t('indoor:Type “DELETE” to confirm')}
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
              {t('indoor:Ok')}
            </Button>
          </div>
        }
      />
    </I18nMapProvider>
  );
};

export default DeleteBuildingDialog;
