import { makeStyles } from '@material-ui/core/styles';
import React, { ComponentProps, FunctionComponent, HTMLProps, PropsWithChildren } from 'react';
import clsx from 'clsx';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: 0,
    width: '100%',
  },

  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: theme.spacing(0.5),
    minHeight: theme.spacing(9),
  },

  label: {
    marginBottom: theme.spacing(2.5),
  },

  evenRow: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },
  },

  oddRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.oddRow,
    },
  },

  header: {
    marginBottom: theme.spacing(2),
    minHeight: theme.spacing(15),
  },

  backgroundDark: {
    backgroundColor: theme.palette.background.light,
  },

  backgroundLight: {
    backgroundColor: theme.palette.background.oddRow,
  },

  backgroundDefault: {
    backgroundColor: theme.palette.background.evenRow,
  },

  outlined: {
    border: `1px solid rgba(0, 0, 0, 0.1)`,
  },

  rounded: {
    borderRadius: theme.spacing(0.5),
  },

  overview: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface OverviewCellProps extends Omit<ComponentProps<typeof Grid>, 'item'> {
  label?: string;
  value?: string;
  valueVariant?: ComponentProps<typeof Typography>['variant'];
}

const OverviewCell: FunctionComponent<OverviewCellProps> = ({
  label,
  value,
  valueVariant = 'body1',
  children,
  ...props
}: PropsWithChildren<OverviewCellProps>) => {
  const classes = useStyles();

  return (
    <Grid xs {...props} item className={clsx(classes.cell, props.className)}>
      {label && (
        <Typography variant="body2" color="textSecondary" className={classes.label}>
          {label}
        </Typography>
      )}
      {value && <Typography variant={valueVariant}>{value}</Typography>}
      {!label && !value && children}
    </Grid>
  );
};

interface OverviewRowProps extends Omit<ComponentProps<typeof Grid>, 'container'> {
  type?: 'header' | 'content';
  color?: 'default' | 'dark' | 'light';
  variant?: 'outlined';
  rounded?: boolean;
  reverseRowColor?: boolean;
}

const OverviewRow: FunctionComponent<OverviewRowProps> = ({
  type = 'content',
  color = type === 'header' ? 'dark' : 'default',
  variant,
  rounded = false,
  reverseRowColor = false,
  children,
  ...props
}: PropsWithChildren<OverviewRowProps>) => {
  const classes = useStyles();

  return (
    <Grid
      {...props}
      container
      className={clsx(
        classes.container,
        reverseRowColor ? classes.oddRow : classes.evenRow,
        { [classes.header]: type === 'header' },
        { [classes.outlined]: variant === 'outlined' || type === 'header' },
        { [classes.rounded]: rounded || type === 'header' },
        { [classes.backgroundDefault]: color === 'default' },
        { [classes.backgroundDark]: color === 'dark' },
        { [classes.backgroundLight]: color === 'light' },
        props.className,
      )}
    >
      {children}
    </Grid>
  );
};

const Overview: FunctionComponent<HTMLProps<HTMLDivElement>> = ({
  children,
  ...props
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
  const classes = useStyles();

  return (
    <div {...props} className={clsx(classes.overview, props.className)}>
      {children}
    </div>
  );
};

export { Overview, OverviewRow, OverviewCell };
