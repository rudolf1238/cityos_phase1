import { makeStyles } from '@material-ui/core/styles';
import React, { MouseEventHandler, VoidFunctionComponent } from 'react';

import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import { useMapContext } from '../MapProvider';
import useMapTranslation from '../../hooks/useMapTranslation';

const useStyles = makeStyles((theme) => ({
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0, 1, 3),

    '& > p': {
      color: theme.palette.info.main,
    },
  },

  title: {
    marginRight: 'auto',
  },

  iconWrapper: {
    color: theme.palette.info.main,

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },
}));

interface TitleBarProps {
  onClick: MouseEventHandler;
}

const TitleBar: VoidFunctionComponent<TitleBarProps> = ({ onClick }: TitleBarProps) => {
  const { t } = useMapTranslation(['common', 'map']);
  const classes = useStyles();
  const { selectedIdList } = useMapContext();

  return (
    <div className={classes.titleBar}>
      <Typography variant="h6" className={classes.title}>
        {t('map:Pole')}
      </Typography>
      <Typography variant="body2">{t('map:{{n}} selected', { n: selectedIdList.size })}</Typography>
      <IconButton aria-label={t('common:Clear')} className={classes.iconWrapper} onClick={onClick}>
        <CancelIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default TitleBar;
