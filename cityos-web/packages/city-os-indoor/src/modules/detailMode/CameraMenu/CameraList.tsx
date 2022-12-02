import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { GPSPoint, IDevice } from 'city-os-common/libs/schema';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import CircleCheckbox from 'city-os-common/modules/Checkbox';

import {
  SAVE_LIVE_VIEW_CONFIG,
  SaveLiveViewConfigPayload,
  SaveLiveViewConfigResponse,
} from '../../../api/saveLiveViewConfig';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

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
}));

export interface CameraListProps {
  list: IDevice[];
}

const CameraList: VoidFunctionComponent<CameraListProps> = ({ list }: CameraListProps) => {
  const { t } = useIndoorTranslation(['indoor']);
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const { map, selectedDevices, setSelectedDevices } = useSurveillanceContext();

  const [saveLiveViewConfig] = useMutation<SaveLiveViewConfigResponse, SaveLiveViewConfigPayload>(
    SAVE_LIVE_VIEW_CONFIG,
  );

  const moveMapCenterTo = useCallback(
    (location: GPSPoint) => {
      if (!map || !location) return;
      map.setView(location);
    },
    [map],
  );

  const toggleSelect = useCallback(
    (device: IDevice) => {
      const currSelectedDevices = cloneDeep(selectedDevices);
      const existIndex = selectedDevices.findIndex(({ deviceId }) => deviceId === device.deviceId);
      if (existIndex !== -1) {
        currSelectedDevices.splice(existIndex, 1);
      } else {
        currSelectedDevices.push({ deviceId: device.deviceId, fixedIndex: null });
      }
      void saveLiveViewConfig({
        variables: {
          input: {
            devices: currSelectedDevices,
          },
        },
      });
      if (!isMountedRef.current) return;
      setSelectedDevices(currSelectedDevices);
    },
    [selectedDevices, saveLiveViewConfig, isMountedRef, setSelectedDevices],
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
    <List aria-label={t('Camera List')} className={classes.list}>
      {list?.map((device) => {
        const { deviceId } = device;
        const isSelected = selectedDevices.some(
          (selectedDevice) => selectedDevice.deviceId === deviceId,
        );
        return (
          <ListItem
            key={deviceId}
            classes={{ root: classes.listItem, selected: classes.selected }}
            button
            selected={isSelected}
            onClick={() => {
              handleSelectItems(device);
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
                    toggleSelect(device);
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" className={classes.activeText}>
                  {device.name}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default memo(CameraList);
