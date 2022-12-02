import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';

import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: theme.spacing(1),
  },
  colorBox: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

interface ItemBoxProps {
  label: string;
  color: string;
}

const ItemBox: VoidFunctionComponent<ItemBoxProps> = (props: ItemBoxProps) => {
  const { label, color } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.colorBox} style={{ backgroundColor: color }} />
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="body2" style={{ opacity: 0.75 }}>
        {color}
      </Typography>
    </div>
  );
};

export default memo(ItemBox);
