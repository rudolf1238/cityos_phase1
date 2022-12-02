import { SelectProps as SelectPropsType } from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import clsx from 'clsx';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import { DeviceType, Sensor, SensorType } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';

import {
  GET_GROUP_ON_SENSOR_ID_SELECTOR,
  GetGroupOnSensorIdSelectorPayload,
  GetGroupOnSensorIdSelectorResponse,
} from '../api/getGroupOnSensorIdSelector';
import useAutomationTranslation from '../hooks/useAutomationTranslation';

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: 280,
  },
}));

interface SensorIdSelectorProps
  extends Omit<TextFieldProps, 'select' | 'type' | 'children' | 'value' | 'SelectProps'> {
  value?: string;
  deviceType?: DeviceType;
  deviceIds?: string[];
  SelectProps?: Omit<SelectPropsType, 'displayEmpty' | 'onChange' | 'renderValue'>;
  excludeType?: SensorType;
  onSelectChange: (sensor?: Pick<Sensor, 'sensorId' | 'type' | 'unit'>) => void;
}

const SensorIdSelector: VoidFunctionComponent<SensorIdSelectorProps> = ({
  value,
  deviceType,
  deviceIds,
  disabled,
  SelectProps,
  InputLabelProps,
  excludeType,
  onSelectChange,
  ...props
}: SensorIdSelectorProps) => {
  const { t } = useAutomationTranslation('common');
  const classes = useStyles();
  const {
    userProfile: { divisionGroup },
  } = useStore();

  const { data: getGroupData } = useQuery<
    GetGroupOnSensorIdSelectorResponse,
    GetGroupOnSensorIdSelectorPayload
  >(GET_GROUP_ON_SENSOR_ID_SELECTOR, {
    skip: !divisionGroup?.id || !deviceType || disabled,
    variables: {
      groupId: divisionGroup?.id || '',
      deviceIds,
      deviceType,
    },
    fetchPolicy: 'network-only',
  });

  const onSensorIdChange = useCallback(
    (
      event: ChangeEvent<{
        name?: string | undefined;
        value: unknown;
      }>,
    ) => {
      const newValue = event.target.value;
      if (!isString(newValue) || !getGroupData) {
        onSelectChange(undefined);
        return;
      }

      const targetSensor = getGroupData.getGroup.sensors.find(
        ({ sensorId }) => sensorId === newValue,
      );
      onSelectChange(targetSensor);
    },
    [getGroupData, onSelectChange],
  );

  const sensorIds = useMemo(() => {
    if (!getGroupData) return value ? [value] : [];

    const ids = getGroupData.getGroup.sensors.reduce<string[]>((acc, { type, sensorId }) => {
      if (type !== excludeType) acc.push(sensorId);
      return acc;
    }, []);
    return ids;
  }, [getGroupData, excludeType, value]);

  useEffect(() => {
    if (getGroupData && value && !sensorIds.includes(value)) onSelectChange(undefined);
  }, [value, getGroupData, sensorIds, onSelectChange]);

  return (
    <TextField
      type="text"
      variant="outlined"
      label={t('Sensor ID')}
      value={value || ''}
      select
      fullWidth
      {...props}
      disabled={disabled}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{
        displayEmpty: true,
        onChange: onSensorIdChange,
        renderValue: () => value || '---',
        IconComponent: ExpandMoreRoundedIcon,
        ...SelectProps,
        MenuProps: {
          getContentAnchorEl: null,
          ...SelectProps?.MenuProps,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
            ...SelectProps?.MenuProps?.anchorOrigin,
          },
          PaperProps: {
            variant: 'outlined',
            ...SelectProps?.MenuProps?.PaperProps,
          },
          MenuListProps: {
            ...SelectProps?.MenuProps?.MenuListProps,
            className: clsx(classes.list, SelectProps?.MenuProps?.MenuListProps?.className),
          },
        },
      }}
    >
      {sensorIds.length ? (
        sensorIds.map((sensorId) => (
          <MenuItem key={sensorId} value={sensorId}>
            {sensorId}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>---</MenuItem>
      )}
    </TextField>
  );
};

export default memo(SensorIdSelector);
