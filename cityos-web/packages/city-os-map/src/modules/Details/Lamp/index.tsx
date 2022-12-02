import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent, useCallback, useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { Action, DeviceType, Subject } from 'city-os-common/libs/schema';
import { SingleDeviceResponse } from 'city-os-common/api/getMapDevices';
import { tableSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import BasicOverview from 'city-os-common/modules/Overview/BasicOverview';

import { ScheduleInputItem } from './Schedule/ScheduleMain/ScheduleProvider';
import { useMapContext } from '../../MapProvider';
import useMapTranslation from '../../../hooks/useMapTranslation';

import BrightnessController from './BrightnessController';
import LampInfoTable from './InfoTable';
import LightSensor from './LightSensor';
import Schedule from './Schedule';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(3),
    overflow: 'auto',
  },

  overview: {
    width: '100%',
  },

  table: {
    marginTop: theme.spacing(0.5),
    width: '100%',
    maxHeight: 344,
  },

  moreButton: {
    margin: `auto auto ${theme.spacing(3)}px`,
  },

  subtitleBlock: {
    width: '100%',

    '& > h6': {
      padding: theme.spacing(0.5, 0),
    },
  },
}));

interface SubtitleBlockProps {
  title: string;
}

const SubtitleBlock: VoidFunctionComponent<SubtitleBlockProps> = ({
  title,
}: SubtitleBlockProps) => {
  const classes = useStyles();

  return (
    <div className={classes.subtitleBlock}>
      <Typography variant="subtitle2" align="left">
        {title}
      </Typography>
      <Divider orientation="horizontal" />
    </div>
  );
};

interface LampProps {
  devices: SingleDeviceResponse[];
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

const Lamp: VoidFunctionComponent<LampProps> = ({ devices, onChanged, onUpdating }: LampProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useMapTranslation(['common', 'column', 'map']);
  const { tDevice } = useDeviceTranslation();
  const { showPoleMenu, showMore, setShowMore, setShowPoleMenu } = useMapContext();

  const handleClick = useCallback(() => {
    if (downMd) {
      setShowPoleMenu(false);
    }
    setShowMore(true);
  }, [downMd, setShowMore, setShowPoleMenu]);

  const subscribeSensors = useMemo(() => new Set(tableSensorIds[DeviceType.LAMP]), []);
  const sensorValues = useSubscribeSensors(devices || null, subscribeSensors);
  const modifyPermission = useIsEnableRule({ subject: Subject.LIGHTMAP, action: Action.MODIFY });

  const devicesWithBrightness = useMemo<SingleDeviceResponse[]>(
    () =>
      devices.filter((device) =>
        device.sensors.some((sensor) => sensor.sensorId === 'setBrightnessPercent'),
      ),
    [devices],
  );

  const lightSensorInputs = useMemo(
    () =>
      devicesWithBrightness.reduce<ComponentProps<typeof LightSensor>['lightSensorInputs']>(
        (acc, { deviceId, hasLightSensor, lightSchedule }) =>
          hasLightSensor && lightSchedule
            ? acc.concat({
                deviceId,
                hasLightSensor,
                enableLightSensor: lightSchedule.lightSensor?.enableLightSensor ?? null,
                lightSensorCondition: lightSchedule.lightSensor?.lightSensorCondition ?? null,
              })
            : acc,
        [],
      ),
    [devicesWithBrightness],
  );

  const brightnessInputs = useMemo(() => {
    if (!sensorValues) return [];
    const list = Object.keys(sensorValues)
      .filter((deviceId) => devices.some((item) => item.deviceId === deviceId))
      .map((deviceId) => {
        const brightness = sensorValues?.[deviceId].brightnessPercent?.value;
        return {
          deviceId,
          brightnessPercent: typeof brightness === 'number' ? brightness : '--',
        };
      });
    return list;
  }, [devices, sensorValues]);

  const scheduleInputs = useMemo(
    () =>
      devicesWithBrightness.reduce<ScheduleInputItem[]>(
        (acc, { deviceId, name, lightSchedule, timezone }) =>
          acc.concat({
            deviceId,
            name,
            manualSchedule: lightSchedule?.manualSchedule || {
              enableManualSchedule: false,
              schedules: [],
            },
            timezone: timezone ?? undefined,
          }),
        [],
      ),
    [devicesWithBrightness],
  );

  return (
    <>
      <div className={classes.content}>
        {devices.length > 1 && (
          <>
            <div className={classes.table}>
              <LampInfoTable devices={devices} sensorValues={sensorValues} />
            </div>
            <Divider />
          </>
        )}
        {devices.length === 1 && (
          <BasicOverview
            name={tDevice(DeviceType.LAMP)}
            device={devices[0]}
            shownSensors={tableSensorIds[DeviceType.LAMP]}
            sensorValues={sensorValues}
            shrink={showPoleMenu}
            className={classes.overview}
          />
        )}
        {modifyPermission && devicesWithBrightness.length > 0 && showMore && (
          <>
            <SubtitleBlock title={t('column:Brightness')} />
            <BrightnessController
              brightnessInputs={brightnessInputs}
              onChanged={onChanged}
              onUpdating={onUpdating}
            />
            {lightSensorInputs.length > 0 && (
              <>
                <SubtitleBlock title={t('map:Light Sensor')} />
                <LightSensor
                  lightSensorInputs={lightSensorInputs}
                  onChanged={onChanged}
                  onUpdating={onUpdating}
                />
              </>
            )}
            {scheduleInputs.length > 0 && (
              <>
                <SubtitleBlock title={t('map:Schedule')} />
                <Schedule
                  scheduleInputs={scheduleInputs}
                  onChanged={onChanged}
                  onUpdating={onUpdating}
                />
              </>
            )}
          </>
        )}
      </div>
      {modifyPermission && devicesWithBrightness.length > 0 && !showMore && (
        <Button
          variant="outlined"
          color="primary"
          size="medium"
          onClick={handleClick}
          className={classes.moreButton}
        >
          {t('common:More')}
        </Button>
      )}
    </>
  );
};

export default Lamp;
