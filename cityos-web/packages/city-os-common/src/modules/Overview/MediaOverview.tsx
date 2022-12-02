import { fade, makeStyles } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent, useMemo } from 'react';
import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import { DeviceStatus, DeviceType, SensorId } from '../../libs/schema';
import { PartialDevice } from './type';
import { isDeviceStatus } from '../../libs/validators';
import ErrorCode from '../../libs/errorCode';
import isGqlError from '../../libs/isGqlError';
import useCHTSnapshot from '../../hooks/useCHTSnapshot';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useDeviceStatusTranslation from '../../hooks/useDeviceStatusTranslation';
import useHiddenStyles from '../../styles/hidden';
import useSensorIdTranslation from '../../hooks/useSensorIdTranslation';
import useSubscribeDevicesStatus from '../../hooks/useSubscribeDevicesStatus';
import useSubscribeSensors from '../../hooks/useSubscribeSensors';

import { Overview, OverviewCell, OverviewRow } from './Overview';
import AccessDeniedChip from '../AccessDeniedChip';
import LiveStreamPlayer from '../videoPlayer/LiveStreamPlayer';
import OverviewHeader from './OverviewHeader';
import Snapshot from '../Snapshot';
import StatusChip from '../StatusChip';

const useStyles = makeStyles((theme) => ({
  root: {
    '& $mediaOverview': {
      backgroundColor: 'transparent',
    },
  },

  mediaOverview: {
    alignItems: 'flex-start',

    '& > :first-child': {
      paddingLeft: 0,
    },

    '& > :last-child': {
      paddingRight: 0,
    },

    '& $videoWrapper': {
      padding: 0,
    },
  },

  gridContainer: {
    margin: 0,
    width: '100%',
  },

  videoWrapper: {
    position: 'relative',
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    overflow: 'hidden',
  },

  snapshot: {
    borderRadius: theme.shape.borderRadius,
    width: '100%',
  },

  sensorItems: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(8),
    },
  },

  mdDownHidden: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  fullPageButton: {
    position: 'absolute',
    right: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    margin: 'auto 0 0 auto',
    borderWidth: 0,
    backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    width: 30,
    height: 30,

    '&:hover': {
      borderWidth: 0,
      backgroundColor: fade(theme.palette.primary.contrastText, 0.5),
    },
  },
}));

type ContentsData = {
  title: string;
  value: string | number | boolean;
  type: 'text' | 'status';
  isLoading?: boolean;
  isDenied?: boolean;
}[];

interface OverviewContentProps {
  name: string;
  device: Omit<PartialDevice, 'status'>;
  sensorValues: ReturnType<typeof useSubscribeSensors>;
  showableSensors: SensorId[];
}

const OverviewContent: VoidFunctionComponent<OverviewContentProps> = ({
  name,
  device,
  sensorValues,
  showableSensors,
}: OverviewContentProps) => {
  const classes = useStyles();
  const { deviceId, type, sensors } = device;
  const { t } = useCommonTranslation('common');
  const { tSensorId } = useSensorIdTranslation();
  const { tDeviceStatus } = useDeviceStatusTranslation();
  const deviceStatusRes = useSubscribeDevicesStatus([{ deviceId, type }]);

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
    if (!sensors) return basicContent;

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
    return contentWithSensors;
  }, [
    deviceStatusRes.error,
    deviceStatusRes.isLoading,
    deviceStatusRes.data,
    name,
    sensors,
    showableSensors,
    sensorValues,
    deviceId,
    tSensorId,
  ]);

  return (
    <>
      {overviewContent.map(({ title, value, type: contentType, isLoading, isDenied }) => (
        <OverviewRow key={title} reverseRowColor>
          <OverviewCell md={4} className={classes.mdDownHidden} />
          <OverviewCell md sm={6} xs={6} value={title} className={classes.sensorItems} />
          {isDenied && (
            <OverviewCell md sm={6} xs={6} className={classes.sensorItems}>
              {contentType === 'status' ? (
                <StatusChip label={t('Unknown')} color="disabled" />
              ) : (
                <AccessDeniedChip />
              )}
            </OverviewCell>
          )}
          {!isDenied &&
            (contentType === 'status' ? (
              <OverviewCell md sm={6} xs={6} className={classes.sensorItems}>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <StatusChip
                    label={isDeviceStatus(value) ? tDeviceStatus(value) : value}
                    color={value === DeviceStatus.ERROR ? 'error' : 'default'}
                  />
                )}
              </OverviewCell>
            ) : (
              <OverviewCell
                md
                sm={6}
                xs={6}
                className={classes.sensorItems}
                value={value?.toString()}
                valueVariant="subtitle2"
              />
            ))}
        </OverviewRow>
      ))}
    </>
  );
};

interface MediaContentProps extends ComponentProps<typeof Grid> {
  device: Omit<PartialDevice, 'status'>;
  imgSrc: string | undefined;
}

const MediaContent: VoidFunctionComponent<MediaContentProps> = ({
  device,
  imgSrc,
  ...props
}: MediaContentProps) => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const { tSensorId } = useSensorIdTranslation();
  const { type } = device;

  return (
    <Grid
      {...props}
      container
      spacing={2}
      className={clsx(classes.gridContainer, props?.className)}
    >
      {type === DeviceType.DISPLAY && (
        <Grid item lg={4} md={4} sm={4} xs={12}>
          {imgSrc && (
            <Snapshot
              src={imgSrc}
              alt={tSensorId(SensorId.DISPLAY_PLAYER_SNAPSHOT)}
              className={classes.snapshot}
            />
          )}
        </Grid>
      )}
      {type === DeviceType.CAMERA && (
        <>
          <Grid item xs={1} sm={1} className={hiddenClasses.mdUpHidden} />
          <Grid item md={imgSrc ? 6 : 12} sm={10} xs={10} className={classes.videoWrapper}>
            <LiveStreamPlayer device={device} roundedCorner enableFullPage />
          </Grid>
          <Grid item xs={1} sm={1} className={hiddenClasses.mdUpHidden} />
          {imgSrc && <Grid item xs={1} sm={1} className={hiddenClasses.mdUpHidden} />}
          <Grid item md={imgSrc ? 6 : 12} sm={10} xs={10}>
            {imgSrc && (
              <Snapshot
                src={imgSrc}
                alt={tSensorId(SensorId.DISPLAY_PLAYER_SNAPSHOT)}
                className={classes.snapshot}
              />
            )}
          </Grid>
          {imgSrc && <Grid item xs={1} sm={1} className={hiddenClasses.mdUpHidden} />}
        </>
      )}
    </Grid>
  );
};

interface MediaOverviewProps extends ComponentProps<typeof Overview> {
  name: string;
  device: Omit<PartialDevice, 'status'>;
  subscribeSensorIds: SensorId[];
  overviewSensors: SensorId[];
  reverseRowColor?: boolean;
  disableHeader?: boolean;
  shrink?: boolean;
}

const MediaOverview: VoidFunctionComponent<MediaOverviewProps> = ({
  name,
  device,
  subscribeSensorIds,
  overviewSensors,
  reverseRowColor = false,
  disableHeader = false,
  shrink = false,
  ...props
}: MediaOverviewProps) => {
  const classes = useStyles();
  const { deviceId, type } = device;

  const showableSensors = useMemo(() => {
    const ownSensorIds = device.sensors ? device.sensors.map(({ sensorId }) => sensorId) : [];
    const subscribeSensorsList = subscribeSensorIds.filter((id) => ownSensorIds.includes(id));
    return new Set(subscribeSensorsList);
  }, [device, subscribeSensorIds]);

  const sensorValues = useSubscribeSensors([device], showableSensors);

  const showableOverviewSensors = useMemo(() => {
    const ownSensorIds = device.sensors ? device.sensors.map(({ sensorId }) => sensorId) : [];
    return overviewSensors.filter((sensorId) => ownSensorIds.includes(sensorId));
  }, [device, overviewSensors]);

  const imgURL = useMemo(() => {
    const sensorValuesById = sensorValues?.[deviceId];
    const sensorValue =
      sensorValuesById?.[SensorId.DISPLAY_PLAYER_SNAPSHOT]?.value ||
      sensorValuesById?.[SensorId.CAMERA_PEDESTRIAN]?.value ||
      sensorValuesById?.[SensorId.CAMERA_VEHICLE]?.value ||
      undefined;
    if (sensorValue) return sensorValue?.toString();
    return undefined;
  }, [deviceId, sensorValues]);

  const imgSrc = useCHTSnapshot(device.groups[0].projectKey, imgURL);

  return (
    <Overview className={classes.root} {...props}>
      {!disableHeader && <OverviewHeader device={device} shrink={shrink} />}
      <OverviewRow className={classes.mediaOverview} spacing={2} reverseRowColor={reverseRowColor}>
        <OverviewCell md={type === DeviceType.CAMERA && !imgSrc ? 8 : 6} sm={12} xs={12}>
          <OverviewContent
            name={name}
            device={device}
            sensorValues={sensorValues}
            showableSensors={showableOverviewSensors}
          />
        </OverviewCell>
        <OverviewCell md={type === DeviceType.CAMERA && !imgSrc ? 4 : 6} sm={12} xs={12}>
          <MediaContent device={device} imgSrc={imgSrc} />
        </OverviewCell>
      </OverviewRow>
    </Overview>
  );
};

export default MediaOverview;
