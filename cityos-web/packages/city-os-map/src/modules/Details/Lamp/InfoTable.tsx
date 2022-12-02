import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import i18n from 'i18next';

import { Group, IDevice, SensorType, SortOrder } from 'city-os-common/libs/schema';
import { SensorSubscriptionResult } from 'city-os-common/hooks/useSubscribeSensors';
import { SingleDeviceResponse } from 'city-os-common/api/getMapDevices';

import NestedTable from 'city-os-common/modules/NestedTable';
import StatusChip from 'city-os-common/modules/StatusChip';

import useMapTranslation from '../../../hooks/useMapTranslation';

const useStyles = makeStyles(() => ({
  root: {
    borderWidth: 0,
    borderRadius: 0,
    maxHeight: '100%',
  },
}));

interface TableRow extends Pick<IDevice, 'deviceId' | 'name' | 'hasLightSensor'> {
  brightness?: number;
  lightSensor?: boolean | null;
  schedule?: boolean | null;
  hasBrightnessSensor: boolean | null;
  groups: Pick<Group, 'id' | 'name' | 'projectKey'>[];
}

interface Sort {
  fieldId: 'deviceId' | 'name';
  type: SortOrder;
}

const sortData = (data: TableRow[], fieldId: Sort['fieldId'], type: Sort['type']) =>
  [...data].sort(
    (a, b) =>
      a[fieldId].localeCompare(b[fieldId], i18n.language) * (type === SortOrder.ASCENDING ? 1 : -1),
  );

interface InfoTableProps {
  devices: SingleDeviceResponse[];
  sensorValues: SensorSubscriptionResult<SensorType> | null;
}

const InfoTable: VoidFunctionComponent<InfoTableProps> = ({
  devices,
  sensorValues,
}: InfoTableProps) => {
  const classes = useStyles();
  const { t } = useMapTranslation(['column', 'common', 'map']);
  const [sort, setSort] = useState<Sort>({ fieldId: 'name', type: SortOrder.ASCENDING });

  const handleSort = useCallback((fieldId: Sort['fieldId'], type: Sort['type']) => {
    setSort({ fieldId, type });
  }, []);

  const tableData = useMemo<TableRow[]>(() => {
    const processedData =
      devices.map(({ deviceId, name, groups, lightSchedule, hasLightSensor, sensors }) => {
        const brightness = sensorValues?.[deviceId]?.brightnessPercent?.value;
        const hasBrightnessSensor = sensors.some(
          ({ sensorId }) => sensorId === 'brightnessPercent',
        );
        return {
          deviceId,
          name,
          brightness: typeof brightness === 'number' ? brightness : undefined,
          groups,
          lightSensor: lightSchedule?.lightSensor?.enableLightSensor,
          schedule: lightSchedule?.manualSchedule?.enableManualSchedule,
          hasLightSensor,
          hasBrightnessSensor,
        };
      }) || [];
    return processedData;
  }, [devices, sensorValues]);

  const sortedData = useMemo(
    () => (sort ? sortData(tableData, sort.fieldId, sort.type) : tableData),
    [sort, tableData],
  );

  return (
    <NestedTable
      disabledSelection
      disableNoDataMessage
      classes={{ container: classes.root }}
      columns={[
        {
          title: t('column:Device ID'),
          field: 'deviceId',
          sort: (sortOrder) => handleSort('deviceId', sortOrder),
        },
        {
          title: t('column:Device Name'),
          field: 'name',
          sort: (sortOrder) => handleSort('name', sortOrder),
        },
        {
          title: t('column:Brightness'),
          render: ({ brightness }) =>
            brightness !== undefined ? `${brightness.toString()}%` : '--',
        },
        {
          title: t('common:Divisions'),
          field: 'groups',
          render: ({ groups }) => groups.map((group) => group.name).join(', '),
        },
        {
          title: t('map:Light Sensor'),
          render: ({
            hasBrightnessSensor,
            hasLightSensor,
            lightSensor,
          }: Pick<TableRow, 'hasBrightnessSensor' | 'hasLightSensor' | 'lightSensor'>) =>
            hasBrightnessSensor && hasLightSensor ? (
              <StatusChip
                label={lightSensor ? 'ENABLE' : 'DISABLE'}
                color={lightSensor ? 'default' : 'disabled'}
              />
            ) : (
              '--'
            ),
        },
        {
          title: t('map:Schedule'),
          render: ({
            hasBrightnessSensor,
            schedule,
          }: Pick<TableRow, 'hasBrightnessSensor' | 'schedule'>) =>
            hasBrightnessSensor ? (
              <StatusChip
                label={schedule ? 'ENABLE' : 'DISABLE'}
                color={schedule ? 'default' : 'disabled'}
              />
            ) : (
              '--'
            ),
        },
      ]}
      data={sortedData}
    />
  );
};

export default InfoTable;
