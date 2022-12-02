import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, useCallback } from 'react';
import clsx from 'clsx';
import update from 'immutability-helper';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import { IDevice } from 'city-os-common/libs/schema';
import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import Img from 'city-os-common/modules/Img';
// import useCommonTranslation from 'city-os-common/hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    overflow: 'overlay',
    paddingRight: theme.spacing(2.5),
  },

  deviceBox: {
    width: `calc(50% - ${theme.spacing(0.5)}px)`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },

  deviceBoxImage: {
    borderRadius: theme.spacing(1),
    height: 120,
    position: 'relative',
    border: `2px solid ${theme.palette.secondary.main}`,
  },

  deviceBoxImageFallback: {
    border: `2px solid ${theme.palette.secondary.main}`,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deviceBoxImageFallbackIcon: {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '50%',
    width: theme.spacing(5),
    height: theme.spacing(5),
    padding: theme.spacing(1),
    color: '#fff',
  },

  deviceBoxLabel: {
    width: '100%',
    color: theme.palette.text.primary,
    fontSize: 12,
    textAlign: 'center',
  },

  deviceHoverBox: {
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: theme.spacing(1),
    opacity: 0,
    '&:hover': {
      opacity: 1,
    },
    cursor: 'pointer',
  },

  deviceHoverBoxIcon: {
    color: theme.palette.secondary.main,
  },

  isSelectedBorder: {
    border: `2px solid ${theme.palette.primary.main}`,
  },

  isSelectedColor: {
    Color: theme.palette.primary.main,
  },

  isSelectedBGColor: {
    backgroundColor: theme.palette.primary.main,
  },
}));

export type DeviceOption = Pick<IDevice, 'deviceId' | 'name' | 'imageIds' | 'type'>;

interface DeviceSelectorProps {
  deviceList: DeviceOption[];
  selectedDeviceIdList: string[];
  setSelectedDeviceIdList: (selectedLampList: string[]) => void;
}

const DeviceSelector: VoidFunctionComponent<DeviceSelectorProps> = (props: DeviceSelectorProps) => {
  const { deviceList = [], selectedDeviceIdList = [], setSelectedDeviceIdList = () => {} } = props;

  // const { t } = useCommonTranslation('common');
  const classes = useStyles();

  const isSelected = useCallback(
    (deviceId: string): boolean => selectedDeviceIdList.includes(deviceId),
    [selectedDeviceIdList],
  );

  const triggerDevice = useCallback(
    (deviceId: string) => {
      const newSelectedDeviceIdList = isSelected(deviceId)
        ? update(selectedDeviceIdList, { $splice: [[selectedDeviceIdList.indexOf(deviceId), 1]] })
        : update(selectedDeviceIdList, { $push: [deviceId] });
      setSelectedDeviceIdList(newSelectedDeviceIdList);
    },
    [isSelected, selectedDeviceIdList, setSelectedDeviceIdList],
  );

  return (
    <div className={classes.root}>
      {(deviceList || []).map((device) => (
        <div
          key={device.deviceId}
          className={classes.deviceBox}
          onClick={() => triggerDevice(device.deviceId)}
          onKeyDown={() => triggerDevice(device.deviceId)}
          role="button"
          tabIndex={-1}
        >
          <Img
            id={device?.imageIds ? device?.imageIds[0] : ''}
            className={clsx(classes.deviceBoxImage, {
              [classes.isSelectedBorder]: isSelected(device?.deviceId),
            })}
            style={{
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            fallback={
              <div
                className={clsx(classes.deviceBoxImage, classes.deviceBoxImageFallback, {
                  [classes.isSelectedBorder]: isSelected(device?.deviceId),
                })}
              >
                <DeviceIcon
                  type={device?.type}
                  className={clsx(classes.deviceBoxImageFallbackIcon, {
                    [classes.isSelectedBGColor]: isSelected(device?.deviceId),
                  })}
                  style={{ position: 'absolute' }}
                />
                <div className={classes.deviceHoverBox} style={{ position: 'absolute' }}>
                  {isSelected(device?.deviceId) ? (
                    <RemoveIcon
                      className={clsx(classes.deviceHoverBoxIcon, classes.isSelectedColor)}
                    />
                  ) : (
                    <AddIcon className={classes.deviceHoverBoxIcon} />
                  )}
                </div>
              </div>
            }
          >
            <div className={classes.deviceHoverBox}>
              {isSelected(device?.deviceId) ? (
                <RemoveIcon className={clsx(classes.deviceHoverBoxIcon, classes.isSelectedColor)} />
              ) : (
                <AddIcon className={classes.deviceHoverBoxIcon} />
              )}
            </div>
          </Img>
          <span className={classes.deviceBoxLabel}>{device.name}</span>
        </div>
      ))}
    </div>
  );
};

export default DeviceSelector;
