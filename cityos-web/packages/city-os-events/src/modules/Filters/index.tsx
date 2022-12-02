import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { differenceInDays, subDays } from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import capitalize from 'lodash/capitalize';

import Button from '@material-ui/core/Button';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  DeviceInSearch,
  Gender,
  RecognitionKey,
  RecognitionType,
  ageGroup,
} from 'city-os-common/libs/schema';
import { isDate } from 'city-os-common/libs/validators';
import { roundDownDate } from 'city-os-common/libs/roundDate';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import useAgeGroupTranslation from 'city-os-common/hooks/useAgeGroupTranslation';
import useGenderTranslation from 'city-os-common/hooks/useGenderTranslation';

import DateTimeField from 'city-os-common/modules/DateTimeField';
import DevicesSearchField from 'city-os-common/modules/DevicesSearchField';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';

import { CarModel, Color, FiltersData } from '../../libs/type';
import { isRecognitionType } from '../../libs/validators';
import useCarModelTranslation from '../../hooks/useCarModelTranslation';
import useColorTranslation from '../../hooks/useColorTranslation';
import useEventsTranslation from '../../hooks/useEventsTranslation';
import useRecognitionTypeTranslation from '../../hooks/useRecognitionTypeTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4.5),
  },

  content: {
    rowGap: theme.spacing(1),
  },

  field: {
    width: 220,
  },

  largeField: {
    width: 320,
  },

  tilde: {
    display: 'flex',
    alignItems: 'center',
    height: 56,
  },

  durationField: {
    flex: 0,
    gap: theme.spacing(1),
  },

  itemContainer: {
    columnGap: theme.spacing(2),
    margin: 0,
    rowGap: theme.spacing(3),
  },

  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },

  inputLabel: {
    textTransform: 'capitalize',
  },

  searchButton: {
    marginLeft: 'auto',
    textAlign: 'end',
  },

  searchResult: { margin: 0 },

  resultTitle: {
    paddingBottom: theme.spacing(1),
  },

  divisionsResult: {
    overflow: 'hidden',
    direction: 'rtl',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: theme.palette.primary.dark,
  },

  devicesResult: {
    border: `1px solid ${theme.palette.grey[100]}`,
    padding: theme.spacing(1, 2),
    height: 85,
    overflowY: 'auto',
    lineHeight: 1.4,
    color: theme.palette.grey[300],
  },

  resultButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',

    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
    },
  },
}));

interface SelectFieldProps
  extends Pick<ComponentProps<typeof TextField>, 'label' | 'value' | 'inputProps'> {
  renderValue?: (value: unknown) => ReactNode | undefined;
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  label,
  value,
  inputProps,
  renderValue,
  children,
}: PropsWithChildren<SelectFieldProps>) => {
  const classes = useStyles();

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      type="text"
      InputLabelProps={{ shrink: true }}
      label={label}
      value={value}
      inputProps={inputProps}
      SelectProps={{
        IconComponent: ExpandMoreRoundedIcon,
        displayEmpty: true,
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
        renderValue,
      }}
    >
      {children}
    </TextField>
  );
};

const AdvancedFilters: VoidFunctionComponent = () => {
  const { t } = useEventsTranslation(['common', 'column', 'events']);
  const { tCarModel } = useCarModelTranslation();
  const { tColor } = useColorTranslation();
  const { tGender } = useGenderTranslation();
  const { tAgeGroup } = useAgeGroupTranslation();
  const classes = useStyles();

  const { register, watch } = useFormContext<FiltersData>();
  const recognitionType = watch('recognitionType');

  if (recognitionType === RecognitionType.CAR_IDENTIFY) {
    return (
      <>
        <Grid item className={classes.field}>
          <SelectField
            label={t('events:Car Model')}
            value={watch('carModel') || ''}
            inputProps={register('carModel')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.values(CarModel).map((type) => (
              <MenuItem key={type} value={type}>
                {tCarModel(type)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
        <Grid item className={classes.field}>
          <SelectField
            label={t('events:Color')}
            value={watch('carColor') || ''}
            inputProps={register('carColor')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.values(Color).map((type) => (
              <MenuItem key={type} value={type}>
                {tColor(type)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
        <Grid item className={classes.field}>
          <TextField
            fullWidth
            variant="outlined"
            type="text"
            InputLabelProps={{ shrink: true, className: classes.inputLabel }}
            placeholder={t('events:e_g_ ABC-123')}
            label={capitalize(t('column:Plate number'))}
            value={watch('plateNumber') || ''}
            inputProps={register('plateNumber')}
          />
        </Grid>
      </>
    );
  }

  if (recognitionType === RecognitionType.HUMAN_SHAPE) {
    return (
      <>
        <Grid item className={classes.field}>
          <SelectField
            label={t('column:Gender')}
            value={watch('humanShapeGender') || ''}
            inputProps={register('humanShapeGender')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.values(Gender).map((type) => (
              <MenuItem key={type} value={type}>
                {tGender(type)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
        <Grid item className={classes.field}>
          <SelectField
            label={t('column:Clothes Color')}
            value={watch('clothesColor') || ''}
            inputProps={register('clothesColor')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.values(Color).map((type) => (
              <MenuItem key={type} value={type}>
                {tColor(type)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
      </>
    );
  }

  if (recognitionType === RecognitionType.HUMAN_FLOW_ADVANCE) {
    return (
      <>
        <Grid item className={classes.field}>
          <SelectField
            label={t('column:Gender')}
            value={watch('humanFlowGender') || ''}
            inputProps={register('humanFlowGender')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.values(Gender).map((type) => (
              <MenuItem key={type} value={type}>
                {tGender(type)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
        <Grid item className={classes.field}>
          <SelectField
            label={t('events:Age Group')}
            value={watch('ageGroup') !== undefined ? watch('ageGroup') : ''}
            inputProps={register('ageGroup')}
          >
            <MenuItem key="ALL" value="ALL">
              {t('common:All')}
            </MenuItem>
            {Object.entries(ageGroup).map(([group, ageIdx]) => (
              <MenuItem key={group} value={ageIdx}>
                {tAgeGroup(ageIdx)}
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
      </>
    );
  }

  return null;
};

const maxDayDuration = 100;

export const defaultFilters: FiltersData = {
  recognitionType: null,
  fromDate: roundDownDate(subDays(new Date(), 1), 'minute'),
  toDate: roundDownDate(new Date(), 'minute'),
  devices: [],
  carModel: 'ALL',
  carColor: 'ALL',
  plateNumber: '',
  humanShapeGender: 'ALL',
  humanFlowGender: 'ALL',
  clothesColor: 'ALL',
  ageGroup: 'ALL',
};

interface FiltersProps {
  initValues: FiltersData;
  onChange: (data: FiltersData) => void;
}

const Filters: VoidFunctionComponent<FiltersProps> = ({ initValues, onChange }: FiltersProps) => {
  const { t } = useEventsTranslation(['common', 'events', 'variables']);
  const { tRecognitionType } = useRecognitionTypeTranslation();
  const { tCarModel } = useCarModelTranslation();
  const { tColor } = useColorTranslation();
  const { tGender } = useGenderTranslation();
  const { tAgeGroup } = useAgeGroupTranslation();
  const classes = useStyles();

  const {
    dispatch,
    userProfile: { permissionGroup, divisionGroup, joinedGroups },
  } = useStore();

  const methods = useForm<FiltersData>({
    mode: 'onChange',
    defaultValues: initValues,
  });

  const {
    getValues,
    setValue,
    watch,
    register,
    handleSubmit,
    trigger,
    formState: { isValid, errors },
  } = methods;

  const recognitionType = watch('recognitionType');
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const devices = watch('devices');
  const carModel = watch('carModel');
  const carColor = watch('carColor');
  const plateNumber = watch('plateNumber');
  const humanShapeGender = watch('humanShapeGender');
  const humanFlowGender = watch('humanFlowGender');
  const clothesColor = watch('clothesColor');
  const humanAgeGroup = watch('ageGroup');

  const [isEditing, setIsEditing] = useState(true);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleChangeDevices = useCallback(
    (selectedDevices: DeviceInSearch[]) => {
      setValue('devices', selectedDevices, { shouldValidate: true });
    },
    [setValue],
  );

  const handleReset = useCallback(() => {
    setIsEditing(true);
    const currFromDate = roundDownDate(subDays(new Date(), 1), 'minute');
    const currToDate = roundDownDate(new Date(), 'minute');
    // Other fields would be setValue automatically when 'recognitionType' changed
    setValue('recognitionType', null);
    // It is no need to validate again to avoid 'fromDate' being updated later than previous 'toDate'
    setValue('fromDate', currFromDate);
    setValue('toDate', currToDate);
    dispatch({
      type: ReducerActionType.ResetDivisionGroup,
    });
    if (onChange) onChange({ ...defaultFilters, fromDate: currFromDate, toDate: currToDate });
  }, [setValue, dispatch, onChange]);

  const onSearch = useCallback<SubmitHandler<FiltersData>>(
    async (filtersData) => {
      setIsEditing(false);
      onChange(filtersData);
    },
    [onChange],
  );

  const divisionsText = useMemo(() => {
    const targetAncestorIds = joinedGroups?.find(({ id }) => id === divisionGroup?.id)?.ancestors;
    if (!targetAncestorIds) return '';
    const accessibleStartIdx = targetAncestorIds.findIndex(
      (ancestorId) => ancestorId === permissionGroup?.group.id,
    );
    const accessibleAncestorIds =
      accessibleStartIdx === -1 ? [] : targetAncestorIds.slice(accessibleStartIdx);
    const ancestorNames = accessibleAncestorIds.map(
      (ancestorId) => joinedGroups?.find(({ id }) => id === ancestorId)?.name || '',
    );
    ancestorNames.push(divisionGroup?.name || '');
    return ancestorNames.join(' > ');
  }, [permissionGroup, divisionGroup, joinedGroups]);

  const filterText = useMemo(() => {
    const textArr = [];
    if (carModel !== 'ALL') textArr.push(tCarModel(carModel));
    if (carColor !== 'ALL') textArr.push(tColor(carColor));
    if (plateNumber !== '') textArr.push(plateNumber);
    if (humanShapeGender !== 'ALL') textArr.push(tGender(humanShapeGender));
    if (clothesColor !== 'ALL') textArr.push(tColor(clothesColor));
    if (humanFlowGender !== 'ALL') textArr.push(tGender(humanFlowGender));
    if (humanAgeGroup !== 'ALL') textArr.push(tAgeGroup(humanAgeGroup));
    return textArr.length ? textArr.join('; ') : '---';
  }, [
    humanAgeGroup,
    carColor,
    carModel,
    clothesColor,
    humanFlowGender,
    humanShapeGender,
    plateNumber,
    tAgeGroup,
    tCarModel,
    tColor,
    tGender,
  ]);

  useEffect(() => {
    setValue('devices', [], { shouldValidate: true });
    setValue('carModel', 'ALL');
    setValue('carColor', 'ALL');
    setValue('plateNumber', '');
    setValue('humanShapeGender', 'ALL');
    setValue('humanFlowGender', 'ALL');
    setValue('clothesColor', 'ALL');
    setValue('ageGroup', 'ALL');
  }, [recognitionType, setValue]);

  useEffect(() => {
    setValue('devices', [], { shouldValidate: true });
  }, [setValue, divisionGroup?.id]);

  useEffect(() => {
    register('fromDate', {
      required: true,
      validate: {
        minDate: (value) => {
          const message = t('common:It should be an earlier date time_');
          const currentToDate = getValues('toDate');
          return value < currentToDate || message;
        },
      },
    });
    register('toDate', {
      required: true,
      validate: (value) => {
        const message = t('common:The period cannot be over {{count}} day_', {
          count: maxDayDuration,
        });
        const currentFromDate = getValues('fromDate');
        return differenceInDays(value, currentFromDate) <= maxDayDuration || message;
      },
    });
    register('devices', {
      required: true,
      validate: (value) => value.length > 0,
    });
  }, [getValues, register, t]);

  return (
    <Paper square={false} elevation={0} variant="outlined" className={classes.root}>
      {isEditing ? (
        <FormProvider {...methods}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit(onSearch)}>
            <Grid container spacing={2} className={classes.content}>
              <Grid item xs={12}>
                <DivisionSelector label={t('common:Divisions')} classes={classes.largeField} />
              </Grid>
              <Grid item container xs={12} className={classes.itemContainer}>
                <Grid item className={classes.field}>
                  <SelectField
                    label={t('events:Camera Type')}
                    value={watch('recognitionType') || ''}
                    inputProps={register('recognitionType', { required: true })}
                    renderValue={(value) =>
                      isRecognitionType(value) ? tRecognitionType(value) : '---'
                    }
                  >
                    {Object.values(RecognitionType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {tRecognitionType(type)}
                      </MenuItem>
                    ))}
                  </SelectField>
                </Grid>
                <Grid item container wrap="nowrap" className={classes.durationField}>
                  <Grid item className={classes.field}>
                    <DateTimeField
                      disableFuture
                      label={t('common:From Datetime')}
                      value={fromDate}
                      maxDate={toDate}
                      onChange={(date) => {
                        if (!isDate(date)) return;
                        setValue('fromDate', date, { shouldValidate: true });
                        void trigger('toDate');
                      }}
                      error={!!errors.fromDate}
                      helperText={errors.fromDate?.message}
                    />
                  </Grid>
                  <div className={classes.tilde}>~</div>
                  <Grid item className={classes.field}>
                    <DateTimeField
                      disableFuture
                      minDate={fromDate}
                      label={t('common:To Datetime')}
                      value={toDate}
                      onChange={(date) => {
                        if (!isDate(date)) return;
                        const now = new Date();
                        setValue('toDate', date > now ? now : date, { shouldValidate: true });
                        void trigger('fromDate');
                      }}
                      error={!!errors.toDate}
                      helperText={errors.toDate?.message}
                    />
                  </Grid>
                </Grid>
                <Grid item className={classes.largeField}>
                  <DevicesSearchField
                    deviceFilter={{
                      attribute: {
                        key: 'recognition_type',
                        value: recognitionType ? RecognitionKey[recognitionType] : '',
                      },
                    }}
                    disabled={!recognitionType}
                    value={devices}
                    onChange={handleChangeDevices}
                  />
                </Grid>
                <AdvancedFilters />
                <Grid item className={classes.searchButton} xs={12} md="auto">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!isValid || !divisionGroup?.id}
                  >
                    {t('common:Search')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      ) : (
        <Grid container spacing={2} className={classes.searchResult}>
          <Grid item xs={12} sm={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" className={classes.resultTitle}>
                  {t('common:Divisions')}
                </Typography>
                <Typography variant="body1" className={classes.divisionsResult}>
                  {divisionsText}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" className={classes.resultTitle}>
                  {t('common:Date')}
                </Typography>
                <Typography variant="body1">
                  {`${formatDate(
                    fromDate,
                    t('variables:dateFormat.common.dateTimeField'),
                  )} ~ ${formatDate(toDate, t('variables:dateFormat.common.dateTimeField'))}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" className={classes.resultTitle}>
                  {t('events:Camera Type')}
                </Typography>
                <Typography variant="body1">
                  {recognitionType && tRecognitionType(recognitionType)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" className={classes.resultTitle}>
                  {t('events:Filter')}
                </Typography>
                <Typography variant="body1">{filterText}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid />
          <Grid item xs={12} sm={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Typography variant="body2" color="textSecondary" className={classes.resultTitle}>
                  {t('common:Device ({{count}})', { count: devices.length })}
                </Typography>
                <div className={classes.devicesResult}>
                  {devices.map(({ name }) => name).join('; ')}
                </div>
              </Grid>
              <Grid item xs={12} sm={12} className={classes.resultButtons}>
                <Button variant="outlined" color="primary" onClick={handleReset}>
                  {t('events:Reset')}
                </Button>
                <Button variant="outlined" color="primary" onClick={handleEdit}>
                  {t('common:Edit')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default memo(Filters);
