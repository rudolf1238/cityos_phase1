import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import { ConfigFormType, GadgetConfig, GadgetType } from '../../libs/type';

import GadgetCatalog from './GadgetCatalog';
import GadgetLimitAlert from './GadgetLimitAlert';
import NewGadgetConfig from './NewGadgetConfig';
import useDashboardTranslation from '../../hooks/useDashboardTranslation';
import useGadgetTranslation from '../../hooks/useGadgetTranslation';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 1290,
    height: 948,

    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
    },
  },

  dialogTitle: {
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 2.5),
    },
  },

  configDialog: {
    padding: theme.spacing(6, 10, 3),
    width: 1128,

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },

    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  limitDialog: {
    width: 600,
    height: 270,
  },

  limitDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

interface AddGadgetProps {
  open: boolean;
  enableAdd: boolean;
  onClose: (config?: GadgetConfig<ConfigFormType>) => void;
}

const AddGadget: VoidFunctionComponent<AddGadgetProps> = ({
  open,
  enableAdd,
  onClose,
}: AddGadgetProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['common', 'dashboard']);
  const { tGadget } = useGadgetTranslation();
  const [selectedType, setSelectedType] = useState<GadgetType | null>(null);
  const [openAddedLimit, setOpenAddedLimit] = useState(false);

  const handleSelect = useCallback(
    (gadgetType: GadgetType) => {
      if (enableAdd) {
        setSelectedType(gadgetType);
      } else {
        setOpenAddedLimit(true);
      }
    },
    [enableAdd],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setOpenAddedLimit(false);
    }
  }, [open]);

  if (!open) return null;
  if (selectedType)
    return (
      <BaseDialog
        open={open}
        titleAlign="center"
        onClose={handleClose}
        title={tGadget(selectedType)}
        classes={{
          dialog: classes.configDialog,
          title: classes.dialogTitle,
        }}
        content={<NewGadgetConfig type={selectedType} onSave={onClose} />}
      />
    );
  if (openAddedLimit)
    return (
      <BaseDialog
        open={open}
        onClose={handleClose}
        title={t('dashboard:Gadget number limited_')}
        classes={{
          dialog: classes.limitDialog,
          content: classes.limitDialogContent,
          title: classes.dialogTitle,
        }}
        content={<GadgetLimitAlert onClose={handleClose} />}
      />
    );
  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={t('dashboard:Add Gadget')}
      classes={{ dialog: classes.dialog }}
      content={<GadgetCatalog open={!selectedType} onSelect={handleSelect} />}
    />
  );
};

export default memo(AddGadget);
