import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import Image from 'next/image';
import Paper from '@material-ui/core/Paper';

import useCommonTranslation from '../hooks/useCommonTranslation';

import loadingIcon from '../assets/logo/loading.gif';
import loadingIconDark from '../assets/logo/loading-dark.gif';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },

  paper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 750,
    height: 340,
  },
}));

interface LoadingProps {
  open: boolean;
}

const Loading: VoidFunctionComponent<LoadingProps> = ({ open }: LoadingProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const theme = useTheme();

  return (
    <Backdrop open={open} className={classes.backdrop}>
      <Paper className={classes.paper}>
        <Image
          src={theme.palette.type === 'light' ? loadingIcon : loadingIconDark}
          width={140}
          height={140}
          alt={t('Loading')}
        />
      </Paper>
    </Backdrop>
  );
};

export default Loading;
