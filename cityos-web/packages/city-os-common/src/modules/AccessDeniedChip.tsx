import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import BlockIcon from '@material-ui/icons/Block';
import Typography from '@material-ui/core/Typography';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  deniedIcon: {
    width: 20,
    height: 20,
  },
}));

const AccessDeniedChip: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');

  return (
    <div className={classes.root}>
      <BlockIcon color="error" className={classes.deniedIcon} />
      <Typography variant="body2" color="textSecondary">
        {t('Access denied')}
      </Typography>
    </div>
  );
};

export default AccessDeniedChip;
