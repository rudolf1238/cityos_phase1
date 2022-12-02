import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import clsx from 'clsx';

import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';

import CheckCircleRoundedIcon from '../assets/icon/checkCheckbox.svg';
import UncheckCircleRoundedIcon from '../assets/icon/uncheckCheckbox.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,

    '&:hover': {
      borderColor: 'transparent !important',
      backgroundColor: 'transparent !important',
    },
  },

  colorPrimary: {
    color: theme.palette.primary.main,
  },
}));

const CircleCheckbox: FunctionComponent<CheckboxProps> = ({
  classes: customClasses,
  ...props
}: PropsWithChildren<CheckboxProps>) => {
  const classes = useStyles();

  return (
    <Checkbox
      icon={<UncheckCircleRoundedIcon />}
      checkedIcon={<CheckCircleRoundedIcon />}
      classes={{
        root: clsx(classes.root, customClasses?.root),
        colorPrimary: clsx(classes.colorPrimary, customClasses?.colorPrimary),
        ...customClasses,
      }}
      color="primary"
      disableRipple
      {...props}
    />
  );
};

export default CircleCheckbox;
