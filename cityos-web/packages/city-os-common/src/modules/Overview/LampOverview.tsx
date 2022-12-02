import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, {
  ComponentProps,
  Fragment,
  VoidFunctionComponent,
  useCallback,
  useMemo,
} from 'react';
import chunk from 'lodash/chunk';
import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';

import useHiddenStyles from '../../styles/hidden';

import { DeviceStatus, DeviceType, Sensor, SensorId, SensorType } from '../../libs/schema';
import { RelatedDeviceResponse } from '../../api/getMapDevices';
import { UPDATE_SENSOR, UpdateSensorPayload, UpdateSensorResponse } from '../../api/updateSensor';
import { isDeviceStatus } from '../../libs/validators';
import { useStore } from '../../reducers';
import ErrorCode from '../../libs/errorCode';
import ReducerActionType from '../../reducers/actions';
import isGqlError from '../../libs/isGqlError';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useDeviceStatusTranslation from '../../hooks/useDeviceStatusTranslation';
import useSensorIdTranslation from '../../hooks/useSensorIdTranslation';
import useSubscribeDevicesStatus from '../../hooks/useSubscribeDevicesStatus';
import useSubscribeSensors from '../../hooks/useSubscribeSensors';

import { Overview, OverviewCell, OverviewRow } from './Overview';
import AccessDeniedChip from '../AccessDeniedChip';
import OverviewHeader from './OverviewHeader';
import StatusChip from '../StatusChip';

const useStyles = makeStyles((theme) => ({
  icon: {
    margin: 'auto',
    backgroundColor: theme.palette.background.icon,
    width: theme.spacing(6.5),
    height: theme.spacing(6.5),
  },

  header: {
    backgroundColor: theme.palette.background.light,
  },

  items: {
    [theme.breakpoints.down('md')]: {
      height: theme.spacing(12),
    },
  },

  smOnlyFill: {
    display: 'none',

    [theme.breakpoints.only('sm')]: {
      display: 'block',
    },
  },

  sensorItems: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(8),

      '&:nth-of-type(6n),&:nth-of-type(6n-1),&:nth-of-type(6n+1)': {
        backgroundColor: theme.palette.background.evenRow,
      },

      '&:nth-of-type(6n-2),&:nth-of-type(6n-3),&:nth-of-type(6n-4)': {
        backgroundColor: theme.palette.background.oddRow,
      },
    },
  },

  spaceItems: {
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
  },

  row: {
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',

    '&:last-of-type': {
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: theme.spacing(0, 0, 1, 1),
    },
  },

  headerRow: {
    '&:nth-of-type(2)': {
      borderTop: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: theme.spacing(1, 1, 0, 0),
    },
  },

  noHeaderRow: {
    '&:first-of-type': {
      borderTop: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: theme.spacing(1, 1, 0, 0),
    },
  },
}));

type ContentsData = {
  sensorId?: string;
  title: string;
  value: string | number | boolean;
  type: 'text' | 'status' | 'switch';
  isLoading?: boolean;
  isDenied?: boolean;
}[];

interface PartialSensor extends Omit<Partial<Sensor>, 'sensorId' | 'name' | 'type' | 'unit'> {
  sensorId: string;
  name: string;
  type: SensorType;
  unit: string | null;
}

interface PartialDevice {
  deviceId: string;
  type: DeviceType;
  sensors: PartialSensor[] | null;
}

interface OverviewContentProps {
  name: string;
  device: PartialDevice;
  sensorValues: ReturnType<typeof useSubscribeSensors>;
  showableSensors: SensorId[];
  shrink?: boolean;
  reverseRowColor?: boolean;
  disableHeader?: boolean;
}

const OverviewContent: VoidFunctionComponent<OverviewContentProps> = ({
  name,
  device,
  sensorValues,
  showableSensors,
  shrink = false,
  reverseRowColor = false,
  disableHeader = false,
}: OverviewContentProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { deviceId, type, sensors } = device;
  const { t } = useCommonTranslation('common');
  const { tSensorId } = useSensorIdTranslation();
  const { tDeviceStatus } = useDeviceStatusTranslation();
  const deviceStatusRes = useSubscribeDevicesStatus([{ deviceId, type }]);
  const { dispatch } = useStore();

  const [updateSensor] = useMutation<UpdateSensorResponse, UpdateSensorPayload>(UPDATE_SENSOR);

  const onBrightnessChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, sensorId?: string) => {
      try {
        const value = checked ? 100 : 0;

        if (!sensorId) throw new Error('sensorId is null');

        const updateResult = await updateSensor({
          variables: {
            deviceId,
            sensorId,
            value,
          },
        });

        if (!updateResult.data?.updateSensor) {
          if (!sensorId) throw new Error('update sensor failed');
        }

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The value has been set successfully_'),
          },
        });
      } catch (e) {
        // TODO: 回溯按鈕的狀態
        // eslint-disable-next-line no-param-reassign
        event.target.checked = !checked;

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Save failed_ Please try again_'),
          },
        });
      }
    },
    [deviceId, dispatch, t, updateSensor],
  );

  const overviewContent = useMemo(() => {
    const basicContent: ContentsData = [
      {
        title: name,
        value: deviceStatusRes.data[0]?.status,
        type: 'status',
        isLoading: deviceStatusRes.isLoading,
        isDenied: deviceStatusRes.error && isGqlError(deviceStatusRes.error, ErrorCode.FORBIDDEN),
      },
    ];
    if (!sensors) return chunk(basicContent, 2);

    const contentWithSensors = showableSensors.reduce<ContentsData>((result, sensorId) => {
      const sensorRes = sensorValues?.[deviceId]?.[sensorId];
      const unit = sensors.find((sensor) => sensor.sensorId === sensorId)?.unit;
      result.push({
        title: tSensorId(sensorId) || '',
        value: sensorRes?.value ? `${sensorRes.value.toString()} ${unit || ''}`.trim() : '',
        type: 'text',
        isDenied: sensorRes?.error && isGqlError(sensorRes.error, ErrorCode.FORBIDDEN),
      });
      return result;
    }, basicContent);

    console.info(sensorValues?.[deviceId]);

    contentWithSensors.splice(1, 0, {
      sensorId: 'setBrightnessPercent',
      title: t('switch'),
      type: 'switch',
      value: sensorValues?.[deviceId]?.brightnessPercent?.value !== 0,
    });

    return chunk(contentWithSensors, 2);
  }, [
    name,
    deviceStatusRes.data,
    deviceStatusRes.isLoading,
    deviceStatusRes.error,
    sensors,
    showableSensors,
    t,
    sensorValues,
    deviceId,
    tSensorId,
  ]);

  return (
    <>
      {overviewContent.map((row) => (
        <OverviewRow
          key={row[0].title}
          reverseRowColor={reverseRowColor}
          className={clsx(classes.row, disableHeader ? classes.noHeaderRow : classes.headerRow)}
        >
          <OverviewCell md={1} className={clsx(hiddenClasses.smDownHidden)} />
          {row.map(({ title, value, type: contentType, isLoading, isDenied, sensorId }) => (
            <Fragment key={title}>
              <OverviewCell
                md={3}
                sm={shrink ? 6 : 5}
                xs={6}
                value={title}
                className={classes.sensorItems}
              />
              {isDenied && (
                <OverviewCell md={2} sm={shrink ? 6 : 5} xs={6} className={classes.sensorItems}>
                  {contentType === 'status' ? (
                    <StatusChip label={t('Unknown')} color="disabled" />
                  ) : (
                    <AccessDeniedChip />
                  )}
                </OverviewCell>
              )}
              {!isDenied &&
                /* eslint-disable-next-line no-nested-ternary */
                (contentType === 'status' ? (
                  <OverviewCell md={2} sm={shrink ? 6 : 5} xs={6} className={classes.sensorItems}>
                    {isLoading ? (
                      <CircularProgress />
                    ) : (
                      <StatusChip
                        label={isDeviceStatus(value) ? tDeviceStatus(value) : value}
                        color={value === DeviceStatus.ERROR ? 'error' : 'default'}
                      />
                    )}
                  </OverviewCell>
                ) : contentType === 'switch' ? (
                  <div style={{ height: '72px', display: 'flex', alignItems: 'center' }}>
                    <Switch
                      defaultChecked={value === true}
                      color="primary"
                      onChange={(e, data) => {
                        void onBrightnessChange(e, data, sensorId);
                      }}
                    />
                  </div>
                ) : (
                  <OverviewCell
                    md={2}
                    sm={shrink ? 6 : 5}
                    xs={6}
                    className={classes.sensorItems}
                    value={value.toString()}
                    valueVariant="subtitle2"
                  />
                ))}
              <OverviewCell
                md={3}
                sm={2}
                xs={4}
                className={clsx(classes.sensorItems, classes.smOnlyFill, {
                  [classes.spaceItems]: shrink,
                })}
              />
              {Array.from({ length: Math.max(0, 2 - row.length) }, (_, i) => (
                <OverviewCell md key={i.toString()} className={hiddenClasses.smDownHidden} />
              ))}
            </Fragment>
          ))}
          <OverviewCell md={1} className={hiddenClasses.smDownHidden} />
        </OverviewRow>
      ))}
    </>
  );
};

interface LampOverviewProps extends ComponentProps<typeof Overview> {
  name: string;
  device: RelatedDeviceResponse;
  shownSensors?: SensorId[];
  sensorValues?: ReturnType<typeof useSubscribeSensors>;
  disableHeader?: boolean;
  shrink?: boolean;
  reverseRowColor?: boolean;
}

const LampOverview: VoidFunctionComponent<LampOverviewProps> = ({
  name,
  device,
  shownSensors = [],
  sensorValues: sensorValuesProp,
  disableHeader = false,
  shrink = false,
  reverseRowColor = false,
  ...props
}: LampOverviewProps) => {
  const subscribeSensors = useMemo(
    () => (shownSensors.length > 0 ? new Set(shownSensors) : undefined),
    [shownSensors],
  );
  // only subscribe if no sensorValues prop
  const sensorValues = useSubscribeSensors(
    sensorValuesProp !== undefined ? null : [device],
    subscribeSensors,
  );

  const showableSensors = useMemo(() => {
    const ownSensorIds = device.sensors ? device.sensors.map(({ sensorId }) => sensorId) : [];
    return shownSensors.filter((sensorId) => ownSensorIds.includes(sensorId));
  }, [device, shownSensors]);

  return (
    <Overview {...props}>
      {!disableHeader && <OverviewHeader device={device} shrink={shrink} />}
      <OverviewContent
        name={name}
        device={device}
        sensorValues={sensorValuesProp || sensorValues}
        showableSensors={showableSensors}
        shrink={shrink}
        reverseRowColor={reverseRowColor}
        disableHeader={disableHeader}
      />
    </Overview>
  );
};

export default LampOverview;
