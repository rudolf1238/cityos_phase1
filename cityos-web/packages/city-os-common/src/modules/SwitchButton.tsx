import { makeStyles } from '@material-ui/core/styles';
import React, { ReactElement, memo } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    border: `1px solid ${theme.palette.automation.track}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25),
    width: 200,
    height: 42,
  },

  button: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    color: theme.palette.grey[300],

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  checked: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

interface SwitchButtonProps<T extends string | number | boolean | undefined> {
  buttons: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

const SwitchButton = <T extends string | number | boolean | undefined>({
  buttons,
  value,
  onChange,
}: SwitchButtonProps<T>): ReactElement => {
  const classes = useStyles();

  return (
    <div className={classes.buttons}>
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant="contained"
          color="primary"
          size="small"
          className={clsx(classes.button, {
            [classes.checked]: value === button.value,
          })}
          onClick={() => {
            onChange(button.value);
          }}
        >
          <Typography variant="h5">{button.label}</Typography>
        </Button>
      ))}
    </div>
  );
};

export default memo(SwitchButton);
