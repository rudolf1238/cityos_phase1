import { makeStyles } from '@material-ui/core/styles';
import { useForm, useFormContext } from 'react-hook-form';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import i18n from 'i18next';

import Button from '@material-ui/core/Button';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { Action, Sensor, SensorType, Subject } from 'city-os-common/libs/schema';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { DetailFormData } from './types';
import { PartialDevice } from '../../api/getDeviceOnDeviceDetail';
import useSensorTypeTranslation from '../../hooks/useSensorTypeTranslation';
import useWebTranslation from '../../hooks/useWebTranslation';

import EditIcon from '../../assets/icon/edit.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(6),
  },

  tableContainer: {
    maxHeight: 320,
  },

  name: {
    width: 160,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  desc: {
    width: 240,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  paper: {
    padding: theme.spacing(6, 11, 7),
    width: 900,
  },

  form: {
    margin: 0,
    width: '100%',

    '& > .MuiGrid-item': {
      marginTop: theme.spacing(5),
    },
  },

  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },

  button: {
    margin: 'auto',
    marginTop: theme.spacing(4.5),
  },
}));

type RowData = Omit<Sensor, 'attributes'>;

interface FormData {
  type: SensorType;
  name: string;
  unit: string;
  desc: string;
}

const Sensors: FunctionComponent = () => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'device']);
  const { tSensorType } = useSensorTypeTranslation();
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { dirtyFields, isValid, errors },
  } = useForm<FormData>({ mode: 'onChange' });
  const detailFormMethods = useFormContext<DetailFormData>();
  const showEdit = useIsEnableRule({ subject: Subject.DEVICE, action: Action.MODIFY });

  const [open, setOpen] = useState(false);
  const [editSensorId, setEditSensorId] = useState<string>();

  const watchSensors = detailFormMethods.watch('sensors');

  const sensorData = useMemo<PartialDevice['sensors']>(
    () =>
      watchSensors
        ? [...watchSensors].sort((a, b) => a.sensorId.localeCompare(b.sensorId, i18n.language))
        : [],
    [watchSensors],
  );

  const renderName = useCallback(
    (rowData: RowData) => <div className={classes.name}>{rowData.name}</div>,
    [classes],
  );

  const renderType = useCallback((rowData: RowData) => tSensorType(rowData?.type), [tSensorType]);

  const renderDesc = useCallback(
    (rowData: RowData) => <div className={classes.desc}>{rowData?.desc}</div>,
    [classes],
  );

  const handleOpen = useCallback(
    ({ sensorId, type, name, unit, desc }: RowData) => {
      setOpen(true);
      setEditSensorId(sensorId);
      reset({
        type,
        name,
        unit: unit || undefined,
        desc: desc || undefined,
      });
    },
    [reset],
  );

  const handleOnClose = useCallback(() => {
    setOpen(false);
  }, []);

  const renderEdit = useCallback(
    (rowData: RowData) => (
      <ThemeIconButton
        color="primary"
        size="small"
        variant="standard"
        tooltip={t('common:Edit')}
        onClick={() => handleOpen(rowData)}
      >
        <EditIcon />
      </ThemeIconButton>
    ),
    [handleOpen, t],
  );

  const columns = useMemo(
    () => [
      { title: t('common:Sensor ID'), field: 'sensorId' },
      { title: t('device:Sensor Name'), render: renderName },
      { title: t('common:Type'), render: renderType },
      { title: t('device:Unit'), field: 'unit' },
      { title: t('common:Description'), render: renderDesc },
      ...(showEdit ? [{ title: '', render: renderEdit }] : []),
    ],
    [showEdit, t, renderName, renderType, renderDesc, renderEdit],
  );

  const onSubmit = useCallback(
    ({ type, name, unit, desc }: FormData) => {
      if (!editSensorId) return;
      const newSensorInput = {
        sensorId: editSensorId,
        name,
        desc,
        type,
        unit,
      };
      const newSensors = [...detailFormMethods.getValues('sensors')];
      const sensorIdx = newSensors.findIndex(({ sensorId }) => sensorId === editSensorId);
      const newInputs = [...detailFormMethods.getValues('editSensorInputs')];
      const inputIdx = newInputs.findIndex(({ sensorId }) => sensorId === editSensorId);
      if (sensorIdx !== -1) {
        newSensors[sensorIdx] = newSensorInput;
        if (inputIdx !== -1) {
          newInputs[inputIdx] = newSensorInput;
        } else {
          newInputs.push(newSensorInput);
        }
        detailFormMethods.setValue('sensors', newSensors, { shouldDirty: true });
        detailFormMethods.setValue('editSensorInputs', newInputs, { shouldDirty: true });
      }
      handleOnClose();
    },
    [editSensorId, detailFormMethods, handleOnClose],
  );

  return (
    <div className={classes.root}>
      <NestedTable
        disabledSelection
        disableNoDataMessage
        stickyHeader
        columns={columns}
        data={sensorData || []}
        classes={{
          container: classes.tableContainer,
        }}
      />
      <BaseDialog
        open={open}
        onClose={handleOnClose}
        title={t('device:Edit Sensor')}
        titleAlign="center"
        titleVariant="h4"
        classes={{ dialog: classes.paper }}
        content={
          <Grid container spacing={2} className={classes.form} component="form">
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                type="text"
                label={t('common:Sensor ID')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editSensorId}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                type="text"
                label={t('device:Parameter Type')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={watch('type') || ''}
                inputProps={register('type')}
                select
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
                  },
                }}
              >
                {(Object.keys(SensorType) as SensorType[]).map((option) => (
                  <MenuItem key={option} value={option}>
                    {tSensorType(option)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                type="text"
                label={t('common:Name')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  ...register('name', {
                    maxLength: {
                      value: 255,
                      message: t('common:Max_ {{count}} character', { count: 255 }),
                    },
                  }),
                }}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                type="text"
                label={t('device:Unit')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  ...register('unit', {
                    maxLength: {
                      value: 32,
                      message: t('common:Max_ {{count}} character', { count: 32 }),
                    },
                  }),
                }}
                error={!!errors.unit}
                helperText={errors.unit?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label={t('common:Description')}
                placeholder={t('device:Insert description')}
                fullWidth
                multiline
                rows={4}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  ...register('desc', {
                    maxLength: {
                      value: 2000,
                      message: t('common:Max_ {{count}} character', { count: 2000 }),
                    },
                  }),
                }}
                error={!!errors.desc}
                helperText={errors.desc?.message}
              />
            </Grid>
            <Button
              variant="contained"
              color="primary"
              disabled={Object.keys(dirtyFields).length === 0 || !isValid}
              className={classes.button}
              onClick={handleSubmit(onSubmit)}
            >
              {t('common:Save')}
            </Button>
          </Grid>
        }
      />
    </div>
  );
};

export default Sensors;
