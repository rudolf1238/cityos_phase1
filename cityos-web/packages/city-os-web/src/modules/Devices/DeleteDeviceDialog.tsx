import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { RowData } from './types';
import useWebTranslation from '../../hooks/useWebTranslation';

interface DeleteDeviceDialogProps {
  open: boolean;
  selectedRows: RowData[];
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteDeviceDialog: VoidFunctionComponent<DeleteDeviceDialogProps> = ({
  open,
  selectedRows,
  classes,
  onClose,
}: DeleteDeviceDialogProps) => {
  const { t } = useWebTranslation(['common', 'column', 'device']);

  const {
    userProfile: { divisionGroup },
  } = useStore();

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('device:Are you sure you want to remove the device?', {
        count: selectedRows.length,
      })}
      classes={{ dialog: classes?.root, content: classes?.content }}
      content={
        <>
          <Typography variant="body1">
            {t(
              'device:This device will be removed from the division {{divisionName}}_ You can add it again later if desired_',
              { divisionName: divisionGroup?.name || '' },
            )}
          </Typography>
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
