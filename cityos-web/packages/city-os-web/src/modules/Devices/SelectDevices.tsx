import { fade, makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import chunk from 'lodash/chunk';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { IDevice, SortField, SortOrder, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import Loading from 'city-os-common/modules/Loading';
import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { ADD_DEVICES, AddDevicesPayload, AddDevicesResponse } from '../../api/addDevices';
import { PartialNode } from '../../api/devicesFromIOT';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  selectDevice: {
    marginTop: theme.spacing(2),
    border: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    maxWidth: `calc(100vw - ${theme.spacing(14)}px)`,
  },

  counter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(3, 5, 3, 10),
  },

  importButton: {
    padding: theme.spacing(2, 5),
    width: theme.spacing(25),
  },

  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },

  typeIcon: {
    height: theme.spacing(2.5),
    color: theme.palette.info.main,
  },

  desc: {
    width: theme.spacing(30),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  nextButton: {
    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },
}));

interface SelectDevicesProps {
  groupId: string;
  deviceList: Omit<IDevice, 'hasLightSensor' | 'lightSchedule' | 'related'>[];
  backLink?: string;
}

interface RowData extends PartialNode {
  key: string;
}

const rowSorting = (field: SortField, order: SortOrder, rows: RowData[]) => {
  if (!rows) return [];
  if (rows.length < 2) return rows;
  const sortedRows = rows.sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case SortField.ID:
        comparison = a.deviceId > b.deviceId ? 1 : -1;
        break;
      case SortField.NAME:
        comparison = a.name > b.name ? 1 : -1;
        break;
      case SortField.TYPE:
        comparison = a.type > b.type ? 1 : -1;
        break;
      default:
        comparison = 0;
    }
    return comparison * (order === SortOrder.ASCENDING ? 1 : -1);
  });
  return sortedRows;
};

const SelectDevices: VoidFunctionComponent<SelectDevicesProps> = ({
  groupId,
  deviceList,
  backLink,
}: SelectDevicesProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'column', 'device']);
  const { tDevice } = useDeviceTranslation();
  const router = useRouter();
  const { dispatch } = useStore();
  const isMountedRef = useIsMountedRef();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>(SortField.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASCENDING);

  const deviceListWithKey = useMemo(
    () => (deviceList ? deviceList.map((device) => ({ ...device, key: device.deviceId })) : []),
    [deviceList],
  );

  const [isAllRowsSelected, setIsAllRowsSelected] = useState(true);
  const [selectedRows, setSelectedRows] = useState<RowData[]>(() =>
    isAllRowsSelected ? deviceListWithKey : [],
  );

  const resetSelected = useCallback(() => {
    setSelectedRows([]);
    setPage(0);
  }, []);

  const showError = useCallback(() => {
    dispatch({
      type: ReducerActionType.ShowSnackbar,
      payload: {
        severity: 'error',
        message: t('common:Failed to save_ Please try again_'),
      },
    });
  }, [dispatch, t]);

  const [addDevices, { loading }] = useMutation<AddDevicesResponse, AddDevicesPayload>(
    ADD_DEVICES,
    {
      onCompleted: (data) => {
        if (data.addDevices) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: t('device:The device has been added successfully_', {
                count: selectedRows.length,
              }),
            },
          });
          if (isMountedRef.current) {
            resetSelected();
            void router.push(backLink || subjectRoutes[Subject.DEVICE]);
          }
        } else {
          showError();
        }
      },
      onError: (error) => {
        showError();
        if (D_DEBUG) {
          console.log(error);
        }
      },
    },
  );

  const handleImport = useCallback(async () => {
    if (selectedRows.length === 0) return;
    await addDevices({
      variables: {
        groupId,
        deviceIds: selectedRows.map(({ deviceId }) => deviceId),
      },
    });
  }, [groupId, selectedRows, addDevices]);

  const handleTableSelect = useCallback((currentSelected: RowData[]) => {
    setSelectedRows(currentSelected);
  }, []);

  const renderType = useCallback(
    (rowData: RowData) => (
      <div className={classes.type}>
        <DeviceIcon type={rowData.type} className={classes.typeIcon} />
        {tDevice(rowData.type)}
      </div>
    ),
    [classes, tDevice],
  );

  const renderGroup = useCallback(
    (rowData: RowData) =>
      rowData.groups
        .reduce<string[]>((acc, group) => (group.name ? acc.concat(group.name) : acc), [])
        .join(', '),
    [],
  );

  const renderDesc = useCallback(
    (rowData: RowData) => <div className={classes.desc}>{rowData.desc}</div>,
    [classes],
  );

  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      resetPagination();
    },
    [resetPagination],
  );

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback(
    (field: SortField) => (order: SortOrder): SortOrder => {
      setSortField(field);
      setSortOrder(order);
      return order;
    },
    [],
  );

  const sortedList = useMemo(
    () => rowSorting(sortField, sortOrder, chunk(deviceListWithKey, rowsPerPage)[page]) || [],
    [deviceListWithKey, page, rowsPerPage, sortField, sortOrder],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === deviceListWithKey.length) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows(deviceListWithKey);
  }, [deviceListWithKey, selectedRows.length]);

  useEffect(() => {
    setIsAllRowsSelected(
      deviceListWithKey.length === selectedRows.length && selectedRows.length !== 0,
    );
  }, [deviceListWithKey.length, selectedRows.length]);

  const columns = useMemo<Column<RowData>[]>(
    () => [
      {
        title: t('column:Device ID'),
        field: 'deviceId',
        sort: handleSort(SortField.ID),
      },
      {
        title: t('column:Device Name'),
        field: 'name',
        sort: handleSort(SortField.NAME),
      },
      {
        title: t('common:Type'),
        field: 'type',
        render: renderType,
        sort: handleSort(SortField.TYPE),
      },
      {
        title: t('common:Divisions'),
        render: renderGroup,
      },
      {
        title: t('common:Description'),
        field: 'desc',
        render: renderDesc,
      },
    ],
    [t, renderType, renderGroup, renderDesc, handleSort],
  );

  return (
    <div className={classes.selectDevice}>
      <div className={classes.counter}>
        <Typography variant="h6">
          {t('device:Import {{count}} device_', { count: selectedRows.length })}
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          className={classes.importButton}
          onClick={handleImport}
        >
          {t('device:Import Devices')}
        </Button>
      </div>
      <NestedTable
        columns={columns}
        data={sortedList}
        selectedRows={selectedRows}
        isAllRowsSelected={isAllRowsSelected}
        onSelect={handleTableSelect}
        onSelectAll={handleSelectAll}
        disableNoDataMessage
        keepSelectColumn
        classes={{ container: classes.nestedTable }}
      />
      <ThemeTablePagination
        count={deviceList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        nextIconButtonProps={{ className: classes.nextButton }}
      />
      <Loading open={loading} />
    </div>
  );
};

export default SelectDevices;
