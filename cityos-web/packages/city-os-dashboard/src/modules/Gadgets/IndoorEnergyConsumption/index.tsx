import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';

import { ConfigFormType, GadgetConfig, GadgetDeviceInfo } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import HouseIcon from '../../../assets/icon/solar-energy/house.svg';
import IndoorEnergyConsumptionConfig from './IndoorEnergyConsumptionConfig';
import SolarIcon from '../../../assets/icon/solar-energy/solar.svg';
import WiredIcon from '../../../assets/icon/solar-energy/wired.svg';

const useStyles = makeStyles((_theme) => ({
  container: {
    margin: 0,
    width: '100%',

    '& > .MuiGrid-item': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  loading: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface AqiMonitorProps {
  config: GadgetConfig<ConfigFormType.DEVICE_ONLY>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
}

const AqiMonitor: VoidFunctionComponent<AqiMonitorProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onDuplicate,
  onUpdate,
}: AqiMonitorProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { deviceId },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>();

  const {
    data,
    loading,
    error: getDevicesError,
  } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds: [deviceId],
      },
    },
  );

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

  useEffect(() => {
    setUpdateTime(new Date());
  }, [devices]);

  const isForbidden = useMemo(
    () => [getDevicesError].some((err) => isGqlError(err, ErrorCode.FORBIDDEN)),
    [getDevicesError],
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
      ConfigComponent={IndoorEnergyConsumptionConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container className={classes.container} spacing={4}>
          <Grid
            item
            xs={3}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing(0.4),
              marginTop: theme.spacing(2.5),
              paddingLeft: 24,
            }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 500,
                color: theme.palette.pageContainer.title,
                marginBottom: -4,
              }}
            >
              75
            </span>
            <span style={{ fontSize: 14, color: theme.palette.pageContainer.title }}>kWh</span>
            <span
              style={{
                fontSize: 14,
                color:
                  theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                marginLeft: -16,
                marginRight: -16,
              }}
            >
              {t('dashboard:Solar(Now)')}
            </span>
          </Grid>
          <Grid
            item
            xs={9}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                color:
                  theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              }}
            >
              Indoor Energy Consumption
            </span>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing(1.5),
              }}
            >
              <SolarIcon style={{ zIndex: 2 }} />
              <div
                style={{
                  position: 'absolute',
                  marginRight: 90,
                  width: 45,
                  height: '2px',
                  background: `linear-gradient(to right, transparent 50%, ${theme.palette.background.paper} 50%), linear-gradient(to right, #29cb97 0%, #1fcdd8 49%, #25b2ff 100%)`,
                  backgroundSize: `4px 2px, 100% 2px`,
                  zIndex: 1,
                }}
              />
              <HouseIcon style={{ zIndex: 2 }} />
              <div
                style={{
                  position: 'absolute',
                  marginLeft: 90,
                  width: 45,
                  height: '2px',
                  background: `linear-gradient(to right, transparent 50%, ${theme.palette.background.paper} 50%), linear-gradient(to right, #25B2FF 0%, #88A9FF 49%, #FF9800 100%)`,
                  backgroundSize: `4px 2px, 100% 2px`,
                  zIndex: 1,
                }}
              />
              <WiredIcon style={{ zIndex: 2 }} />
            </div>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 48,
                fontSize: 14,
                color: theme.palette.pageContainer.title,
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold' }}>63</span> <span>kW</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>120</span> <span>kW</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>57</span> <span>kW</span>
              </div>
            </div>
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(AqiMonitor);
