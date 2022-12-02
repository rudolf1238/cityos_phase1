import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { DeviceInSearch } from 'city-os-common/libs/schema';

import BaseDeviceSearchField, {
  DevicesSearchFieldProps,
} from 'city-os-common/modules/DevicesSearchField';
import BaseDialog from 'city-os-common/modules/BaseDialog';

import { PartialDevice } from '../../../../libs/type';
import { TempCondition } from './type';
import useAutomationTranslation from '../../../../hooks/useAutomationTranslation';

const useStyles = makeStyles(() => ({
  warningDialog: {
    width: 'min(600px, 90vw)',
    height: 300,
  },

  warningDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
}));

interface DeviceSearchFieldProps extends Omit<DevicesSearchFieldProps, 'onChange'> {
  conditions: TempCondition[];
  onChange: (value: { devices: DeviceInSearch[]; conditions?: TempCondition[] }) => void;
}

const DeviceSearchField: VoidFunctionComponent<DeviceSearchFieldProps> = ({
  conditions,
  onChange,
  ...rest
}: DeviceSearchFieldProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation('automation');

  const [tempDeviceCondition, setTempDeviceCondition] = useState<{
    devices: PartialDevice[];
    conditions: TempCondition[];
  }>();

  const onChangeDevices = useCallback(
    (selectedDevices: DeviceInSearch[]) => {
      const sensorIds = new Set();
      selectedDevices.forEach(({ sensors }) => {
        sensors?.forEach((s) => {
          sensorIds.add(s.sensorId);
        });
      });

      const newConditions = conditions.filter((c) => sensorIds.has(c.sensorId));
      if (newConditions.length === conditions.length) {
        onChange({ devices: selectedDevices });
      } else {
        setTempDeviceCondition({
          devices: selectedDevices,
          conditions: newConditions,
        });
      }
    },
    [conditions, onChange],
  );

  const onDevicesChangeWarningClose = useCallback(() => {
    setTempDeviceCondition(undefined);
  }, []);

  const onDevicesChangeCommitted = useCallback(() => {
    if (tempDeviceCondition) {
      onChange(tempDeviceCondition);
    }
    onDevicesChangeWarningClose();
  }, [tempDeviceCondition, onDevicesChangeWarningClose, onChange]);

  return (
    <>
      <BaseDeviceSearchField onChange={onChangeDevices} {...rest} />
      <BaseDialog
        open={!!tempDeviceCondition}
        onClose={onDevicesChangeWarningClose}
        title={t('Changing the device will remove some settings_')}
        classes={{
          dialog: classes.warningDialog,
          content: classes.warningDialogContent,
        }}
        content={
          <>
            <Typography variant="body1">
              {t(
                'If the newly selected device does not support the sensor ID with the expression, the system will remove that expression_ Are you sure to change the device?',
              )}
            </Typography>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={onDevicesChangeCommitted}
            >
              {t('automation:Yes, change it_')}
            </Button>
          </>
        }
      />
    </>
  );
};

export default memo(DeviceSearchField);
