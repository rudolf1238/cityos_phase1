import React, { FunctionComponent } from 'react';

import { Button, makeStyles } from '@material-ui/core';

import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  headerButton: {
    width: theme.spacing(22),
    height: theme.spacing(7),
    padding: 'unset',
    borderRadius: theme.spacing(3.5),
    backgroundColor: theme.palette.type === 'dark' ? '#1b2f64' : '#ffffff',
    borderColor: theme.palette.type === 'dark' ? '#1b2f64' : theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '' : '#f5f5f5',
      borderColor: theme.palette.type === 'dark' ? '' : theme.palette.primary.main,
    },
  },
  headerButtonDisabled: {
    backgroundColor: '#f5fcff',
  },
  headerButtonTitle: {
    color: theme.palette.type === 'dark' ? '#ffffff' : '#4f4f4f',
  },
}));

interface ThemeButtonProps {
  startIcon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ThemeButton: FunctionComponent<ThemeButtonProps> = ({
  startIcon,
  disabled = false,
  children,
  style,
  onClick,
}: ThemeButtonProps) => {
  const classes = useStyles();

  return (
    <Button
      style={style}
      variant="outlined"
      color="primary"
      className={clsx(classes.headerButton, { [classes.headerButtonDisabled]: disabled })}
      disabled={disabled}
      startIcon={startIcon}
      onClick={onClick}
    >
      <span className={classes.headerButtonTitle}>{children}</span>
    </Button>
  );
};

export default ThemeButton;
