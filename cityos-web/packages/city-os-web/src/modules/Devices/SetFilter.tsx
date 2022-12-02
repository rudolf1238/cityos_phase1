import { SubmitHandler, useForm } from 'react-hook-form';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Button from '@material-ui/core/Button';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { DeviceType } from 'city-os-common/libs/schema';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useHiddenStyles from 'city-os-common/styles/hidden';

import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  form: {
    border: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 4),
    width: '100%',
    maxWidth: `calc(100vw - ${theme.spacing(14)}px)`,
  },

  popover: {
    marginTop: theme.spacing(2),
  },

  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },
}));

export interface FilterPayload {
  deviceName?: string;
  deviceType: Exclude<DeviceType, DeviceType.UNKNOWN> | 'ALL';
  description?: string;
}

interface SetFilterProps {
  activeStep: number;
  onClick: (value: FilterPayload) => void;
}

const SetFilter: VoidFunctionComponent<SetFilterProps> = ({
  activeStep,
  onClick,
}: SetFilterProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useWebTranslation(['common', 'column', 'device']);
  const { tDevice } = useDeviceTranslation();
  const { register, watch, getValues, handleSubmit, reset } = useForm<FilterPayload>({
    mode: 'onSubmit',
  });

  const onSubmit = useCallback<SubmitHandler<FilterPayload>>(() => {
    onClick({
      deviceName: getValues('deviceName'),
      deviceType: getValues('deviceType'),
      description: getValues('description'),
    });
    if (activeStep === 1) {
      reset({
        deviceName: '',
        deviceType: 'ALL',
        description: '',
      });
    }
  }, [activeStep, getValues, onClick, reset]);

  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={smDown ? 5 : 2}>
        <Grid item xs={8} md={3}>
          <TextField
            label={t('column:Device Name')}
            value={watch('deviceName') || ''}
            placeholder={t('device:Insert device name')}
            variant="outlined"
            type="text"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={register('deviceName')}
          />
        </Grid>
        <Grid item xs={4} className={hiddenClasses.mdUpHidden} />
        <Grid item xs={8} md={3}>
          <TextField
            label={t('common:Device Type')}
            value={watch('deviceType') || 'ALL'}
            variant="outlined"
            type="text"
            select
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={register('deviceType')}
            SelectProps={{
              IconComponent: ExpandMoreRoundedIcon,
              MenuProps: {
                getContentAnchorEl: null,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                className: classes.menu,
                MenuListProps: {
                  className: classes.menuList,
                },
                PaperProps: {
                  variant: 'outlined',
                },
                PopoverClasses: {
                  root: classes.popover,
                },
              },
            }}
          >
            <MenuItem key="ALL" value="ALL">
              {t('device:All Types')}
            </MenuItem>
            {(Object.keys(DeviceType) as DeviceType[])
              .filter((deviceType) => deviceType !== DeviceType.UNKNOWN)
              .map((type) => (
                <MenuItem key={type} value={type}>
                  {tDevice(type)}
                </MenuItem>
              ))}
          </TextField>
        </Grid>
        <Grid item xs={4} className={hiddenClasses.mdUpHidden} />
        <Grid item xs={8} md={3}>
          <TextField
            label={t('common:Description')}
            value={watch('description') || ''}
            variant="outlined"
            type="text"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={register('description')}
          />
        </Grid>
        <Grid item xs={4} md={1} />
        <Grid item xs={4} md={2}>
          <Button
            type="submit"
            size="small"
            color="primary"
            fullWidth
            variant={activeStep === 0 ? 'contained' : 'outlined'}
          >
            {activeStep === 0 ? t('common:Search') : t('common:Clear')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default SetFilter;
