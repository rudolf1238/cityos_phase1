import { fade, makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Alert from '@material-ui/lab/Alert';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: fade(theme.palette.background.default, 0.7),
  },

  root: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    justifyItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    width: '100%',
  },

  icon: {
    paddingTop: theme.spacing(0.5),
  },

  message: {
    width: '100%',
    textAlign: 'center',
  },

  text: {
    paddingBottom: theme.spacing(3),
    textAlign: 'left',
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
  },

  button: {
    width: 'min(100%, 274px)',
  },
}));

interface OverWriteAlertProps {
  isOpen: boolean;
  item: string;
  buttonLabel?: string;
  onClick: () => void;
}

const OverwriteAlert: VoidFunctionComponent<OverWriteAlertProps> = ({
  isOpen,
  item,
  buttonLabel,
  onClick,
}: OverWriteAlertProps) => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();

  return (
    <Backdrop open={isOpen} className={classes.backdrop}>
      <Collapse in={isOpen}>
        <Alert
          severity="error"
          icon={<WarningRoundedIcon aria-label={t('warning')} fontSize="small" />}
          classes={{ root: classes.root, icon: classes.icon, message: classes.message }}
        >
          <div className={classes.text}>
            {t("{{item}} conflict_ Click '{{button}}' button to adjust the devices_", {
              item,
              button: buttonLabel || t('Overwrite'),
            })}
          </div>
          <Button
            type="button"
            aria-label={buttonLabel || t('Overwrite')}
            color="primary"
            size="small"
            variant="contained"
            onClick={onClick}
            className={classes.button}
          >
            {buttonLabel || t('Overwrite')}
          </Button>
        </Alert>
      </Collapse>
    </Backdrop>
  );
};

export default OverwriteAlert;
