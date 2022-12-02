import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import { Gender } from '../libs/schema';

import FemaleIcon from '../assets/icon/female.svg';
import MaleIcon from '../assets/icon/male.svg';

const useStyles = makeStyles((theme) => ({
  female: {
    color: theme.palette.gadget.female,
  },

  male: {
    color: theme.palette.gadget.male,
  },
}));

interface GenderIconProps {
  gender: Gender;
}

const GenderIcon: VoidFunctionComponent<GenderIconProps> = ({ gender }: GenderIconProps) => {
  const classes = useStyles();

  switch (gender) {
    case Gender.MALE:
      return <MaleIcon className={classes.male} />;
    default:
      return <FemaleIcon className={classes.female} />;
  }
};

export default GenderIcon;
