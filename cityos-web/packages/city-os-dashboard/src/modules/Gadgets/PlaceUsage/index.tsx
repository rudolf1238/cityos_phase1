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
import PlaceUsageConfig from './PlaceUsageConfig';
import PlaceUsagePieChart from './PlaceUsagePieChart';

const useStyles = makeStyles((_theme) => ({
  container: {
    margin: 0,
    width: '100%',
    height: '100%',

    '& > .MuiGrid-item': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  loading: {
    height: '100%',
  },

  pieWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '100%',

    '& > div': {
      position: 'absolute',
    },

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface PlaceUsageProps {
  config: GadgetConfig<ConfigFormType.DEVICES_TITLE>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE>) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICES_TITLE>) => void;
}

const PlaceUsage: VoidFunctionComponent<PlaceUsageProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onDuplicate,
  onUpdate,
}: PlaceUsageProps) => {
  const { t } = useDashboardTranslation(['column', 'dashboard', 'mainLayout']);
  const classes = useStyles();
  const theme = useTheme();
  const {
    setting: { deviceIds, title },
  } = config;
  const [updateTime, setUpdateTime] = useState<Date>();

  const mockData = [
    { key: '0 - 4', value: 37.5, color: '#fbc01f' },
    { key: '4 - 8', value: 37.5, color: '#25b2ff' },
    { key: '8+', value: 25, color: '#29cb97' },
  ];

  const {
    data,
    loading,
    error: getDevicesError,
  } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds,
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
      ConfigComponent={PlaceUsageConfig}
    >
      {loading ? (
        <Grid container justify="center" alignContent="center" className={classes.loading}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container className={classes.container} spacing={4}>
          <Grid
            item
            xs={5}
            className={classes.pieWrapper}
            style={{ paddingBottom: theme.spacing(1) }}
          >
            <PlaceUsagePieChart data={mockData} />
            <span
              style={{
                position: 'absolute',
                fontSize: 30,
                fontWeight: 'bold',
                marginRight: 2,
                marginBottom: 8,
                color: theme.palette.pageContainer.title,
              }}
            >
              6.5
            </span>
            <span
              style={{
                position: 'absolute',
                fontSize: 14,
                fontWeight: 'bold',
                marginLeft: 58,
                marginBottom: 2,
                color:
                  theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              }}
            >
              h
            </span>
            <span
              style={{
                position: 'absolute',
                fontSize: 12,
                marginTop: 43,
                marginLeft: 2,
                color:
                  theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              }}
            >
              Avg.
            </span>
          </Grid>
          <Grid item xs={7}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                justifyContent: ' space-between',
                paddingBottom: theme.spacing(1),
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {title}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color:
                      theme.palette.type === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {t('dashboard:Place Usage')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing(1),
                    width: '60%',
                  }}
                >
                  {mockData.map((item) => (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '80%',
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: theme.spacing(0.5),
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span>{item.key} hours</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing(1),
                    width: '40%',
                  }}
                >
                  {mockData.map((item) => (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '80%',
                      }}
                    >
                      <span>{item.value} %</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      )}
    </GadgetBase>
  );
};

export default memo(PlaceUsage);
