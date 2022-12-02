import { makeStyles } from '@material-ui/core/styles';

import { SubmitHandler, useForm } from 'react-hook-form';
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

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { useStore } from 'city-os-common/reducers';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  ConfigFormType,
  ConfigSaveType,
  DeviceOption,
  GadgetConfig,
  GadgetConfigType,
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

import { getDeviceIds } from '../../../libs/utils';
import ConfigInfo from '../ConfigInfo';
import DeviceList from '../ConfigFields/DeviceList';
import DeviceSearchField from '../ConfigFields/DeviceSearchField';

const deviceLimit = 20;

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    margin: 0,
    width: '100%',
  },

  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },

  textField: {
    width: '100%',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

interface DevicesTitleProps<T extends GadgetConfigType<ConfigFormType.DEVICES_TITLE>> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (newGadgetConfig: GadgetConfig<ConfigFormType.DEVICES_TITLE>) => void;
  config?: GadgetConfig<ConfigFormType.DEVICES_TITLE>;
}

const DevicePluralTitle = <Type extends GadgetConfigType<ConfigFormType.DEVICES_TITLE>>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DevicesTitleProps<Type>): ReturnType<VoidFunctionComponent<DevicesTitleProps<Type>>> => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('common');
  const {
    userProfile: { permissionGroup },
  } = useStore();
  const [device, setDevice] = useState<DeviceOption | null>(null);
  const [deviceList, setDeviceList] = useState<DeviceOption[]>([]);

  const {
    setValue,
    handleSubmit,
    reset,
    watch,
    register,
    formState: { isValid, isDirty },
  } = useForm<GadgetConfig<ConfigFormType.DEVICES_TITLE>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: initConfig?.width || 1,
      height: initConfig?.height || 1,
      type: gadgetType,
      setting: {
        title: initConfig?.setting?.title,
        deviceIds: initConfig?.setting.deviceIds,
      },
    },
  });

  const gadgetInfoList = useGetGadgetInfoList();
  const gadgets = useMemo(() => gadgetInfoList.find(({ type }) => type === gadgetType), [
    gadgetType,
    gadgetInfoList,
  ]);

  useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(GET_DEVICES_ON_DASHBOARD, {
    variables: {
      deviceIds: initConfig?.setting.deviceIds || [],
    },
    skip: !initConfig?.setting.deviceIds,
    onCompleted: ({ getDevices }) => {
      if (!getDevices) return;
      const initDeviceList =
        initConfig?.setting.deviceIds.map((id) => ({
          value: id,
          label: getDevices.find(({ deviceId }) => id === deviceId)?.name || '',
        })) || [];
      setDeviceList(initDeviceList);
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

  const handleChangeDeviceIds = useCallback((option: DeviceOption | null) => {
    if (!option) return;
    const { label, value } = option;
    setDevice({ label, value });
  }, []);

  const handleAddDevice = useCallback(() => {
    if (
      deviceList.length === deviceLimit ||
      !device ||
      deviceList.some(({ value }) => value === device.value)
    )
      return;
    const newDeviceList = [...deviceList, device];
    setDeviceList(newDeviceList);
    const deviceIds = getDeviceIds(newDeviceList);
    setValue('setting.deviceIds', deviceIds, { shouldDirty: true, shouldValidate: true });
    setDevice(null);
  }, [device, deviceList, setValue]);

  const handleDeleteDevice = useCallback(
    (deviceId: string) => {
      const newDeviceList = deviceList.filter(({ value }) => value !== deviceId);
      setDeviceList(newDeviceList);
      const deviceIds = getDeviceIds(newDeviceList);
      setValue('setting.deviceIds', deviceIds, { shouldDirty: true, shouldValidate: true });
    },
    [deviceList, setValue],
  );

  const handleReset = useCallback(() => {
    reset({
      id: initConfig?.id || '',
      width: initConfig?.width || 1,
      height: initConfig?.height || 1,
      type: gadgetType,
      setting: {
        title: initConfig?.setting?.title,
        deviceIds: initConfig?.setting.deviceIds,
      },
    });
  }, [
    gadgetType,
    initConfig?.height,
    initConfig?.id,
    initConfig?.setting.deviceIds,
    initConfig?.setting?.title,
    initConfig?.width,
    reset,
  ]);

  const handleSave = useCallback<SubmitHandler<GadgetConfig<ConfigFormType.DEVICES_TITLE>>>(
    async (config) => {
      const { width, type, setting } = config;
      const id = initConfig?.id || uuidv4();
      const height = 1;
      const newConfig = { id, width, height, type, setting };
      onUpdateGadget(newConfig);
      handleReset();
    },
    [handleReset, initConfig?.id, onUpdateGadget],
  );

  useEffect(() => {
    register('setting.title', { required: true });
    register('setting.deviceIds', { required: true, validate: (value) => value.length > 0 });
  }, [register]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item sm={12} md={6}>
          <ConfigInfo type={gadgetType} />
        </Grid>
        <Grid item sm={12} md={6} className={classes.content}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                value={watch('setting.title')}
                label={t('common:Title')}
                type="text"
                variant="outlined"
                className={classes.textField}
                placeholder={t('common:Title')}
                InputLabelProps={{ shrink: true, required: true }}
                inputProps={register('setting.title')}
                required
              />
            </Grid>
            <Grid item xs={10}>
              <DeviceSearchField
                options={deviceOptions}
                onChange={handleChangeDeviceIds}
                inputValue={device?.label || ''}
              />
            </Grid>
            <Grid item xs={2}>
              <ThemeIconButton
                color="primary"
                variant="contained"
                onClick={handleAddDevice}
                disabled={
                  !device ||
                  device.label.trim().length === 0 ||
                  deviceList.length >= deviceLimit ||
                  deviceList.some(({ value }) => value === device.value)
                }
              >
                <AddIcon />
              </ThemeIconButton>
            </Grid>
            <Grid item xs={12}>
              <DeviceList
                devices={deviceList}
                onDelete={handleDeleteDevice}
                deviceLimit={deviceLimit}
                disableBullet
              />
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

export default memo(DevicePluralTitle);
