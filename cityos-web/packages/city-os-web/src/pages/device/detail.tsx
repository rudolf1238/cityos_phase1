import { FetchResult, useMutation, useQuery } from '@apollo/client';
import { FormProvider, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import isEqual from 'lodash/isEqual';

import Button from '@material-ui/core/Button';

import { Action, DeviceType, GPSPoint, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import ErrorPage from 'city-os-common/modules/ErrorPage';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import NoPermissionImg from 'city-os-common/assets/img/no-permission.svg';
import PageContainer from 'city-os-common/modules/PageContainer';
import TabPanelSet from 'city-os-common/modules/TabPanelSet';

import { DetailFormData, locationRegex } from '../../modules/Devices/types';
import { EDIT_DEVICE, EditDevicePayload, EditDeviceResponse } from '../../api/editDevice';
import { EDIT_SENSOR, EditSensorPayload, EditSensorResponse } from '../../api/editSensor';
import {
  GET_DEVICE_ON_DEVICE_DETAIL,
  GetDevicePayload,
  GetDeviceResponse,
  PartialDevice,
} from '../../api/getDeviceOnDeviceDetail';
import useWebTranslation from '../../hooks/useWebTranslation';

import Attributes from '../../modules/Devices/Attributes';
import Images from '../../modules/Devices/Images';
import Info from '../../modules/Devices/Info';
import Sensors from '../../modules/Devices/Sensors';

const parseGPSLocation = (location: GPSPoint): string =>
  location ? `${location.lat}, ${location.lng}` : '';

const parseStringLocation = (location: string): GPSPoint | undefined | null => {
  if (location.trim().length === 0) return null; // device doesn't have location
  if (!locationRegex.test(location)) return undefined; // device will not update location
  const [lat, lng] = location.replace(/ /g, '').split(',');
  return { lat: parseFloat(lat), lng: parseFloat(lng) };
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 600,
  },

  button: {
    margin: 'auto',
    marginTop: theme.spacing(3),
  },

  scrollButtons: {
    backgroundColor: theme.palette.background.container,
  },
}));

const DeviceDetail: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['common', 'device', 'error']);
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const classes = useStyles();
  const router = useRouter();
  const methods = useForm<DetailFormData>({
    mode: 'onChange',
    shouldUnregister: true,
  });
  const {
    reset,
    handleSubmit,
    watch,
    register,
    formState: { isDirty, isValid },
  } = methods;
  const [tabIndex, setTabIndex] = useState(0);
  const [devices, setDevices] = useState<PartialDevice[]>();
  const [defaultValues, setDefaultValues] = useState<DetailFormData>({
    name: '',
    location: '',
    desc: '',
    attributes: [],
    sensors: [],
    editSensorInputs: [],
    imageIds: [],
    type: DeviceType.UNKNOWN,
  });

  const deviceId = isString(router.query.id) ? router.query.id : '';
  const backLink = isString(router.query.back) ? router.query.back : undefined;

  const [editDevice, { loading: editDeviceLoading }] = useMutation<
    EditDeviceResponse,
    EditDevicePayload
  >(EDIT_DEVICE);
  const [editSensor, { loading: editSensorLoading }] = useMutation<
    EditSensorResponse,
    EditSensorPayload
  >(EDIT_SENSOR);

  const { error, refetch } = useQuery<GetDeviceResponse, GetDevicePayload>(
    GET_DEVICE_ON_DEVICE_DETAIL,
    {
      variables: {
        deviceId: deviceId || '',
      },
      skip: !deviceId || !permissionGroup?.group?.id || editDeviceLoading || editSensorLoading,
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ getDevices }) => {
        setDevices(getDevices);
        const currentDevice = getDevices[0];
        if (!currentDevice) return;
        const initValues = {
          name: currentDevice.name,
          location: currentDevice.location ? parseGPSLocation(currentDevice.location) : '',
          desc: currentDevice.desc || '',
          attributes: currentDevice.attributes
            ? currentDevice.attributes
                .map((attribute) => ({
                  id: uuidv4(),
                  keyName: attribute.key,
                  value: attribute.value,
                }))
                .sort((a, b) => a.keyName.localeCompare(b.keyName, i18n.language))
            : [],
          sensors: currentDevice.sensors,
          editSensorInputs: [],
          imageIds: currentDevice.imageIds || [],
          type: currentDevice.type,
        };
        setDefaultValues(initValues);
        reset(initValues);
        register('attributes');
        register('sensors');
        register('editSensorInputs');
        register('imageIds');
        register('type');
      },
    },
  );

  const handleEditDevice = useCallback(
    ({
      name,
      location,
      desc,
      attributes,
      imageIds,
    }: DetailFormData): Promise<FetchResult<EditDeviceResponse> | void> => {
      if (!deviceId) return Promise.resolve();
      const newAttributes = attributes.map(({ keyName, value }) => ({
        key: keyName,
        value,
      }));
      return editDevice({
        variables: {
          deviceId,
          editDeviceInput: {
            name,
            location: parseStringLocation(location) || null,
            desc,
            attributes: newAttributes,
            imageIds,
          },
        },
      });
    },
    [deviceId, editDevice],
  );

  const handleEditSensor = useCallback(
    ({ editSensorInputs }: DetailFormData): Promise<FetchResult<EditSensorResponse>>[] => {
      if (!deviceId || !editSensorInputs || editSensorInputs.length === 0) return [];
      return editSensorInputs.map(async ({ sensorId, name, desc, type, unit }) =>
        editSensor({
          variables: {
            deviceId,
            sensorId,
            editSensorInput: {
              name,
              desc,
              type,
              unit,
              attributes: null,
            },
          },
        }),
      );
    },
    [deviceId, editSensor],
  );

  const handleSave = useCallback(
    async (currentData: DetailFormData) => {
      const updateResult = await Promise.allSettled([
        handleEditDevice(currentData),
        ...handleEditSensor(currentData),
      ]);

      const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
      if (rejectedResults.length === 0) {
        await refetch();
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The value has been saved successfully_', {
              count: 0, // always show plural here
            }),
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
      }
    },
    [handleEditDevice, handleEditSensor, dispatch, t, refetch],
  );

  const handleSelectTab = useCallback((index: number): boolean => {
    setTabIndex(index);
    return true;
  }, []);

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  const watchName = watch('name');
  const watchLocation = watch('location');
  const watchDescription = watch('desc');
  const watchAttributes = watch('attributes');
  const watchSensors = watch('sensors');
  const watchEditSensorInputs = watch('editSensorInputs');
  const watchImageIds = watch('imageIds');

  const disableSave = useMemo(() => {
    const { name, location, desc, attributes, sensors, editSensorInputs, imageIds } = defaultValues;
    const isEqualValues =
      watchName === name &&
      watchLocation === location &&
      watchDescription === desc &&
      isEqual(watchAttributes, attributes) &&
      isEqual(watchSensors, sensors) &&
      isEqual(watchEditSensorInputs, editSensorInputs) &&
      isEqual(watchImageIds, imageIds);

    return !isValid || !isDirty || isEqualValues;
  }, [
    defaultValues,
    isDirty,
    isValid,
    watchAttributes,
    watchDescription,
    watchEditSensorInputs,
    watchImageIds,
    watchLocation,
    watchName,
    watchSensors,
  ]);

  const tabTitles = useMemo(
    () => [
      { title: t('device:Info') },
      { title: t('device:Attributes') },
      { title: t('device:Sensors') },
      { title: t('device:Images') },
    ],
    [t],
  );

  useEffect(() => {
    dispatch({
      type: disableSave ? ReducerActionType.DisableExitDialog : ReducerActionType.EnableExitDialog,
    });
  }, [defaultValues, dispatch, disableSave]);

  return (
    <MainLayout>
      <Guard subject={Subject.DEVICE} action={Action.VIEW} forbidden={isForbidden}>
        {devices && devices.length === 0 && (
          <ErrorPage
            text={t(
              'error:There are no functions available_ Please contact the person who invited you for access_',
            )}
            img={<NoPermissionImg />}
          />
        )}
        {devices && devices.length > 0 && (
          <PageContainer>
            <Header
              title={defaultValues.name || deviceId || ''}
              description={t('device:Show Device Details')}
              backLinkText={t('device:Device Management')}
              backLinkHref={backLink || subjectRoutes[Subject.DEVICE]}
            />
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(handleSave)} className={classes.root}>
                <TabPanelSet
                  tabsColor="transparent"
                  tabTitles={tabTitles}
                  classes={{
                    scrollButtons: classes.scrollButtons,
                  }}
                  onSelect={handleSelectTab}
                >
                  <div hidden={tabIndex !== 0}>
                    <Info deviceData={devices[0]} />
                  </div>
                  <div hidden={tabIndex !== 1}>
                    <Attributes />
                  </div>
                  <div hidden={tabIndex !== 2}>
                    <Sensors />
                  </div>
                  <div hidden={tabIndex !== 3}>
                    <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={<Images />}>
                      <Images enableModify />
                    </Guard>
                  </div>
                </TabPanelSet>
                <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={null}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={disableSave}
                    type="submit"
                  >
                    {t('common:Save')}
                  </Button>
                </Guard>
              </form>
            </FormProvider>
          </PageContainer>
        )}
      </Guard>
    </MainLayout>
  );
};

export default DeviceDetail;
