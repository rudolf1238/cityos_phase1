import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';
import React, { VoidFunctionComponent, memo, useCallback, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';

import { ConfigFormType, ConfigSaveType, GadgetConfig, GadgetConfigType } from '../../../libs/type';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import ConfigInfo from '../ConfigInfo';

const useStyles = makeStyles(() => ({
  gridContainer: {
    margin: 0,
    width: '100%',
  },

  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface DivisionOnlyProps<T extends GadgetConfigType<ConfigFormType.DIVISION_ONLY>> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (newGadgetConfig: GadgetConfig<ConfigFormType.DIVISION_ONLY>) => void;
  config?: GadgetConfig<ConfigFormType.DIVISION_ONLY>;
}

const DivisionOnly = <Type extends GadgetConfigType<ConfigFormType.DIVISION_ONLY>>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DivisionOnlyProps<Type>): ReturnType<VoidFunctionComponent<DivisionOnlyProps<Type>>> => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('common');
  const {
    dispatch,
    userProfile: { permissionGroup, joinedGroups },
  } = useStore();

  const {
    setValue,
    handleSubmit,
    reset,
    register,
    formState: { isValid, isDirty },
  } = useForm<GadgetConfig<ConfigFormType.DIVISION_ONLY>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        groupId: initConfig?.setting.groupId || permissionGroup?.group?.id,
      },
    },
  });

  const handleChangeDivision = useCallback(
    (groupId: string) => {
      setValue('setting.groupId', groupId, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const handleReset = useCallback(() => {
    reset({
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        groupId: initConfig?.setting.groupId || permissionGroup?.group?.id,
      },
    });
  }, [gadgetType, initConfig, permissionGroup?.group?.id, reset]);

  const handleSave = useCallback<SubmitHandler<GadgetConfig<ConfigFormType.DIVISION_ONLY>>>(
    async (config) => {
      const { width, height, type, setting } = config;
      const id = initConfig?.id || uuidv4();
      const newConfig = { id, width, height, type, setting };
      onUpdateGadget(newConfig);
      handleReset();
    },
    [handleReset, initConfig?.id, onUpdateGadget],
  );

  useEffect(() => {
    const initGroup = joinedGroups?.find(({ id }) => id === initConfig?.setting.groupId);
    if (!initGroup) return;
    dispatch({
      type: ReducerActionType.SetDivisionGroup,
      payload: {
        divisionGroup: {
          id: initGroup.id,
          name: initGroup.name,
        },
      },
    });
  }, [dispatch, initConfig?.setting.groupId, joinedGroups]);

  useEffect(() => {
    register('setting.groupId', { required: true });
  }, [register]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item xs={12} md={6}>
          <ConfigInfo type={gadgetType} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DivisionSelector onChange={handleChangeDivision} />
        </Grid>
        <Grid item xs={12} className={classes.buttonWrapper}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={!isValid || (saveType === 'update' && !isDirty)}
          >
            {t('Save')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default memo(DivisionOnly);
