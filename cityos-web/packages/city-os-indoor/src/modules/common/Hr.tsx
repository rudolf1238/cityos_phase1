import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: 1,
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  },
}));

const Hr = (): JSX.Element => {
  const classes = useStyles();
  return <div className={classes.root} />;
};

export default Hr;
