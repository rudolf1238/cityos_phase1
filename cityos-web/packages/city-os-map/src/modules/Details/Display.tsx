import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useMemo } from 'react';

import Grid from '@material-ui/core/Grid';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import { RelatedDeviceResponse } from 'city-os-common/api/getMapDevices';
import { subscribeSensorIds, tableSensorIds } from 'city-os-common/libs/sensorIdsMap';
import useCHTSnapshot from 'city-os-common/hooks/useCHTSnapshot';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useSensorIdTranslation from 'city-os-common/hooks/useSensorIdTranslation';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import BasicOverview from 'city-os-common/modules/Overview/BasicOverview';
import Snapshot from 'city-os-common/modules/Snapshot';

import { useMapContext } from '../MapProvider';

const useStyles = makeStyles(() => ({
  overview: {
    flexGrow: 1,
  },
}));

interface DisplayProps {
  device: RelatedDeviceResponse;
}

const Display: VoidFunctionComponent<DisplayProps> = ({ device }: DisplayProps) => {
  const classes = useStyles();
  const { tSensorId } = useSensorIdTranslation();
  const { tDevice } = useDeviceTranslation();
  const { showPoleMenu } = useMapContext();

  const showableSensors = useMemo(() => {
    const ownSensorIds = new Set(
      device.sensors ? device.sensors.map(({ sensorId }) => sensorId) : [],
    );
    const subscribeSensorsList = subscribeSensorIds[DeviceType.DISPLAY].filter((id) =>
      ownSensorIds.has(id),
    );
    return new Set(subscribeSensorsList);
  }, [device]);

  const sensorValues = useSubscribeSensors([device], showableSensors);

  const queryUrl = useMemo<string | undefined>(() => {
    const url = sensorValues?.[device.deviceId]?.[SensorId.DISPLAY_PLAYER_SNAPSHOT]?.value;
    return typeof url === 'string' ? url : undefined;
  }, [device, sensorValues]);
  const queryProjectKey = useMemo(() => device.groups[0].projectKey, [device]);
  const imgSrc = useCHTSnapshot(queryProjectKey, queryUrl);

  return (
    <Grid container spacing={2}>
      <Grid
        item
        lg={imgSrc ? 9 : 12}
        md={imgSrc && !showPoleMenu ? 9 : 12}
        sm={imgSrc && !showPoleMenu ? 9 : 12}
        xs={12}
      >
        <BasicOverview
          name={tDevice(DeviceType.DISPLAY)}
          device={device}
          shownSensors={tableSensorIds[DeviceType.DISPLAY]}
          className={classes.overview}
          sensorValues={sensorValues}
          shrink={showPoleMenu}
        />
      </Grid>
      {imgSrc && (
        <Grid item lg={3} md={showPoleMenu ? 12 : 3} sm={showPoleMenu ? 12 : 3} xs={12}>
          <Snapshot src={imgSrc} alt={tSensorId(SensorId.DISPLAY_PLAYER_SNAPSHOT)} />
        </Grid>
      )}
    </Grid>
  );
};

export default Display;
