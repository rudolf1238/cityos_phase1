import { makeStyles } from '@material-ui/core/styles';
import { useFormContext } from 'react-hook-form';
import React, { FunctionComponent } from 'react';

import dynamic from 'next/dynamic';

import Grid from '@material-ui/core/Grid';
import NoSsr from '@material-ui/core/NoSsr';
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';

import { DetailFormData, locationRegex } from '../types';
import useWebTranslation from '../../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: theme.spacing(95),
  },

  name: {
    marginBottom: theme.spacing(3),
  },

  fullHeight: {
    height: '100%',
  },

  location: {
    marginBottom: theme.spacing(3),
  },
  mapSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: theme.spacing(1),
  },
}));

interface EditDeviceProps {
  enableModify?: boolean;
}

const EditDevice: FunctionComponent<EditDeviceProps> = ({
  enableModify = false,
}: EditDeviceProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'column', 'device']);

  const {
    register,
    formState: { errors },
  } = useFormContext<DetailFormData>();

  const requireDeviceName = t('device:Device name cannot be blank_');

  const EditDeviceMap = React.useMemo(
    () =>
      dynamic(() => import('./EditDeviceMap'), {
        loading: () => <Skeleton variant="rect" className={classes.mapSkeleton} />,
        ssr: false,
      }),
    [classes.mapSkeleton],
  );

  return (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={5}>
        <TextField
          label={t('column:Device Name')}
          placeholder={t('device:Insert device name')}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          className={classes.name}
          inputProps={{
            ...register('name', {
              required: requireDeviceName,
              validate: (value) => value?.trim() !== '' || requireDeviceName,
              maxLength: {
                value: 255,
                message: t('common:Max_ {{count}} character', { count: 255 }),
              },
            }),
            readOnly: !enableModify,
          }}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label={t('column:Location')}
          placeholder={t('device:23_00001_ 120_00001')}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          className={classes.location}
          inputProps={{
            ...register('location', {
              pattern: {
                value: locationRegex,
                message: t('device:The location is not supported or not allowed_'),
              },
            }),
            readOnly: !enableModify,
          }}
          error={!!errors.location}
          helperText={errors.location?.message}
        />
        <TextField
          label={t('common:Description')}
          placeholder={t('device:Insert description')}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            className: classes.fullHeight,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            ...register('desc', {
              maxLength: {
                value: 2000,
                message: t('common:Max_ {{count}} character', { count: 2000 }),
              },
            }),
            readOnly: !enableModify,
          }}
          error={!!errors.desc}
          helperText={errors.desc?.message}
        />
      </Grid>
      <Grid item xs={7}>
        <NoSsr>
          <EditDeviceMap />
        </NoSsr>
      </Grid>
    </Grid>
  );
};

export default EditDevice;
