import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import useAbnormalTranslation from '../../hooks/useAbnormalTranslation';

interface DeleteDeviceDialogProps {
  user: string;
  open: boolean;
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteDeviceDialog: VoidFunctionComponent<DeleteDeviceDialogProps> = ({
  user,
  open,
  classes,
  onClose,
}: DeleteDeviceDialogProps) => {
  const { t } = useAbnormalTranslation(['common', 'column', 'device']);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('device:Are you sure you want to remove the device maintained by staff {{user}}?', {
        user,
      })}
      classes={{ dialog: classes?.root, content: classes?.content }}
      content={
        <>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => onClose(true)}
            className={classes?.button}
          >
            {t('common:Remove')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteDeviceDialog;
