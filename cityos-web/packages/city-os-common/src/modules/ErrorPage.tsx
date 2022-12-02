import { makeStyles } from '@material-ui/core/styles';
import React, { ReactNode, VoidFunctionComponent } from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import PageWithFooter from './PageWithFooter';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    backgroundColor: theme.palette.background.container,
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: `min(${theme.spacing(90)}px, 90%)`,
  },

  imgWrapper: {
    backgroundColor: theme.palette.background.lightContainer,
    padding: theme.spacing(6, 4, 4),
    textAlign: 'center',
  },

  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 8),
    minHeight: theme.spacing(16),
  },

  text: {
    lineHeight: 2,
  },

  button: {
    alignSelf: 'center',
  },

  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.spacing(14),
  },
}));

interface ErrorPageProps {
  img?: ReactNode;
  text?: string;
  button?: { text: string; onClick: () => void };
}

const ErrorPage: VoidFunctionComponent<ErrorPageProps> = ({
  img,
  text,
  button,
}: ErrorPageProps) => {
  const classes = useStyles();

  return (
    <PageWithFooter
      classes={{
        content: classes.content,
        footer: classes.footer,
      }}
    >
      <Paper elevation={24} className={classes.paper}>
        {img && <div className={classes.imgWrapper}>{img}</div>}
        {(text || button) && (
          <div className={classes.textWrapper}>
            {text && (
              <Typography variant="h6" className={classes.text}>
                {text}
              </Typography>
            )}
            {button && (
              <Button onClick={button.onClick} className={classes.button}>
                <Typography variant="subtitle1">{button?.text}</Typography>
              </Button>
            )}
          </div>
        )}
      </Paper>
    </PageWithFooter>
  );
};

export default ErrorPage;
