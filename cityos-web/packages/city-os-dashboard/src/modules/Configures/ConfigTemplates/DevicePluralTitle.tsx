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

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { useStore } from 'city-os-common/reducers';

import SearchFieldLite from 'city-os-common/modules/SearchFieldLite';

import { ConfigFormType, ConfigSaveType, GadgetConfig, GadgetConfigType } from '../../../libs/type';
import {
  SEARCH_DEVICES_ON_DASHBOARD,
  SearchDevicesOnDashboardPayload,
  SearchDevicesOnDashboardResponse,
} from '../../../api/searchDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useGetGadgetInfoList from '../../../hooks/useGetGadgetBasicInfoList';

import ConfigInfo from '../ConfigInfo';
import DeviceSelector, { DeviceOption } from '../../DeviceSelector';

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

interface DevicePluralTitleProps<T extends GadgetConfigType<ConfigFormType.DEVICE_PLURAL_TITLE>> {
  gadgetType: T;
  saveType: ConfigSaveType;
  onUpdateGadget: (newGadgetConfig: GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>) => void;
  config?: GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>;
}

const DevicePluralTitle = <Type extends GadgetConfigType<ConfigFormType.DEVICE_PLURAL_TITLE>>({
  gadgetType,
  saveType,
  onUpdateGadget,
  config: initConfig,
}: DevicePluralTitleProps<Type>): ReturnType<
  VoidFunctionComponent<DevicePluralTitleProps<Type>>
> => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('common');
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const [keyword, setKeyword] = useState<string | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors },
    watch,
  } = useForm<GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>>({
    mode: 'onChange',
    defaultValues: {
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        deviceIds: initConfig?.setting.deviceIds,
      },
    },
  });

  const gadgetInfoList = useGetGadgetInfoList();
  const gadgets = useMemo(() => gadgetInfoList.find(({ type }) => type === gadgetType), [
    gadgetType,
    gadgetInfoList,
  ]);

  const { data: searchDevicesResponse, refetch } = useQuery<
    SearchDevicesOnDashboardResponse,
    SearchDevicesOnDashboardPayload
  >(SEARCH_DEVICES_ON_DASHBOARD, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      size: 10000,
      filter: {
        keyword: keyword === null ? undefined : keyword,
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

  const deviceList: DeviceOption[] = useMemo(
    () =>
      searchDevicesResponse?.searchDevices.edges.map((edge) => {
        const { node } = edge;
        return {
          deviceId: node.deviceId,
          name: node.name,
          imageIds: node.imageIds,
          type: node.type,
        };
      }) || [],
    [searchDevicesResponse],
  );

  const handleReset = useCallback(() => {
    reset({
      id: initConfig?.id || '',
      width: 1,
      height: 1,
      type: gadgetType,
      setting: {
        deviceIds: initConfig?.setting.deviceIds,
      },
    });
    setKeyword(null);
  }, [gadgetType, initConfig?.id, initConfig?.setting.deviceIds, reset]);

  const handleSave = useCallback<SubmitHandler<GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>>>(
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
    register('setting.deviceIds', { required: true });
    // register('setting.title', { required: true });
  }, [register]);

  const handleSearch = useCallback(
    (currentKeyword: string | null) => {
      setKeyword(currentKeyword);
      void refetch();
    },
    [refetch],
  );

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
  }, []);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Grid container spacing={5} className={classes.gridContainer}>
        <Grid item sm={12} md={6}>
          <ConfigInfo type={gadgetType} />
        </Grid>
        <Grid item sm={12} md={6} className={classes.content}>
          <TextField
            defaultValue={initConfig?.setting.title}
            label={t('common:Title')}
            type="text"
            variant="outlined"
            className={classes.textField}
            placeholder={t('common:Title')}
            InputLabelProps={{ shrink: true }}
            inputProps={register('setting.title')}
            error={!!errors.setting?.title}
            helperText={errors.setting?.title?.message}
            required
          />
          <SearchFieldLite
            placeholder={t('common:Search')}
            className={classes.textField}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
          <Grid style={{ height: '400px' }}>
            <DeviceSelector
              selectedDeviceIdList={watch('setting.deviceIds')}
              setSelectedDeviceIdList={(selectedLampList: string[]) => {
                setValue('setting.deviceIds', selectedLampList, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              deviceList={deviceList}
            />
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
