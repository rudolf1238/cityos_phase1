import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import isEqual from 'lodash/isEqual';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { LightSensorCondition, SortOrder } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import useHiddenStyles from 'city-os-common/styles/hidden';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import NestedTable from 'city-os-common/modules/NestedTable';
import OverwriteAlert from 'city-os-common/modules/OverwriteAlert';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { LightSensorConditionInput } from '../types';
import {
  UPDATE_LAMP_SCHEDULE,
  UpdateLampSchedulePayload,
  UpdateLampScheduleResponse,
} from '../../../../api/updateLampSchedule';
import useMapTranslation from '../../../../hooks/useMapTranslation';

import BrightnessSelect from '../BrightnessSelect';
import EnableController from '../EnableController';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: theme.spacing(100),

    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  form: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  formBody: {
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    backgroundColor: theme.palette.background.lightContainer,
    width: '100%',
  },

  collapseWrapper: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: theme.spacing(4, 7.5, 2),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4, 4, 2),
    },
  },

  regulators: {
    paddingBottom: theme.spacing(3),
  },

  scheduleTable: {
    paddingBottom: theme.spacing(2),
    height: theme.spacing(25),
  },

  tableRow: {
    '& > :first-child': {
      paddingLeft: theme.spacing(11),

      [theme.breakpoints.down('xs')]: {
        paddingLeft: theme.spacing(5),
      },
    },

    '& > :last-child': {
      paddingRight: theme.spacing(11),

      [theme.breakpoints.down('xs')]: {
        paddingRight: theme.spacing(5),
      },
    },
  },

  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    width: '100%',
  },

  button: {
    width: 272,
  },
}));

interface SchedulePayload {
  schedule: LightSensorConditionInput[];
  enableLightSensor: boolean;
}

interface LightSensorItem {
  deviceId: string;
  hasLightSensor: boolean | null;
  enableLightSensor: boolean | null;
  lightSensorCondition: LightSensorCondition[] | null;
}

interface LightSensorProps {
  lightSensorInputs: LightSensorItem[];
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

const LightSensor: VoidFunctionComponent<LightSensorProps> = ({
  lightSensorInputs,
  onChanged,
  onUpdating,
}: LightSensorProps) => {
  const { dispatch } = useStore();
  const { t } = useMapTranslation(['common', 'column', 'map']);
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const [isShow, setIsShow] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [lessThan, setLessThan] = useState<number | undefined>(undefined);
  const [brightness, setBrightness] = useState<number | undefined>(undefined);
  const [isLessThanValid, setIsLessThanValid] = useState<boolean | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [initValue, setInitValue] = useState<SchedulePayload>({
    schedule: [],
    enableLightSensor: false,
  });
  const isMountedRef = useIsMountedRef();
  const [updateLampSchedule, { loading }] = useMutation<
    UpdateLampScheduleResponse,
    UpdateLampSchedulePayload
  >(UPDATE_LAMP_SCHEDULE);
  const {
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SchedulePayload>({
    defaultValues: {
      schedule: [],
      enableLightSensor: false,
    },
    mode: 'onChange',
  });

  const onOverwrite = useCallback(() => {
    setIsConflict(false);
    setValue('schedule', [], { shouldDirty: true });
    setValue('enableLightSensor', false, { shouldDirty: true });
    setInitValue((prev) => ({ ...prev, enableLightSensor: false, schedule: [] }));
  }, [setValue]);

  const checkEnabledIsConflict = useCallback(
    (lightSensorList: LightSensorItem[]) => {
      if (!lightSensorList) return;
      if (lightSensorList.length > 0) {
        setIsShow(true);
      }
      const enableList = lightSensorList.filter(
        ({ enableLightSensor }) => enableLightSensor === true,
      );
      const enableCount = enableList.length;
      if (enableCount === 0) {
        setInitValue((prev) => ({ ...prev, enableLightSensor: false }));
        setValue('enableLightSensor', false, { shouldDirty: false });
      } else {
        setInitValue((prev) => ({ ...prev, enableLightSensor: true }));
        setValue('enableLightSensor', true, { shouldDirty: false });
      }
      if (enableCount !== 0 && enableCount !== lightSensorList.length) {
        setIsConflict(true);
      }
    },
    [setValue],
  );

  const checkScheduleIsConflict = useCallback(
    (lightSensorList: LightSensorItem[]) => {
      const checklist = lightSensorList.map(({ lightSensorCondition }) => {
        if (!lightSensorCondition) return 'noSchedule';
        return [...lightSensorCondition]
          .sort((a, b) => a.lessThan - b.lessThan)
          .map((sensorValues) => [sensorValues.lessThan, sensorValues.brightness])
          .flat()
          .join();
      });

      const noScheduleCount = checklist.filter((sensor) => sensor === 'noSchedule').length;
      if (noScheduleCount === checklist.length) {
        setIsConflict(false);
        return;
      }
      if (noScheduleCount > 0) {
        setIsConflict(true);
        return;
      }
      const unequalCount = checklist.filter((sensor) => sensor !== checklist[0]).length;
      if (unequalCount > 0) {
        setIsConflict(true);
        return;
      }
      setIsConflict(false);
      if (lightSensorList[0]?.lightSensorCondition) {
        const commonSchedule = lightSensorList[0].lightSensorCondition
          .map((sensorValue) => sensorValue || null)
          .sort((a, b) => a.lessThan - b.lessThan)
          .map((sensorValue) => ({
            lessThan: sensorValue.lessThan,
            brightness: sensorValue.brightness,
          }));
        setInitValue((prev) => ({ ...prev, schedule: commonSchedule }));
        setValue('schedule', commonSchedule, { shouldDirty: false });
      }
    },
    [setValue],
  );

  const onChangeEnabled = useCallback(() => {
    setIsSubmitted(false);
    const prevValue = getValues('enableLightSensor');
    setValue('enableLightSensor', !prevValue, { shouldDirty: true });
  }, [getValues, setValue]);

  const onChangelessThan = useCallback((e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setIsSubmitted(false);
    setLessThan(+e.target.value);
  }, []);

  const onChangeBrightness = useCallback((value: number | undefined) => {
    setIsSubmitted(false);
    setBrightness(value);
  }, []);

  const updateSchedule = useCallback(() => {
    if (lessThan === undefined || brightness === undefined) return;
    const newSchedule = getValues('schedule')
      .filter((item) => item.lessThan !== lessThan)
      .concat({ lessThan, brightness })
      .sort((a, b) => a.lessThan - b.lessThan);
    setValue('schedule', newSchedule, { shouldDirty: true });
    setLessThan(undefined);
    setBrightness(undefined);
  }, [brightness, getValues, lessThan, setValue]);

  const removeRowData = useCallback(
    (lessThanValue: number) => {
      setIsSubmitted(false);
      const schedule = getValues('schedule');
      const newSchedule = schedule.filter((item) => item.lessThan !== lessThanValue);
      setValue('schedule', newSchedule, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const sorting = useCallback(
    (type: SortOrder): SortOrder => {
      const currentSchedule = getValues('schedule');
      const newSchedule = currentSchedule.sort(
        (a, b) => (a.lessThan - b.lessThan) * (type === SortOrder.ASCENDING ? 1 : -1),
      );
      setValue('schedule', newSchedule);
      return type;
    },
    [getValues, setValue],
  );

  const onSubmit = useCallback<SubmitHandler<SchedulePayload>>(async () => {
    setIsSubmitted(true);
    const updateResult = await Promise.allSettled(
      lightSensorInputs.map(async ({ deviceId, hasLightSensor }) => {
        if (hasLightSensor) {
          await updateLampSchedule({
            variables: {
              deviceId,
              lightScheduleInput: {
                lightSensorInput: {
                  enableLightSensor: getValues('enableLightSensor'),
                  lightSensorConditionInput: getValues('schedule'),
                },
                manualScheduleInput: null,
              },
            },
          });
        }
      }),
    );
    const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
    if (rejectedResults.length === 0) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('common:The value has been set successfully_'),
        },
      });
    } else {
      if (D_DEBUG) console.log(rejectedResults);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Failed to save_ Please try again_'),
        },
      });
      if (isMountedRef.current) {
        setIsSubmitted(false);
      }
    }
    if (isMountedRef.current) {
      onChanged();
      setLessThan(undefined);
      setBrightness(undefined);
    }
  }, [lightSensorInputs, isMountedRef, updateLampSchedule, getValues, dispatch, t, onChanged]);

  const scheduleColumn = useMemo<Column<LightSensorConditionInput>[]>(
    () => [
      {
        title: t('map:☀ Solar radiation (W/m²)'),
        render: (rowData) => `<${rowData.lessThan}`,
        sort: sorting,
      },
      {
        title: t('column:Brightness'),
        render: (rowData) => `${rowData.brightness}%`,
      },
      {
        title: '',
        render: (rowData) => (
          <ThemeIconButton
            aria-label={t('common:Delete')}
            variant="standard"
            color="primary"
            size="small"
            tooltip={t('common:Delete')}
            onClick={() => {
              removeRowData(rowData.lessThan);
            }}
          >
            <DeleteIcon />
          </ThemeIconButton>
        ),
      },
    ],
    [removeRowData, sorting, t],
  );

  const resetToInitValues = useCallback(() => {
    checkEnabledIsConflict(lightSensorInputs);
    checkScheduleIsConflict(lightSensorInputs);
  }, [checkEnabledIsConflict, checkScheduleIsConflict, lightSensorInputs]);

  const handleCancel = useCallback(() => {
    resetToInitValues();
  }, [resetToInitValues]);

  useEffect(() => {
    resetToInitValues();
  }, [resetToInitValues, lightSensorInputs]);

  useEffect(() => {
    if (lessThan === undefined) {
      setIsLessThanValid(undefined);
      return;
    }
    if (lessThan >= 1 && lessThan <= 10 ** 5) {
      setIsLessThanValid(true);
      return;
    }
    setIsLessThanValid(false);
  }, [lessThan]);

  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);

  return (
    <>
      {isShow && (
        <div className={classes.root}>
          <EnableController
            isEnabled={watch('enableLightSensor')}
            onChange={onChangeEnabled}
            item={t('map:Light Sensor')}
          />
          <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
            <Collapse
              in={watch('enableLightSensor')}
              classes={{ wrapper: classes.collapseWrapper }}
              className={classes.formBody}
            >
              <Grid container spacing={3} className={classes.regulators}>
                <Grid item xs={9} sm={5}>
                  <TextField
                    label={t('map:☀ Solar radiation (W/m²)')}
                    placeholder={t('map:insert number')}
                    value={lessThan || ''}
                    onChange={onChangelessThan}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{'<'}</InputAdornment>,
                    }}
                    fullWidth
                    error={isLessThanValid === false}
                    helperText={isLessThanValid === false && 'out of range'}
                  />
                </Grid>
                <Grid item xs={3} className={hiddenClasses.xsUpHidden} />
                <Grid item xs={9} sm={5}>
                  <BrightnessSelect
                    label={t('map:Brightness (%)')}
                    value={brightness}
                    onSelect={onChangeBrightness}
                    baseNumber={10}
                  />
                </Grid>
                <Grid item xs={3} sm={2}>
                  <ThemeIconButton
                    variant="contained"
                    tooltip={t('common:Add')}
                    color="primary"
                    disabled={!isLessThanValid || brightness === undefined}
                    onClick={updateSchedule}
                  >
                    <AddRoundedIcon />
                  </ThemeIconButton>
                </Grid>
              </Grid>
              <NestedTable
                columns={scheduleColumn}
                data={watch('schedule')}
                disabledSelection
                disableNoDataMessage
                stickyHeader
                classes={{
                  container: classes.scheduleTable,
                  row: classes.tableRow,
                }}
              />
            </Collapse>
            <div className={classes.buttons}>
              <Button
                type="button"
                size="small"
                color="primary"
                variant="outlined"
                className={classes.button}
                onClick={handleCancel}
              >
                {t('common:Cancel')}
              </Button>
              <Button
                type="submit"
                size="small"
                color="primary"
                variant="contained"
                className={classes.button}
                // Save button should be disabled when current values is same as initial values
                disabled={
                  !isDirty ||
                  isSubmitted ||
                  isEqual(initValue, watch()) ||
                  (watch('enableLightSensor') && watch('schedule').length === 0)
                }
              >
                {t('common:Save')}
              </Button>
            </div>
          </form>
          <OverwriteAlert isOpen={isConflict} item={t('map:Light sensors')} onClick={onOverwrite} />
        </div>
      )}
    </>
  );
};

export default LightSensor;
