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
  GadgetType,
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
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useGetGadgetInfoList from '../../../hooks/useGetGadgetBasicInfoList';

import ConfigInfo from '../ConfigInfo';
import DeviceSearchField from '../ConfigFields/DeviceSearchField';

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

interface DeviceOnlyProps<T extends GadgetConfigType<ConfigFormType.DEVICE_ONLY>> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (newGadgetConfig: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
  config?: GadgetConfig<ConfigFormType.DEVICE_ONLY>;
}

const DeviceOnly = <Type extends GadgetConfigType<ConfigFormType.DEVICE_ONLY>>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DeviceOnlyProps<Type>): ReturnType<VoidFunctionComponent<DeviceOnlyProps<Type>>> => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('common');
  const {
    userProfile: { permissionGroup },
  } = useStore();
  const [device, setDevice] = useState<DeviceOption | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<GadgetConfig<ConfigFormType.DEVICE_ONLY>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        deviceId: initConfig?.setting.deviceId,
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

  const handleReset = useCallback(() => {
    reset({
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        deviceId: initConfig?.setting.deviceId,
      },
    });
    setDevice(null);
  }, [gadgetType, initConfig?.id, initConfig?.setting.deviceId, reset]);

  const handleSave = useCallback<SubmitHandler<GadgetConfig<ConfigFormType.DEVICE_ONLY>>>(
    async (config) => {
      const { width, type, setting } = config;
      const id = initConfig?.id || uuidv4();
      const height = type === GadgetType.LIVE_VIEW ? 2 : 1;
      const newConfig = { id, width, height, type, setting };
      onUpdateGadget(newConfig);
      handleReset();
    },
    [handleReset, initConfig?.id, onUpdateGadget],
  );

  useEffect(() => {
    register('setting.deviceId', { required: true });
  }, [register]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item xs={12} md={6}>
          <ConfigInfo type={gadgetType} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DeviceSearchField
            options={deviceOptions}
            onChange={handleChangeDeviceId}
            inputValue={device?.label || ''}
          />
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

export default memo(DeviceOnly);
