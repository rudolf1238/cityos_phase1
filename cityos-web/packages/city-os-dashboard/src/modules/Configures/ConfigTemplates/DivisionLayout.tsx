import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';
import React, { VoidFunctionComponent, memo, useCallback, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';

import {
  ConfigFormType,
  ConfigSaveType,
  GadgetConfig,
  GadgetConfigType,
  GadgetSize,
} from '../../../libs/type';
import { gadgetSize, gadgetSizeSet } from '../../../libs/constants';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import ConfigInfo from '../ConfigInfo';
import LayoutField from '../ConfigFields/LayoutField';

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

interface DivisionLayoutProps<T extends GadgetConfigType<ConfigFormType.DIVISION_LAYOUT>> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (newGadgetConfig: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  config?: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
}

const DivisionLayout = <Type extends GadgetConfigType<ConfigFormType.DIVISION_LAYOUT>>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DivisionLayoutProps<Type>): ReturnType<VoidFunctionComponent<DivisionLayoutProps<Type>>> => {
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
    watch,
    register,
    formState: { isValid, isDirty },
  } = useForm<GadgetConfig<ConfigFormType.DIVISION_LAYOUT>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: initConfig?.width || 1,
      height: initConfig?.height || 2,
      type: gadgetType,
      setting: {
        groupId: initConfig?.setting.groupId || permissionGroup?.group?.id,
        size: initConfig?.setting.size || GadgetSize.SQUARE,
      },
    },
  });

  const handleChangeDivision = useCallback(
    (groupId: string) => {
      setValue('setting.groupId', groupId, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const handleChangeLayout = useCallback(
    (size: GadgetSize) => {
      setValue('setting.size', size, { shouldDirty: true });
    },
    [setValue],
  );

  const handleReset = useCallback(() => {
    reset({
      id: initConfig?.id || '',
      width: initConfig?.width || 1,
      height: initConfig?.height || 2,
      type: gadgetType,
      setting: {
        groupId: initConfig?.setting.groupId || permissionGroup?.group?.id,
        size: initConfig?.setting.size || GadgetSize.SQUARE,
      },
    });
  }, [
    gadgetType,
    initConfig?.height,
    initConfig?.id,
    initConfig?.setting.groupId,
    initConfig?.setting.size,
    initConfig?.width,
    permissionGroup?.group?.id,
    reset,
  ]);

  const handleSave = useCallback<SubmitHandler<GadgetConfig<ConfigFormType.DIVISION_LAYOUT>>>(
    async (config) => {
      const { type, setting } = config;
      const { size } = setting;
      const id = initConfig?.id || uuidv4();
      const layout = gadgetSizeSet[type].find((sizeOption) => sizeOption === size);
      const width = layout ? gadgetSize[layout].width : gadgetSize[GadgetSize.SQUARE].width;
      const height = layout ? gadgetSize[layout].height : gadgetSize[GadgetSize.SQUARE].height;
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
    register('setting.size');
  }, [register]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item sm={12} md={6}>
          <ConfigInfo type={gadgetType} size={watch('setting.size')} />
        </Grid>
        <Grid item sm={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DivisionSelector onChange={handleChangeDivision} />
            </Grid>
            <Grid item xs={12}>
              <LayoutField size={watch('setting.size')} onChange={handleChangeLayout} />
            </Grid>
          </Grid>
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

export default memo(DivisionLayout);
