import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';

import Typography from '@material-ui/core/Typography';

import { SensorType } from 'city-os-common/libs/schema';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import { ActionType, DeviceAction } from '../../libs/type';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import RuleCardBase from './RuleCardBase';
import TriggerSensorSettingDialog from '../RuleManagement/settingDialogs/TriggerSensorSettingDialog';

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.warning.main,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  subtitle: {
    color: theme.palette.grey[500],
  },

  text: {
    color: theme.palette.grey[700],
  },
}));

interface TriggerSensorCardProps {
  index: number;
  deviceAction?: DeviceAction;
  className?: string;
  onChange?: (cardIdx: number, newSetting: DeviceAction) => Promise<void>;
  onDelete?: (cardIdx: number, type?: ActionType) => void;
}

const TriggerSensorCard: VoidFunctionComponent<TriggerSensorCardProps> = ({
  index,
  deviceAction,
  className,
  onChange,
  onDelete,
}: TriggerSensorCardProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['automation', 'common']);
  const { tDevice } = useDeviceTranslation();

  const [openSetting, setOpenSetting] = useState(false);

  const handleDelete = useCallback(
    (cardIdx: number) => {
      if (onDelete) onDelete(cardIdx, ActionType.DEVICE);
    },
    [onDelete],
  );

  const handleOpenSetting = useCallback(() => {
    setOpenSetting(true);
  }, []);

  const handleCloseSettingDialog = useCallback(
    (newSetting?: DeviceAction) => {
      if (newSetting && onChange) void onChange(index, newSetting);
      setOpenSetting(false);
    },
    [index, onChange],
  );

  const unit = useMemo(
    () =>
      deviceAction?.devices
        .flatMap(({ sensors }) => sensors)
        .find(
          (sensor) =>
            sensor?.sensorId === deviceAction.sensorId && sensor?.type === SensorType.GAUGE,
        )?.unit || '',
    [deviceAction],
  );

  return (
    <>
      <RuleCardBase
        index={index}
        title={t('automation:TRIGGER SENSOR')}
        classes={{ root: className, title: classes.title }}
        onEdit={deviceAction && onChange && handleOpenSetting}
        onDelete={deviceAction && onDelete && handleDelete}
        onAdd={!deviceAction && onChange ? handleOpenSetting : undefined}
      >
        {deviceAction && (
          <div className={classes.content}>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('common:Device Type')}
              </Typography>
              <Typography className={classes.text}>{tDevice(deviceAction.deviceType)}</Typography>
            </div>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('automation:Settings')}
              </Typography>
              <Typography
                className={classes.text}
              >{`${deviceAction.sensorId} = ${deviceAction.setValue}${unit}`}</Typography>
            </div>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('common:Device ({{count}})', { count: deviceAction.devices.length })}
              </Typography>
              <Typography component="span" className={classes.text}>
                {deviceAction.devices.map(({ name }) => `${name};`).join(' ')}
              </Typography>
            </div>
          </div>
        )}
      </RuleCardBase>
      {openSetting && (
        <TriggerSensorSettingDialog
          deviceAction={deviceAction}
          onClose={handleCloseSettingDialog}
        />
      )}
    </>
  );
};

export default memo(TriggerSensorCard);
