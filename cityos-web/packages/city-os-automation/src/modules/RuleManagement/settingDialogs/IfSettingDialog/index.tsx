import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { DeviceInSearch, DeviceType, Sensor, SensorType } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import omitUndefinedProps from 'city-os-common/libs/omitUndefinedProps';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import SwitchButton from 'city-os-common/modules/SwitchButton';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { Logic, PartialAutomationTrigger, TriggerOperator } from '../../../../libs/type';
import { TempCondition } from './type';
import { isDeviceType, isLogic } from '../../../../libs/validators';
import { timeInSecondsRegex } from '../../../../libs/constants';
import useAutomationTranslation from '../../../../hooks/useAutomationTranslation';
import useLogicTranslation from '../../../../hooks/useLogicTranslation';
import useSensorExpressionTranslation from '../../../../hooks/useSensorExpressionTranslation';

import DeviceSearchField from './DeviceSearchField';
import DeviceTypeSelector from '../../../DeviceTypeSelector';
import SensorIdSelector from '../../../SensorIdSelector';
import SensorValueField from '../../../SensorValueField';
import TriggerOperatorSelector from './TriggerOperatorSelector';

const useStyles = makeStyles((theme) => ({
  dialog: {
    margin: 0,
    padding: theme.spacing(4, 7),
    width: '100%',
    maxWidth: 960,

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4, 2),
    },
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    minHeight: 420,
  },

  parts: {
    display: 'flex',
    paddingBottom: theme.spacing(5),
  },

  part: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(0, 2),
    width: '50%',
  },

  deviceSettings: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(0, 5.5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0),
    },
  },

  subtitleWrapper: {
    padding: theme.spacing(1.5, 0, 1),
    width: '100%',
    color: theme.palette.text.subtitle,

    '& > h6': {
      padding: theme.spacing(0.5, 2),
    },
  },

  expressionRow: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    width: '100%',

    '&:last-of-type': {
      justifyContent: 'flex-end',
    },

    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },

  sensorIdRow: {
    gap: theme.spacing(1),
  },

  sensorValuesRow: {
    flexDirection: 'column',
  },

  devices: {
    padding: theme.spacing(2),
    maxHeight: 225,
    overflow: 'auto',
    wordBreak: 'break-all',
  },

  list: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    padding: 0,
    width: '100%',
    height: 170,
    overflowY: 'auto',

    '&::-webkit-scrollbar': {
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    },
  },

  listItem: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },

    '& p': {
      marginRight: 'auto',
    },
  },

  disabled: {
    opacity: 0.12,
  },

  logicDescription: {
    width: 200,
  },

  logicSwitch: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },

  thumb: {
    backgroundColor: theme.palette.primary.main,
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

const conditionLimit = 3;

interface FormData extends Omit<PartialAutomationTrigger, 'conditions'> {
  settingLogic?: Logic;
  conditions: TempCondition[];
}

interface IfSettingDialogProps {
  logic?: Logic;
  trigger?: PartialAutomationTrigger;
  onClose: (newTrigger?: PartialAutomationTrigger, newLogic?: Logic) => void;
}

const IfSettingDialog: VoidFunctionComponent<IfSettingDialogProps> = ({
  logic: initLogic,
  trigger,
  onClose,
}: IfSettingDialogProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['automation', 'common']);
  const { tSensorExpression } = useSensorExpressionTranslation();
  const { tLogic } = useLogicTranslation();
  const { dispatch } = useStore();

  const [tempDeviceType, setTempDeviceType] = useState<DeviceType>();
  const [sensorId, setSensorId] = useState<string>();
  const [operator, setOperator] = useState<TriggerOperator>();
  const [conditionValues, setConditionValues] = useState<string[]>();
  const [sensorType, setSensorType] = useState<SensorType>();
  const [sensorUnit, setSensorUnit] = useState<string>();

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      settingLogic: initLogic,
      deviceType: trigger?.deviceType,
      devices: trigger?.devices || [],
      logic: trigger?.logic,
      conditions:
        trigger?.conditions.map((condition) => ({
          ...condition,
          value: condition.value.split(','),
        })) || [],
    },
  });

  const settingLogic = watch('settingLogic');
  const deviceType = watch('deviceType');
  const devices = watch('devices');
  const sensorLogic = watch('logic');
  const conditions = watch('conditions');

  const onSettingLogicChange = useCallback(
    (newSettingLogic: unknown) => {
      if (!isLogic(newSettingLogic)) return;
      setValue('settingLogic', newSettingLogic, { shouldValidate: true });
      if (newSettingLogic !== settingLogic) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'warning',
            message: t(
              'automation:Card operator should be the same_ It effect other card operators as soon as you change it_ You can switch back if you want_',
            ),
          },
        });
      }
    },
    [dispatch, setValue, settingLogic, t],
  );

  const resetCondition = useCallback(() => {
    setSensorId(undefined);
    setOperator(undefined);
    setConditionValues(undefined);
    setSensorType(undefined);
    setSensorUnit(undefined);
  }, []);

  const onDeviceTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (!isDeviceType(newValue)) return;
      if (devices.length || conditions.length) {
        setTempDeviceType(newValue);
      } else {
        setValue('deviceType', newValue, { shouldValidate: true });
        resetCondition();
      }
    },
    [conditions.length, devices.length, resetCondition, setValue],
  );

  const onWarningClose = useCallback(() => {
    setTempDeviceType(undefined);
  }, []);

  const onDeviceTypeCommitted = useCallback(() => {
    if (!tempDeviceType) return;
    setValue('deviceType', tempDeviceType, { shouldValidate: true });
    setValue('devices', [], { shouldValidate: true });
    setValue('conditions', [], { shouldValidate: true });
    resetCondition();
    onWarningClose();
  }, [onWarningClose, resetCondition, setValue, tempDeviceType]);

  const onChangeDevices = useCallback(
    (newValue: { devices: DeviceInSearch[]; conditions?: TempCondition[] }) => {
      setValue('devices', newValue.devices, { shouldValidate: true });
      if (newValue.conditions)
        setValue('conditions', newValue.conditions, { shouldValidate: true });
    },
    [setValue],
  );

  const onAddCondition = useCallback(() => {
    if (!sensorId || !operator || !conditionValues) return;
    const newConditions = conditions.concat({
      sensorId,
      operator,
      value: conditionValues,
      unit: sensorUnit,
    });
    if (newConditions.length > 1 && !sensorLogic) {
      setValue('logic', Logic.AND, { shouldValidate: true });
    }
    setValue('conditions', newConditions, { shouldValidate: true });
    resetCondition();
  }, [
    sensorId,
    operator,
    conditionValues,
    conditions,
    sensorUnit,
    sensorLogic,
    setValue,
    resetCondition,
  ]);

  const onChangeLogic = useCallback(() => {
    setValue('logic', sensorLogic === Logic.OR ? Logic.AND : Logic.OR, { shouldValidate: true });
  }, [sensorLogic, setValue]);

  const onSensorIdChange = useCallback(
    (sensor: Pick<Sensor, 'type' | 'sensorId' | 'unit'> | undefined) => {
      setSensorType(sensor?.type);
      setSensorUnit(sensor?.unit || undefined);
      setSensorId(sensor?.sensorId);
      setOperator(undefined);
      setConditionValues(undefined);
    },
    [],
  );

  const onTriggerOperatorChange = useCallback((newOperator: TriggerOperator) => {
    setOperator(newOperator);
    setConditionValues(undefined);
  }, []);

  const onConditionValuesChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const newValues = conditionValues ? [...conditionValues] : [];
    newValues[index] = e.target.value;
    setConditionValues(newValues);
  };

  const onDeleteCondition = (index: number) => () => {
    const newConditions = conditions.filter((_, idx) => idx !== index);
    setValue('conditions', newConditions, { shouldValidate: true });
  };

  const onSubmit = useCallback(
    (submitData: FormData) => {
      onClose(
        {
          deviceType: submitData.deviceType,
          devices: submitData.devices,
          logic: submitData.conditions.length > 1 ? submitData.logic : undefined,
          conditions: submitData.conditions.map(({ value, unit: _, ...condition }) => ({
            ...condition,
            value: value.join(','),
          })),
        },
        submitData.settingLogic,
      );
    },
    [onClose],
  );

  register('settingLogic');
  register('deviceType', { required: true });
  register('devices', { validate: (value) => value !== undefined && value.length > 0 });
  register('conditions', { validate: (value) => value !== undefined && value.length > 0 });
  register('logic', {
    validate: (value) => (conditions.length > 1 ? !!value : true),
  });

  const conditionValueFieldSettings = useMemo<
    {
      isSensorValue: boolean;
      label?: string;
      placeholder?: string;
      errorMessage?: string;
    }[]
  >(() => {
    switch (operator) {
      case TriggerOperator.BETWEEN: {
        const minValue = conditionValues?.[0];
        const maxValue = conditionValues?.[1];
        return [
          {
            isSensorValue: true,
            label: t('automation:Min number'),
            placeholder: '92.123',
          },
          {
            isSensorValue: true,
            label: t('automation:Max number'),
            placeholder: '102.123',
            errorMessage:
              minValue !== undefined && maxValue !== undefined && +minValue >= +maxValue
                ? t('automation:The max value must be larger than the min value_')
                : undefined,
          },
        ];
      }
      case TriggerOperator.IS_ONE_OF:
        return [
          {
            isSensorValue: true,
            label: t('automation:Text list'),
            placeholder: 'text1,text2,text3',
          },
        ];
      case TriggerOperator.UPDATED:
        return [
          {
            isSensorValue: false,
            label: t('automation:In how many seconds'),
            placeholder: '10',
            errorMessage:
              conditionValues !== undefined && !timeInSecondsRegex.test(conditionValues[0])
                ? t('automation:Invalid number')
                : undefined,
          },
        ];
      default:
        return [{ isSensorValue: true }];
    }
  }, [operator, conditionValues, t]);

  const titleButtons = useMemo(
    () => [
      { label: tLogic(Logic.AND), value: Logic.AND },
      { label: tLogic(Logic.OR), value: Logic.OR },
    ],
    [tLogic],
  );

  const addButtonDisabled = useMemo(
    () =>
      !sensorId ||
      !operator ||
      conditions.length >= conditionLimit ||
      !conditionValues ||
      conditionValues.some((value) => !value) ||
      conditionValueFieldSettings.some(({ errorMessage }) => !!errorMessage),
    [conditions.length, operator, sensorId, conditionValueFieldSettings, conditionValues],
  );

  return (
    <BaseDialog
      open
      onClose={() => onClose()}
      title={
        settingLogic ? (
          <SwitchButton
            buttons={titleButtons}
            value={settingLogic}
            onChange={onSettingLogicChange}
          />
        ) : (
          t('automation:IF')
        )
      }
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
              <div className={classes.deviceSettings}>
                <DeviceTypeSelector value={deviceType} onChange={onDeviceTypeChange} />
                <DeviceSearchField
                  deviceFilter={{
                    type: deviceType,
                  }}
                  label={t('automation:On any one of these devices')}
                  disabled={!deviceType}
                  value={devices || []}
                  conditions={conditions}
                  onChange={onChangeDevices}
                />
                <Typography variant="body2" align="left" className={classes.devices}>
                  {devices && devices.map(({ name }) => `${name};`).join(' ')}
                </Typography>
              </div>
            </div>
            <div className={classes.part}>
              <div className={classes.subtitleWrapper}>
                <Typography variant="subtitle2" align="left">
                  {t('automation:Sensor Expressions')}
                </Typography>
                <Divider />
              </div>
              <div className={clsx(classes.expressionRow, classes.sensorIdRow)}>
                <SensorIdSelector
                  deviceType={deviceType}
                  deviceIds={devices.map(({ deviceId }) => deviceId)}
                  disabled={!deviceType || !devices.length || conditions.length >= conditionLimit}
                  value={sensorId}
                  onSelectChange={onSensorIdChange}
                />
                <TriggerOperatorSelector
                  value={operator}
                  disabled={!deviceType || !sensorId}
                  sensorType={sensorType || SensorType.SNAPSHOT}
                  onChange={onTriggerOperatorChange}
                />
              </div>
              <div className={clsx(classes.expressionRow, classes.sensorValuesRow)}>
                {conditionValueFieldSettings.map(
                  ({ label, placeholder, errorMessage, isSensorValue }, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Grid container spacing={2} key={i.toString()}>
                      <Grid item xs={10}>
                        {isSensorValue ? (
                          <SensorValueField
                            sensorType={
                              (sensorType !== SensorType.SNAPSHOT && sensorType) || SensorType.GAUGE
                            }
                            {...omitUndefinedProps({ label, placeholder })}
                            value={conditionValues?.[i]}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            disabled={!deviceType || !sensorId || !operator}
                            onChange={onConditionValuesChange(i)}
                            InputProps={{
                              endAdornment:
                                (!sensorType || sensorType === SensorType.GAUGE) && sensorUnit ? (
                                  <InputAdornment position="end">{sensorUnit}</InputAdornment>
                                ) : undefined,
                            }}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            type="text"
                            variant="outlined"
                            label={label}
                            placeholder={placeholder}
                            value={conditionValues?.[i] || ''}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            disabled={!deviceType || !sensorId}
                            onChange={onConditionValuesChange(i)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {t('automation:sec')}
                                </InputAdornment>
                              ),
                            }}
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      </Grid>
                      {i === conditionValueFieldSettings.length - 1 ? (
                        <Grid item xs={2}>
                          <ThemeIconButton
                            color="primary"
                            variant="contained"
                            tooltip={t('common:Add')}
                            onClick={onAddCondition}
                            disabled={addButtonDisabled}
                          >
                            <AddIcon />
                          </ThemeIconButton>
                        </Grid>
                      ) : (
                        <Grid item xs={2} />
                      )}
                    </Grid>
                  ),
                )}
              </div>
              <div className={classes.expressionRow}>
                <List className={classes.list}>
                  {conditions.map((condition, idx) => {
                    const unit =
                      devices
                        .flatMap(({ sensors }) => sensors)
                        .find(
                          (sensor) =>
                            sensor?.sensorId === condition.sensorId &&
                            sensor?.type === SensorType.GAUGE,
                        )?.unit || '';
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <ListItem key={idx.toString()} className={classes.listItem}>
                        {idx > 0 && sensorLogic && (
                          <Typography variant="subtitle1">{tLogic(sensorLogic)}</Typography>
                        )}
                        <Typography variant="body1">
                          {tSensorExpression(
                            condition.sensorId,
                            condition.operator,
                            condition.value.map((v) => `${v}${condition.unit || unit}`),
                          )}
                        </Typography>
                        <ThemeIconButton
                          variant="standard"
                          color="primary"
                          size="small"
                          tooltip={t('Delete')}
                          onClick={onDeleteCondition(idx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </ThemeIconButton>
                      </ListItem>
                    );
                  })}
                </List>
              </div>
              <div className={clsx(classes.expressionRow, { [classes.disabled]: !deviceType })}>
                <Typography variant="body2" align="right" className={classes.logicDescription}>
                  {t('automation:The logical operator between sensor expressions')}
                </Typography>
                <div className={classes.logicSwitch}>
                  <Typography variant="subtitle2">{t('automation:AND')}</Typography>
                  <Switch
                    disabled={!deviceType}
                    checked={sensorLogic === Logic.OR}
                    onChange={onChangeLogic}
                    color="primary"
                    classes={{ thumb: classes.thumb }}
                  />
                  <Typography variant="subtitle2">{t('automation:OR')}</Typography>
                </div>
              </div>
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

export default memo(IfSettingDialog);
