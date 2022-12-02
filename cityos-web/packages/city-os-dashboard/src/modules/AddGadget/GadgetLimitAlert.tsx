import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import useDashboardTranslation from '../../hooks/useDashboardTranslation';

const useStyles = makeStyles(() => ({
  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },
}));

interface GadgetLimitAlertProps {
  onClose: () => void;
}

const GadgetLimitAlert: VoidFunctionComponent<GadgetLimitAlertProps> = ({
  onClose,
}: GadgetLimitAlertProps) => {
  const { t } = useDashboardTranslation(['common', 'dashboard']);
  const classes = useStyles();

  return (
    <>
      <Typography variant="body1">
        {t('dashboard:Unable to add another gadget to this page_')}
      </Typography>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={onClose}
        className={classes.dialogButton}
      >
        {t('common:OK')}
      </Button>
    </>
  );
};

export default memo(GadgetLimitAlert);
