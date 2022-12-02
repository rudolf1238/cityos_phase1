import React, { ReactNode, VoidFunctionComponent } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import clsx from 'clsx';

import useCommonTranslation from 'city-os-common/hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginBottom: 24,
  },

  dialogTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(0),
  },

  closeIconWrapper: {
    position: 'absolute',
    top: 15,
    right: 7.5,

    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  },

  messageContent: {
    padding: 0,
  },
}));

interface CustomClasses {
  dialog?: string;
  content?: string;
}

interface FixBaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleVariant?: Parameters<typeof Typography>[0]['variant'];
  titleAlign?: Parameters<typeof Typography>[0]['align'];
  content: string | ReactNode;
  footer?: string | ReactNode;
  classes?: CustomClasses;
}

const FixBaseDialog: VoidFunctionComponent<FixBaseDialogProps> = ({
  open,
  onClose,
  title,
  titleVariant = 'h4',
  titleAlign = 'left',
  content,
  footer,
  classes: customClasses,
}: FixBaseDialogProps) => {
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
      <IconButton
        color="primary"
        aria-label={t('Close')}
        component="span"
        className={classes.closeIconWrapper}
        onClick={onClose}
      >
        <CloseIcon style={{ fontSize: '40px' }} />
      </IconButton>
      <DialogTitle
        disableTypography
        classes={{
          root: classes.dialogTitle,
        }}
      >
        <Typography variant={titleVariant} align={titleAlign}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent
        classes={{
          root: clsx(classes.messageContent, customClasses?.content),
        }}
      >
        {typeof content === 'string' ? <DialogContentText>{content}</DialogContentText> : content}
      </DialogContent>
      {footer && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  );
};

export default FixBaseDialog;
