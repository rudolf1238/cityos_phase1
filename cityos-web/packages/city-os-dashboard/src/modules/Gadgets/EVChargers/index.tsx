import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { Fragment, VoidFunctionComponent, memo, useMemo, useState } from 'react';

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { DeviceType, SensorId } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import useSubscribeSensors from 'city-os-common/hooks/useSubscribeSensors';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { ConfigFormType, EVChargerStatus, GadgetConfig, GadgetSize } from '../../../libs/type';
import {
  SEARCH_DEVICES_ON_DASHBOARD,
  SearchDevicesOnDashboardPayload,
  SearchDevicesOnDashboardResponse,
} from '../../../api/searchDevicesOnDashboard';
import { isEVChargerStatus } from '../../../libs/validators';
import { resubscribeInterval } from '../../../libs/constants';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';
import useEVChargerStatusTranslation from '../../../hooks/useEVChargerStatusTranslation';

import EVChargersConfig from './EVChargersConfig';
import GadgetBase from '../GadgetBase';
import GadgetPieChart from '../../GadgetPieChart';
import ResponsiveTypography from '../../ResponsiveTypography';

const useStyles = makeStyles((theme) => ({
  loading: {
    height: '100%',
  },

  root: {
    flex: 1,
  },

  infoContainer: {
    maxWidth: '100%',
  },

  iconWrapper: {
    margin: 'auto',
    paddingRight: theme.spacing(1),
    maxWidth: 68,
  },

  avatar: {
    backgroundColor: theme.palette.background.light,
  },

  icon: {
    color: theme.palette.info.main,
  },

  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  gridContainer: {
    margin: 0,
    width: '100%',
    maxWidth: '100%',
  },

  record: {
    display: 'flex',
    gap: theme.spacing(0.5),

    '&:nth-of-type(even)': {
      paddingLeft: theme.spacing(1),
    },
  },

  bullet: {
    marginTop: theme.spacing(1),
    borderRadius: '50%',
    minWidth: 10,
    height: 10,
  },

  value: {
    marginTop: theme.spacing(0.8),
    color: theme.palette.gadget.value,
  },

  status: {
    marginTop: theme.spacing(0.9),
  },

  pieWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '100%',

    '& > div': {
      position: 'absolute',
    },
  },
}));

const subscribeSensors = new Set([SensorId.CHARGING_STATUS]);

interface ChargerPieChartProps {
  key: string;
  value: number;
  color?: string;
}

interface EVChargersProps {
  config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DIVISION_LAYOUT>) => void;
}

const EVChargers: VoidFunctionComponent<EVChargersProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: EVChargersProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useDashboardTranslation('dashboard');
  const { tEVChargerStatus } = useEVChargerStatusTranslation();
  const {
    setting: { groupId, size },
  } = config;
  const {
    userProfile: { joinedGroups },
  } = useStore();
  const [updateTime, setUpdateTime] = useState<Date>();

  const { loading, data, error: getDevicesError } = useQuery<
    SearchDevicesOnDashboardResponse,
    SearchDevicesOnDashboardPayload
  >(SEARCH_DEVICES_ON_DASHBOARD, {
    variables: {
      groupId: groupId || '',
      filter: {
        type: DeviceType.CHARGING,
      },
    },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
    pollInterval: resubscribeInterval, // re-query on division-related gadget in case of devices change
  });

  const deviceList = useMemo(
    () =>
      data?.searchDevices.edges.map(({ node }) => ({
        deviceId: node.deviceId,
        sensors: node?.sensors || [],
      })) || [],
    [data?.searchDevices.edges],
  );

  const sensorValues = useSubscribeSensors(deviceList, subscribeSensors);

  const statusColors = useMemo(() => {
    const palette = theme.palette.gadget;
    return {
      [EVChargerStatus.AVAILABLE]: palette.available,
      [EVChargerStatus.CHARGING]: palette.charging,
      [EVChargerStatus.RESERVED]: palette.reserved,
      [EVChargerStatus.ALARM]: palette.alarm,
      [EVChargerStatus.PREPARING]: palette.preparing,
      [EVChargerStatus.UNAVAILABLE]: palette.unavailable,
      [EVChargerStatus.STOP_CHARGING_WITH_GUN_PLUGGED]: palette.stopCharging,
      [EVChargerStatus.OFFLINE]: palette.offline,
    };
  }, [theme.palette.gadget]);

  const statusRecord = useMemo<Record<EVChargerStatus, number>>(() => {
    const initRecord = {
      [EVChargerStatus.AVAILABLE]: 0,
      [EVChargerStatus.CHARGING]: 0,
      [EVChargerStatus.RESERVED]: 0,
      [EVChargerStatus.ALARM]: 0,
      [EVChargerStatus.PREPARING]: 0,
      [EVChargerStatus.UNAVAILABLE]: 0,
      [EVChargerStatus.STOP_CHARGING_WITH_GUN_PLUGGED]: 0,
      [EVChargerStatus.OFFLINE]: 0,
    };
    let newUpdateTime: number | undefined;
    const record = Object.values(sensorValues || {}).reduce((prevRecord, currRecord) => {
      const chargerStatus = currRecord[SensorId.CHARGING_STATUS].value?.toString().toUpperCase();
      const chargerTime = currRecord[SensorId.CHARGING_STATUS].time;
      if (
        newUpdateTime === undefined ||
        (chargerTime !== undefined && chargerTime > newUpdateTime)
      ) {
        newUpdateTime = chargerTime;
      }
      const statusValue = isEVChargerStatus(chargerStatus) ? chargerStatus : null;
      if (statusValue) {
        return { ...prevRecord, [statusValue]: prevRecord[statusValue] + 1 };
      }
      return prevRecord;
    }, initRecord);
    if (newUpdateTime !== undefined) setUpdateTime(new Date(newUpdateTime));
    return record;
  }, [sensorValues]);

  const pieChartData = useMemo(
    () =>
      Object.entries(statusRecord).reduce<ChargerPieChartProps[]>(
        (prevStatusRecord, currStatusRecord) =>
          isEVChargerStatus(currStatusRecord[0])
            ? prevStatusRecord.concat({
                key: tEVChargerStatus(currStatusRecord[0]),
                value: currStatusRecord[1],
                color: statusColors[currStatusRecord[0]],
              })
            : prevStatusRecord,
        [],
      ),
    [statusColors, statusRecord, tEVChargerStatus],
  );

  const total = useMemo(
    () => Object.values(statusRecord).reduce<number>((acc, curr) => acc + curr, 0),
    [statusRecord],
  );

  const divisionName = useMemo(
    () => (groupId && joinedGroups?.find(({ id }) => id === groupId)?.name) || '',
    [groupId, joinedGroups],
  );

  const isForbidden = useMemo(
    () =>
      isGqlError(getDevicesError, ErrorCode.FORBIDDEN) ||
      (!!sensorValues &&
        Object.values(sensorValues).some((record) =>
          isGqlError(record[SensorId.CHARGING_STATUS].error, ErrorCode.FORBIDDEN),
        )),
    [getDevicesError, sensorValues],
  );

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('You don_t have permission to access this division_')}
      updateTime={updateTime}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={EVChargersConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid
          container
          direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
          className={classes.root}
        >
          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 3 : 5}
            sm={size === GadgetSize.SQUARE ? 3 : 4}
            md={size === GadgetSize.SQUARE ? 2 : 5}
            container
            alignItems="center"
            className={classes.infoContainer}
          >
            <Grid item xs={3} className={classes.iconWrapper}>
              <AspectRatio ratio={1} disabledMaxWidth>
                <Avatar className={classes.avatar}>
                  <DeviceIcon
                    type={DeviceType.CHARGING}
                    className={classes.icon}
                    width={30}
                    height={30}
                  />
                </Avatar>
              </AspectRatio>
            </Grid>
            <Grid item xs={5}>
              <ResponsiveTypography
                variant="h2"
                component="span"
                color="primary"
                text={total.toLocaleString('en-US')}
                maxWidth={80}
                maxFontSize={50}
              />
              <Typography variant="overline" color="primary">
                {t('DEVICE', { count: total })}
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.titleWrapper}>
              <Typography variant="h6">{t('EV Chargers')}</Typography>
              <OverflowTooltip title={divisionName}>
                <Typography variant="body1" noWrap>
                  {divisionName}
                </Typography>
              </OverflowTooltip>
            </Grid>
          </Grid>

          <Grid
            item
            xs={size === GadgetSize.SQUARE ? 5 : 3}
            sm={size === GadgetSize.SQUARE ? 5 : 3}
            md={size === GadgetSize.SQUARE ? 6 : 3}
            className={classes.pieWrapper}
          >
            <GadgetPieChart data={pieChartData} />
          </Grid>

          <Grid
            item
            xs={4}
            sm={size === GadgetSize.SQUARE ? 4 : 5}
            md={4}
            container
            alignContent="center"
            className={classes.gridContainer}
          >
            {pieChartData.map(({ key, value, color }) => (
              <Fragment key={key}>
                {size === GadgetSize.SQUARE && <Grid item xs={1} />}
                <Grid item xs={size === GadgetSize.SQUARE ? 5 : 6} className={classes.record}>
                  <div className={classes.bullet} style={{ backgroundColor: color }} />
                  <Typography variant="body2" className={classes.value}>
                    {value}
                  </Typography>
                  <Typography variant="caption" className={classes.status}>
                    {key}
                  </Typography>
                </Grid>
              </Fragment>
            ))}
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(EVChargers);
