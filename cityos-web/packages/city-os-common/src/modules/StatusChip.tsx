import { makeStyles } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent } from 'react';
import clsx from 'clsx';

import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  chip: {
    padding: theme.spacing(0, 0.5),
    fontWeight: theme.typography.h6.fontWeight,
  },

  error: {
    backgroundColor: theme.palette.error.main,
  },

  repair: {
    backgroundColor: theme.palette.warning.main,
  },

  pending: {
    backgroundColor: theme.palette.text.hint,
  },

  disabled: {
    backgroundColor: theme.palette.text.disabled,
    color: theme.palette.text.secondary,
  },
}));

interface StatusChipProps extends Omit<ComponentProps<typeof Chip>, 'color'> {
  color?:
    | ComponentProps<typeof Chip>['color']
    | 'error'
    | 'repair'
    | 'pending'
    | 'disabled'
    | 'processing'
    | 'done'
    | 'none';
}

const StatusChip: VoidFunctionComponent<StatusChipProps> = ({
  color = 'default',
  ...props
}: StatusChipProps) => {
  const classes = useStyles();

  return (
    <Chip
      {...props}
      color={color !== 'primary' ? 'secondary' : color}
      className={clsx(props.className, classes.chip, {
        [classes.error]: color === 'error',
        [classes.repair]: color === 'repair',
        [classes.pending]: color === 'pending',
        [classes.disabled]: color === 'disabled',
      })}
      size={props.size || 'small'}
      variant={props.variant || 'default'}
    />
  );
};

export default StatusChip;
