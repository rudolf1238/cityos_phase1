import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { useStore } from 'city-os-common/reducers';

import {
  ConfigFormType,
  ConfigSaveType,
  DeviceOption,
  GadgetConfig,
  GadgetConfigType,
  GadgetSize,
  TemperatureUnit,
} from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import {
  SEARCH_DEVICES_ON_DASHBOARD,
  SearchDevicesOnDashboardPayload,
  SearchDevicesOnDashboardResponse,
} from '../../../api/searchDevicesOnDashboard';
import { gadgetSize, gadgetSizeSet } from '../../../libs/constants';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useGetGadgetInfoList from '../../../hooks/useGetGadgetBasicInfoList';

import ConfigInfo from '../ConfigInfo';
import DeviceSearchField from '../ConfigFields/DeviceSearchField';
import LayoutField from '../ConfigFields/LayoutField';
import TemperatureUnitField from '../ConfigFields/TemperatureUnitField';

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

interface DeviceTemperatureUnitLayoutProps<
  T extends GadgetConfigType<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>
> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (
    newGadgetConfig: GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>,
  ) => void;
  config?: GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>;
}

const DeviceTemperatureUnitLayout = <
  Type extends GadgetConfigType<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>
>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DeviceTemperatureUnitLayoutProps<Type>): ReturnType<
  VoidFunctionComponent<DeviceTemperatureUnitLayoutProps<Type>>
> => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('common');
  const {
    userProfile: { permissionGroup },
  } = useStore();
  const [device, setDevice] = useState<DeviceOption | null>(null);

  const {
    setValue,
    handleSubmit,
    reset,
    watch,
    register,
    formState: { isValid, isDirty },
  } = useForm<GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: initConfig?.width || 1,
      height: initConfig?.height || 2,
      type: gadgetType,
      setting: {
        deviceId: initConfig?.setting.deviceId,
        size: initConfig?.setting.size || GadgetSize.SQUARE,
        unit: initConfig?.setting.unit || TemperatureUnit.C,
      },
    },
  });

  const gadgetInfoList = useGetGadgetInfoList();
  const gadgets = useMemo(() => gadgetInfoList.find(({ type }) => type === gadgetType), [
    gadgetType,
    gadgetInfoList,
  ]);

  useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(GET_DEVICES_ON_DASHBOARD, {
    skip: !initConfig?.setting.deviceId,
    variables: {
      deviceIds: initConfig ? [initConfig?.setting.deviceId] : [],
    },
    onCompleted: (data) => {
      const initDevice = data.getDevices?.[0];
      if (!initDevice) return;
      setDevice({
        label: initDevice.name,
        value: initDevice.deviceId,
      });
    },
  });

  const { data: searchDevicesResponse } = useQuery<
    SearchDevicesOnDashboardResponse,
    SearchDevicesOnDashboardPayload
  >(SEARCH_DEVICES_ON_DASHBOARD, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      filter: {
        keyword: device?.label,
        type: gadgets?.deviceType,
        attribute: gadgets?.attribute
          ? {
              key: gadgets.attribute.key,
              value: gadgets.attribute.value,
            }
          : undefined,
      },
    },
    skip: !permissionGroup?.group.id,
  });

  const deviceOptions = useMemo<DeviceOption[]>(
    () =>
      searchDevicesResponse?.searchDevices.edges.map(({ node: { deviceId, name } }) => ({
        label: name,
        value: deviceId,
      })) || [],
    [searchDevicesResponse?.searchDevices],
  );

  const handleChangeDeviceId = useCallback(
    (option: DeviceOption | null) => {
      if (!option) return;
      const { label, value } = option;
      setDevice({ label, value });
      setValue('setting.deviceId', option.value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const handleChangeTemperatureUnit = useCallback(
    (unit: TemperatureUnit) => {
      setValue('setting.unit', unit, { shouldDirty: true });
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
        deviceId: initConfig?.setting.deviceId,
        size: initConfig?.setting.size || GadgetSize.SQUARE,
      },
    });
  }, [
    gadgetType,
    initConfig?.height,
    initConfig?.id,
    initConfig?.setting.deviceId,
    initConfig?.setting.size,
    initConfig?.width,
    reset,
  ]);

  const handleSave = useCallback<
    SubmitHandler<GadgetConfig<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>>
  >(
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
    register('setting.deviceId', { required: true });
    register('setting.size');
    register('setting.unit');
  }, [register]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item sm={12} md={6}>
          <ConfigInfo type={gadgetType} size={watch('setting.size')} />
        </Grid>
        <Grid item sm={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={10}>
              <DeviceSearchField
                options={deviceOptions}
                onChange={handleChangeDeviceId}
                inputValue={device?.label || ''}
              />
            </Grid>
            <Grid item xs={10}>
              <TemperatureUnitField
                unit={watch('setting.unit')}
                onChange={handleChangeTemperatureUnit}
              />
            </Grid>
            <Grid item xs={10}>
              <LayoutField size={watch('setting.size')} onChange={handleChangeLayout} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={12} className={classes.buttonWrapper}>
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

export default memo(DeviceTemperatureUnitLayout);
