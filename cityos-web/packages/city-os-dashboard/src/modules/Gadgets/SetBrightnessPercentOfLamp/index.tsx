import { makeStyles, useTheme } from '@material-ui/core/styles';

import { ApolloError, useMutation, useQuery } from '@apollo/client';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import {
  UPDATE_SENSOR,
  UpdateSensorPayload,
  UpdateSensorResponse,
} from 'city-os-common/api/updateSensor';
import { isNumber } from 'city-os-common/libs/validators';
import { subscribeSensorIds } from 'city-os-common/libs/sensorIdsMap';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import SetBrightnessPercentOfLampConfig from './SetBrightnessPercentOfLampConfig';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: theme.spacing(0, 3),

    '& > .MuiGrid-item': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  loading: {
    height: '100%',
  },

  circle: {
    borderRadius: '50%',
    padding: theme.spacing(2, 0),
  },

  label: {
    padding: theme.spacing(0, 1),
    color: theme.palette.primary.contrastText,
  },

  value: {
    lineHeight: 1,
    color: theme.palette.gadget.value,
    fontWeight: theme.typography.h6.fontWeight,
  },
}));

interface SetBrightnessPercentOfLampProps {
  config: GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_PLURAL_TITLE>) => void;
}

const SetBrightnessPercentOfLamp: VoidFunctionComponent<SetBrightnessPercentOfLampProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onDuplicate,
  onUpdate,
}: SetBrightnessPercentOfLampProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { deviceIds, title },
  } = config;
  const { dispatch } = useStore();

  const [updateTime, setUpdateTime] = useState<Date>();
  const [brightnessPercent, setBrightnessPercent] = useState<number>(0);

  const { data, loading, error: getDevicesError } = useQuery<
    GetDevicesOnDashboardResponse,
    GetDevicesOnDashboardPayload
  >(GET_DEVICES_ON_DASHBOARD, {
    variables: { deviceIds },
  });
  const [updateSensor] = useMutation<UpdateSensorResponse, UpdateSensorPayload>(UPDATE_SENSOR);

  const devices = useMemo<GadgetDeviceInfo[]>(
    () =>
      data?.getDevices?.map(({ deviceId: getDeviceId, name, sensors, groups }) => ({
        deviceId: getDeviceId,
        name,
        sensors,
        groups,
      })) || [],
    [data?.getDevices],
  );

  const showableSensors = useMemo(() => {
    const sensors = devices[0]?.sensors;
    const ownSensorIds = new Set(sensors ? sensors.map(({ sensorId }) => sensorId) : []);
    const subscribeSensorsList = subscribeSensorIds[DeviceType.LAMP].filter((id) =>
      ownSensorIds.has(id),
    );
    return new Set(subscribeSensorsList);
  }, [devices]);

  const sensorValues = useSubscribeSensors(devices, showableSensors);

  useEffect(() => {
    if (sensorValues !== null) {
      console.info(sensorValues);
      if (Object.keys(sensorValues).length !== 0) {
        let total = 0;
        Object.values(sensorValues).map((sensorValue) => {
          const { [SensorId.LAMP_BRIGHTNESS_PERCENT]: currentBrightnessPercent } = sensorValue;
          if (currentBrightnessPercent) {
            if (isNumber(currentBrightnessPercent.value)) {
              total += currentBrightnessPercent.value;
            }
            if (currentBrightnessPercent.time) {
              setUpdateTime(new Date(currentBrightnessPercent.time));
            }
          }
          return null;
        });
        setBrightnessPercent(total / Object.keys(sensorValues).length);
      }
    }
  }, [sensorValues]);

  const sensorValuesErrorList = useMemo<(ApolloError | undefined)[]>(() => {
    const currentErrorList: (ApolloError | undefined)[] = [];
    showableSensors.forEach((showableSensor) => {
      currentErrorList.push(
        sensorValues?.[showableSensor]?.[SensorId.LAMP_BRIGHTNESS_PERCENT]?.error,
      );
    });
    return currentErrorList;
  }, [sensorValues, showableSensors]);

  const isForbidden = useMemo(
    () =>
      [getDevicesError, ...sensorValuesErrorList].some((err) =>
        isGqlError(err, ErrorCode.FORBIDDEN),
      ),
    [getDevicesError, sensorValuesErrorList],
  );

  const sendBrightnessPercent = useCallback(
    async (value: number) => {
      try {
        const actionList = devices.map((device) =>
          updateSensor({
            variables: {
              deviceId: device.deviceId,
              sensorId: 'setBrightnessPercent',
              value,
            },
          }),
        );

        const updateResultList = await Promise.all(actionList);

        updateResultList.map((updateResult) => {
          if (!updateResult.data?.updateSensor) {
            throw new Error('update sensor failed');
          }
          return null;
        });

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The value has been set successfully_'),
          },
        });
      } catch (e) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Save failed_ Please try again_'),
          },
        });
      }
    },
    [devices, dispatch, t, updateSensor],
  );

  const CustomSlider = useCallback(
    (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => {
      const value = (255 * brightnessPercent) / 100;

      return (
        <span
          {...props}
          style={{
            ...props.style,
            backgroundColor:
              brightnessPercent > 50
                ? theme.palette.background.dark
                : theme.palette.background.light,
          }}
        >
          <EmojiObjectsIcon
            style={{
              color: `rgb(${value},${value},0)`,
              fontSize: '1.25em',
              borderRadius: '50%',
            }}
          />
        </span>
      );
    },
    [brightnessPercent, theme.palette.background.dark, theme.palette.background.light],
  );

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('dashboard:You don_t have permission to access this device_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onUpdate={onUpdate}
      ConfigComponent={SetBrightnessPercentOfLampConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid container className={classes.container} spacing={4}>
            <Typography variant="h5">
              {title || 'No Title'} | {Math.round(brightnessPercent)}%
            </Typography>
            <Slider
              value={brightnessPercent}
              aria-label={t('Lamp brightness')}
              valueLabelDisplay="off"
              onChange={(_event, value) => {
                setBrightnessPercent(typeof value === 'number' ? value : value[0]);
              }}
              onChangeCommitted={(_event, value) => {
                void sendBrightnessPercent(typeof value === 'number' ? value : value[0]);
              }}
              ThumbComponent={CustomSlider}
            />
          </Grid>
        </>
      )}
    </GadgetBase>
  );
};

export default memo(SetBrightnessPercentOfLamp);
