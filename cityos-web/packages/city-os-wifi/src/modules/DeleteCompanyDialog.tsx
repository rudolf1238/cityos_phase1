import React, { VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';

import BaseDialog from 'city-os-common/modules/BaseDialog';


// import { RowData } from './types';
// import useWebTranslation from '../../hooks/useWebTranslation';
import useWebTranslation from '../../../city-os-web/src/hooks/useWebTranslation';
import { useTranslation } from 'react-i18next';

import {
    PartialCompany,
  } from '../libs/types';

interface RowData extends PartialCompany {
    key: string;
    isLoading?: boolean;
    // status: DeviceStatus;
  }

interface DeleteCompanyDialogProps {
  open: boolean;
  selectedRows: RowData[];
  classes?: { root?: string; content?: string; button: string };
  onClose: (isDeleted?: boolean) => void;
}

const DeleteCompanyDialog: VoidFunctionComponent<DeleteCompanyDialogProps> = ({
  open,
  selectedRows,
  classes,
  onClose,
}: DeleteCompanyDialogProps) => {
  // const { t } = useWebTranslation(['common']);
  const { t } = useTranslation(['wifi']);


  const {
    userProfile: { divisionGroup },
  } = useStore();

  return (
    <BaseDialog
      open={open}
      onClose={() => onClose(false)}
      title={t('wifi:Are you sure you want to remove the company?', {
        count: selectedRows.length,
      })}
      classes={{ dialog: classes?.root, content: classes?.content }}
      content={
        <>
          <Typography variant="body1">
            {t(
              'wifi:This company will be removed from the division {{divisionName}}_ You can add it again later if desired_',
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
            {t('wifi:Remove')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteCompanyDialog;
