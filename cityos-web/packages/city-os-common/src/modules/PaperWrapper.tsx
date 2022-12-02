import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4.5, 12, 5.5),
    width: `min(752px, calc(100vw - ${theme.spacing(2)}px))`,
  },

  title: {
    marginBottom: theme.spacing(4.5),
  },

  message: {
    marginTop: theme.spacing(4.5),
  },

  buttonWrapper: {
    padding: theme.spacing(6, 17, 0),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 10, 0),
    },
  },

  button: {
    padding: theme.spacing(2, 10),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 5),
    },
  },
}));

interface CustomClasses {
  paper?: string;
  title?: string;
}

interface PaperWrapperProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  classes?: CustomClasses;
}

const PaperWrapper: FunctionComponent<PaperWrapperProps> = ({
  title,
  message,
  actionText,
  onAction,
  classes: customClasses,
  children,
}: PropsWithChildren<PaperWrapperProps>) => {
  const classes = useStyles();

  return (
    <Paper elevation={3} className={clsx(classes.paper, customClasses?.paper)}>
      {title && (
        <Typography
          variant="h4"
          align="center"
          className={clsx(classes.title, customClasses?.title)}
        >
          {title}
        </Typography>
      )}
      {message && (
        <Typography variant="body1" className={classes.message}>
          {message}
        </Typography>
      )}
      {children}
      {actionText && (
        <div className={classes.buttonWrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            size="large"
            fullWidth
            onClick={onAction}
          >
            {actionText}
          </Button>
        </div>
      )}
    </Paper>
  );
};

export default PaperWrapper;
