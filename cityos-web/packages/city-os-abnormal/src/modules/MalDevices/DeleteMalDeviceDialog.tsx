import { useTranslation } from 'react-i18next';
import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';

import { PartialNode } from '../../api/getMalDevices';

interface RowData extends PartialNode {
  key: string;
}

interface DeleteMalDeviceDialogProps {
  open: boolean;
  selectedRows: RowData[];
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteMalDeviceDialog: VoidFunctionComponent<DeleteMalDeviceDialogProps> = ({
  open,
  selectedRows,
  classes,
  onClose,
}: DeleteMalDeviceDialogProps) => {
  const { t } = useTranslation(['common', 'column', 'device', 'info']);

  const {
    userProfile: { divisionGroup },
  } = useStore();

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('info:Are you sure you want to remove the device?', {
        count: selectedRows.length,
      })}
      classes={{ dialog: classes?.root, content: classes?.content }}
      content={
        <>
          <Typography variant="body1">
            {t('info:This maldevice will be removed from the division {{divisionName}}', {
              divisionName: divisionGroup?.name || '',
            })}
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

export default DeleteMalDeviceDialog;
