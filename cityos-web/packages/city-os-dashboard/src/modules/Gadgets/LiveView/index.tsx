import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';

import Typography from '@material-ui/core/Typography';

import LiveStreamPlayer from 'city-os-common/modules/videoPlayer/LiveStreamPlayer';

import { ConfigFormType, GadgetConfig } from '../../../libs/type';
import {
  GET_DEVICES_ON_DASHBOARD,
  GetDevicesOnDashboardPayload,
  GetDevicesOnDashboardResponse,
} from '../../../api/getDevicesOnDashboard';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import GadgetBase from '../GadgetBase';
import LiveViewConfig from './LiveViewConfig';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1.5),
  },
}));

interface LiveViewProps {
  config: GadgetConfig<ConfigFormType.DEVICE_ONLY>;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDelete: (deleteId: string) => void;
  onUpdate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
  onDuplicate: (config: GadgetConfig<ConfigFormType.DEVICE_ONLY>) => void;
}

const LiveView: VoidFunctionComponent<LiveViewProps> = ({
  config,
  enableDuplicate,
  isDraggable,
  onDelete,
  onUpdate,
  onDuplicate,
}: LiveViewProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');
  const {
    setting: { deviceId },
  } = config;
  const [isForbidden, setIsForbidden] = useState(false);

  const handleForbidden = useCallback((newIsForbidden: boolean) => {
    setIsForbidden(newIsForbidden);
  }, []);

  const { data } = useQuery<GetDevicesOnDashboardResponse, GetDevicesOnDashboardPayload>(
    GET_DEVICES_ON_DASHBOARD,
    {
      variables: {
        deviceIds: [deviceId],
      },
    },
  );

  const name = data?.getDevices?.[0]?.name || data?.getDevices?.[0]?.deviceId || '';

  return (
    <GadgetBase
      config={config}
      isForbidden={isForbidden}
      forbiddenMessage={t('You don_t have permission to access this device_')}
      enableDuplicate={enableDuplicate}
      isDraggable={isDraggable}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      ConfigComponent={LiveViewConfig}
    >
      <div className={classes.container}>
        <LiveStreamPlayer device={{ deviceId }} onForbidden={handleForbidden} />
        <Typography variant="body1" align="center">
          {name}
        </Typography>
      </div>
    </GadgetBase>
  );
};

export default memo(LiveView);
