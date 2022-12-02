import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceStatus, GPSPoint, IDevice } from 'city-os-common/libs/schema';
import useSubscribeDevicesStatus, {
  SubscribeDevice,
} from 'city-os-common/hooks/useSubscribeDevicesStatus';

import CircleCheckbox from 'city-os-common/modules/Checkbox';

import { useMapContext } from '../MapProvider';
import extractRelatedDevices from '../../libs/extractRelatedDevices';
import useMapTranslation from '../../hooks/useMapTranslation';

const useStyles = makeStyles((theme) => ({
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
  },

  listItem: {
    height: theme.spacing(7),

    '&::after': {
      display: 'none',
    },

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },

  selected: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,
    backgroundColor: `${theme.palette.action.selected} !important`,

    '&:last-child': {
      borderBottom: 0,
    },
  },

  activeText: {
    color: theme.palette.text.primary,
  },

  errorText: {
    color: theme.palette.error.main,
  },
}));

interface PoleListItemProps {
  device: IDevice;
  isSelected: boolean;
  onSelect: (device: IDevice) => void;
  onToggle: (device: IDevice) => void;
}

const PoleListItem: VoidFunctionComponent<PoleListItemProps> = ({
  device,
  isSelected,
  onSelect,
  onToggle,
}: PoleListItemProps) => {
  const classes = useStyles();

  const subscribeDeviceList = useMemo<SubscribeDevice[]>(() => extractRelatedDevices(device), [
    device,
  ]);

  const deviceStatusList = useSubscribeDevicesStatus(subscribeDeviceList);

  const status = useMemo(
    () =>
      deviceStatusList.data.some((deviceOnLamp) => deviceOnLamp.status === DeviceStatus.ERROR)
        ? DeviceStatus.ERROR
        : DeviceStatus.ACTIVE,
    [deviceStatusList],
  );

  return (
    <ListItem
      classes={{ root: classes.listItem, selected: classes.selected }}
      button
      selected={isSelected}
      onClick={() => {
        onSelect(device);
      }}
    >
      <ListItemIcon
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {isSelected && (
          <CircleCheckbox
            checked
            onChange={() => {
              onToggle(device);
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            className={status === DeviceStatus.ERROR ? classes.errorText : classes.activeText}
          >
            {device.name}
          </Typography>
        }
      />
    </ListItem>
  );
};

export interface PoleListProps {
  poleList: IDevice[];
}

const PoleList: VoidFunctionComponent<PoleListProps> = ({ poleList }: PoleListProps) => {
  const { t } = useMapTranslation('map');
  const classes = useStyles();
  const { map, selectedIdList, setSelectedIdList } = useMapContext();

  const moveMapCenterTo = useCallback(
    (location: GPSPoint) => {
      if (!map || !location) return;
      map.setView(location);
    },
    [map],
  );

  const toggleSelect = useCallback(
    (device: IDevice) => {
      setSelectedIdList((value) => {
        const newValue = new Set(value);
        if (newValue.has(device.deviceId)) {
          newValue.delete(device.deviceId);
        } else {
          newValue.add(device.deviceId);
        }
        return newValue;
      });
    },
    [setSelectedIdList],
  );

  const handleSelectItems = useCallback(
    (device: IDevice) => {
      if (device.location) {
        moveMapCenterTo(device.location);
      }
      toggleSelect(device);
    },
    [moveMapCenterTo, toggleSelect],
  );

  return (
    <List aria-label={t('Pole List')} className={classes.list}>
      {poleList?.map((device) => {
        const { deviceId } = device;
        const isSelected = selectedIdList.has(deviceId);
        return (
          <PoleListItem
            key={deviceId}
            device={device}
            isSelected={isSelected}
            onSelect={handleSelectItems}
            onToggle={toggleSelect}
          />
        );
      })}
    </List>
  );
};

export default memo(PoleList);
