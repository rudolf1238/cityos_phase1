import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import React, { ChangeEvent, VoidFunctionComponent, memo, useCallback, useState } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';

import { DeviceInSearch, DeviceType, Sensor, SensorType } from 'city-os-common/libs/schema';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import DevicesSearchField from 'city-os-common/modules/DevicesSearchField';

import { ActionType, DeviceAction, SwitchValue } from '../../../libs/type';
import { isDeviceType } from '../../../libs/validators';
import useAutomationTranslation from '../../../hooks/useAutomationTranslation';

import DeviceTypeSelector from '../../DeviceTypeSelector';
import SensorIdSelector from '../../SensorIdSelector';
import SensorValueField from '../../SensorValueField';

const useStyles = makeStyles((theme) => ({
  dialog: {
    margin: 0,
    padding: theme.spacing(4, 8),
    width: '100%',
    maxWidth: 960,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    minWidth: 672,
    maxWidth: 792,
    minHeight: 420,
  },

  parts: {
    display: 'flex',
    gap: theme.spacing(4),
  },

  part: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    width: '50%',
  },

  subtitleWrapper: {
    padding: theme.spacing(1.5, 0, 1),
    width: '100%',
    color: theme.palette.text.subtitle,

    '& > h6': {
      padding: theme.spacing(0.5, 1),
    },
  },

  field: {
    width: 320,
  },

  devices: {
    padding: theme.spacing(2),
    maxHeight: 120,
    overflow: 'auto',
    wordBreak: 'break-all',
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: 'auto',
  },

  warningDialog: {
    width: 'min(600px, 90vw)',
    height: 300,
  },

  warningDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
}));

interface FormData extends DeviceAction {
  sensorType?: SensorType;
  sensorUnit?: string | null;
}

interface TriggerSensorSettingDialogProps {
  deviceAction?: DeviceAction;
  onClose: (submitData?: DeviceAction) => void;
}

const TriggerSensorSettingDialog: VoidFunctionComponent<TriggerSensorSettingDialogProps> = ({
  deviceAction,
  onClose,
}: TriggerSensorSettingDialogProps) => {
  const { t } = useAutomationTranslation(['common', 'automation']);
  const classes = useStyles();
  const [tempDeviceType, setTempDeviceType] = useState<DeviceType>();

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      deviceType: deviceAction?.deviceType,
      devices: deviceAction?.devices,
      sensorId: deviceAction?.sensorId,
      setValue: deviceAction?.setValue,
      sensorType: deviceAction?.sensorId
        ? deviceAction?.devices
            .flatMap(({ sensors }) => sensors)
            .find((sensor) => sensor?.sensorId === deviceAction.sensorId)?.type
        : undefined,
      sensorUnit: deviceAction?.sensorId
        ? deviceAction?.devices
            .flatMap(({ sensors }) => sensors)
            .find(
              (sensor) =>
                sensor?.sensorId === deviceAction.sensorId && sensor?.type === SensorType.GAUGE,
            )?.unit
        : undefined,
    },
  });

  register('devices', { validate: (v) => !!v?.length });
  register('deviceType', { required: true });

  const deviceType = watch('deviceType');
  const devices = watch('devices');
  const sensorId = watch('sensorId');
  const value = watch('setValue');
  const sensorType = watch('sensorType');
  const sensorUnit = watch('sensorUnit');

  const handleChangeDevices = useCallback(
    (selectedDevices: DeviceInSearch[]) => {
      setValue('devices', selectedDevices, { shouldValidate: true });
    },
    [setValue],
  );

  const onDeviceTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (!isDeviceType(newValue)) return;
      if (devices?.length || sensorId || value) {
        setTempDeviceType(newValue);
      } else {
        setValue('deviceType', newValue, { shouldValidate: true });
      }
    },
    [devices?.length, sensorId, value, setValue],
  );

  const onWarningClose = useCallback(() => {
    setTempDeviceType(undefined);
  }, []);

  const onDeviceTypeCommitted = useCallback(() => {
    if (!tempDeviceType) return;
    reset({
      deviceType: tempDeviceType,
      devices: undefined,
      sensorId: undefined,
      setValue: undefined,
      sensorUnit: undefined,
    });
    onWarningClose();
  }, [tempDeviceType, reset, onWarningClose]);

  const onSensorIdSelect = useCallback(
    (sensor?: Pick<Sensor, 'type' | 'sensorId' | 'unit'>) => {
      reset({
        deviceType,
        devices,
        sensorType: sensor?.type,
        sensorId: sensor?.sensorId,
        setValue: sensor?.type === SensorType.SWITCH && !value ? SwitchValue.TRUE : undefined,
        sensorUnit: sensor?.type === SensorType.GAUGE ? sensor?.unit : undefined,
      });
    },
    [deviceType, devices, value, reset],
  );

  const onSubmit = useCallback(
    (submitData: FormData) => {
      onClose({
        actionType: ActionType.DEVICE,
        deviceType: submitData.deviceType,
        devices: submitData.devices,
        sensorId: submitData.sensorId,
        setValue: submitData.setValue,
      });
    },
    [onClose],
  );

  return (
    <BaseDialog
      open
      onClose={() => onClose()}
      title={t('automation:TRIGGER SENSOR')}
      classes={{
        dialog: classes.dialog,
      }}
      content={
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <div className={classes.parts}>
            <div className={classes.part}>
              <div className={classes.subtitleWrapper}>
                <Typography variant="subtitle2" align="left">
                  {t('common:Devices')}
                </Typography>
                <Divider />
              </div>
              <DeviceTypeSelector
                value={deviceType}
                className={classes.field}
                onChange={onDeviceTypeChange}
              />
              <DevicesSearchField
                deviceFilter={{
                  type: deviceType,
                }}
                disabled={!deviceType}
                value={devices || []}
                className={classes.field}
                onChange={handleChangeDevices}
              />
              <Typography
                variant="body2"
                align="left"
                className={clsx(classes.field, classes.devices)}
              >
                {devices?.length ? devices.map(({ name }) => `${name};`).join(' ') : ''}
              </Typography>
            </div>
            <div className={classes.part}>
              <div className={classes.subtitleWrapper}>
                <Typography variant="subtitle2" align="left">
                  {t('automation:Settings')}
                </Typography>
                <Divider />
              </div>
              <SensorIdSelector
                deviceType={deviceType}
                deviceIds={devices?.map(({ deviceId }) => deviceId)}
                disabled={!deviceType || !devices?.length}
                value={sensorId}
                className={classes.field}
                excludeType={SensorType.SNAPSHOT}
                inputProps={register('sensorId', {
                  required: true,
                })}
                onSelectChange={onSensorIdSelect}
              />
              <SensorValueField
                sensorType={sensorType || SensorType.GAUGE}
                value={value}
                inputProps={register('setValue', {
                  required: true,
                })}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                InputProps={{
                  endAdornment:
                    (!sensorType || sensorType === SensorType.GAUGE) && sensorUnit ? (
                      <InputAdornment position="end">{sensorUnit}</InputAdornment>
                    ) : undefined,
                }}
                className={classes.field}
                disabled={!deviceType || !sensorId || !devices?.length}
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="contained"
            size="small"
            color="primary"
            className={classes.dialogButton}
            disabled={!isValid}
          >
            {t('common:OK')}
          </Button>
          <BaseDialog
            open={!!tempDeviceType}
            onClose={onWarningClose}
            title={t('automation:Changing the device type will remove the settings_')}
            classes={{
              dialog: classes.warningDialog,
              content: classes.warningDialogContent,
            }}
            content={
              <>
                <Typography variant="body1">
                  {t(
                    'automation:If you choose another device type, the settings of previous devices will be removed_ Are you sure to change the device type?',
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={onDeviceTypeCommitted}
                >
                  {t('automation:Yes, change it_')}
                </Button>
              </>
            }
          />
        </form>
      }
    />
  );
};

export default memo(TriggerSensorSettingDialog);
