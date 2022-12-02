import { useTranslation } from 'react-i18next';
import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { PartialNode } from '../../api/searchUsers';

interface RowData extends PartialNode {
  key: string;
}

interface DeleteStaffDialogProps {
  open: boolean;
  selectedRows: RowData[];
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteStaffDialog: VoidFunctionComponent<DeleteStaffDialogProps> = ({
  open,
  selectedRows,
  classes,
  onClose,
}: DeleteStaffDialogProps) => {
  const { t } = useTranslation(['common', 'column', 'device']);

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('device:Are you sure you want to remove this staff?', {
        count: selectedRows.length,
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

export default DeleteStaffDialog;
