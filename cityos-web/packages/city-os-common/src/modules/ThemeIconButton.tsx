import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  memo,
} from 'react';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.contrastText,
    width: 56,
    height: 56,
    ...theme.overrides?.MuiButton?.outlinedPrimary,

    '&:hover': {
      borderColor: theme.palette.themeIconButton.hoverStandardBorder,
      backgroundColor: theme.palette.themeIconButton.hoverStandard,
      color: theme.palette.themeIconButton.hoverStandardText,
    },
  },

  contained: {
    borderWidth: 0,
    backgroundColor: theme.palette.primary.main,

    '& > span': {
      color: theme.palette.primary.contrastText,
    },

    '&:hover': {
      borderWidth: 0,
      backgroundColor: theme.palette.primary.dark,
    },

    '&:disabled': {
      backgroundColor: theme.palette.background.disabled,
    },

    '&:disabled > span': {
      color: theme.palette.themeIconButton.disabledText,
    },
  },

  standard: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',

    '&:hover': {
      borderColor: theme.palette.themeIconButton.hoverStandardBorder,
      backgroundColor: theme.palette.themeIconButton.hoverStandard,
      color: theme.palette.themeIconButton.hoverStandardText,
    },
  },

  miner: {
    borderRadius: theme.shape.borderRadius,

    [`&:hover,
    &:disabled`]: {
      borderColor: 'transparent',
    },
  },

  small: {
    padding: 0,
    width: 40,
    height: 40,
  },

  tooltip: {
    marginTop: 0,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
  },

  iconWrapper: {
    display: 'inline-block',
  },
}));

interface ThemeIconButtonProps extends ComponentProps<typeof IconButton> {
  variant?: 'outlined' | 'contained' | 'standard' | 'miner';
  tooltip?: ReactNode;
  tooltipVariant?: 'default' | 'standard';
  isLabel?: boolean;
}

const ThemeIconButton: FunctionComponent<ThemeIconButtonProps> = ({
  variant = 'outlined',
  tooltip,
  tooltipVariant = 'default',
  children,
  isLabel,
  ...props
}: PropsWithChildren<ThemeIconButtonProps>) => {
  const classes = useStyles();

  const InnerButton = (
    <IconButton
      {...(isLabel ? { component: 'label' } : {})}
      {...props}
      classes={{
        ...props.classes,
        root: clsx(props.classes?.root, classes.root, {
          [classes.contained]: variant === 'contained',
          [classes.standard]: variant === 'standard' || variant === 'miner',
          [classes.miner]: variant === 'miner',
        }),
        sizeSmall: clsx(props.classes?.sizeSmall, classes.small),
      }}
    >
      {children}
    </IconButton>
  );

  return tooltip ? (
    <Tooltip
      title={tooltip}
      classes={{
        tooltipPlacementBottom: tooltipVariant === 'default' ? classes.tooltip : undefined,
        tooltipPlacementTop: tooltipVariant === 'default' ? classes.tooltip : undefined,
      }}
    >
      <span className={classes.iconWrapper}>{InnerButton}</span>
    </Tooltip>
  ) : (
    InnerButton
  );
};

export default memo(ThemeIconButton);
