import { makeStyles } from '@material-ui/core/styles';
import React, { ReactNode, VoidFunctionComponent } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import useCommonTranslation from '../hooks/useCommonTranslation';

import ThemeIconButton from './ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4, 4, 3),
  },

  dialogTitle: {
    padding: theme.spacing(0, 0, 3),
  },

  closeIconWrapper: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },

  messageContent: {
    padding: 0,
  },
}));

interface CustomClasses {
  dialog?: string;
  content?: string;
  title?: string;
}

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleVariant?: Parameters<typeof Typography>[0]['variant'];
  titleAlign?: Parameters<typeof Typography>[0]['align'];
  content: ReactNode;
  buttonText?: string;
  classes?: CustomClasses;
}

const BaseDialog: VoidFunctionComponent<BaseDialogProps> = ({
  open,
  onClose,
  title,
  titleVariant = 'h5',
  titleAlign = 'left',
  content,
  buttonText,
  classes: customClasses,
}: BaseDialogProps) => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{
        paper: clsx(classes.paper, customClasses?.dialog),
      }}
      maxWidth={false}
    >
      <ThemeIconButton
        color="primary"
        aria-label={t('Close')}
        size="small"
        variant="miner"
        className={classes.closeIconWrapper}
        onClick={onClose}
      >
        <CloseIcon />
      </ThemeIconButton>
      <DialogTitle
        disableTypography
        classes={{
          root: clsx(classes.dialogTitle, customClasses?.title),
        }}
      >
        {typeof title === 'string' || typeof title === 'number' ? (
          <Typography variant={titleVariant} align={titleAlign}>
            {title}
          </Typography>
        ) : (
          title
        )}
      </DialogTitle>
      <DialogContent
        classes={{
          root: clsx(classes.messageContent, customClasses?.content),
        }}
      >
        {typeof content === 'string' ? <DialogContentText>{content}</DialogContentText> : content}
      </DialogContent>
      {buttonText && (
        <DialogActions>
          <Button fullWidth size="large" variant="contained" color="primary" onClick={onClose}>
            {buttonText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BaseDialog;
