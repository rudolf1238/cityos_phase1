import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CircleCheckbox from 'city-os-common/modules/Checkbox';

import useMapTranslation from '../../../hooks/useMapTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    backgroundColor: theme.palette.background.light,
    padding: theme.spacing(3, 7.5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },

  controller: {
    display: 'flex',
    alignItems: 'center',
  },

  title: {
    paddingLeft: theme.spacing(2),
    whiteSpace: 'nowrap',
  },

  timezoneWrapper: {
    textAlign: 'right',
  },

  timezone: {
    display: 'inline-block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

interface EnableControllerProps {
  isEnabled: boolean;
  onChange: () => void;
  item: string;
  /** timezone string in any format, it won't be parsed in further */
  timezone?: string;
}

const EnableController: VoidFunctionComponent<EnableControllerProps> = ({
  isEnabled,
  onChange,
  item,
  timezone,
}: EnableControllerProps) => {
  const { t } = useMapTranslation(['common', 'map']);
  const classes = useStyles();

  return (
    <Grid container alignItems="center" className={classes.root}>
      <Grid item xs={12} sm={5} className={classes.controller}>
        <CircleCheckbox checked={isEnabled} onChange={onChange} />
        <Typography variant="body1" className={classes.title}>
          {t('map:Enable {{item}}', { item })}
        </Typography>
      </Grid>
      {timezone && (
        <Grid item xs={12} sm={7} className={classes.timezoneWrapper}>
          <Typography variant="body1" className={classes.timezone}>
            {t('common:Time Zone')}: {timezone}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default EnableController;
