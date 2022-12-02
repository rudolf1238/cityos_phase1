import { makeStyles } from '@material-ui/core/styles';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Paper from '@material-ui/core/Paper';

import { RecognitionType } from 'city-os-common/libs/schema';

import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { FiltersData } from '../../libs/type';

import FlowChartTableRow from './FlowChartTableRow';

const useStyles = makeStyles((theme) => ({
  tableContent: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    overflowX: 'auto',
  },

  nextButton: {
    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },
}));

const numTicksRows = 4;
const defaultMaxY = 40;

interface FlowChartTableProps {
  filtersData: Pick<FiltersData, 'fromDate' | 'toDate' | 'recognitionType' | 'devices'>;
}

const FlowChartTable: VoidFunctionComponent<FlowChartTableProps> = ({
  filtersData,
}: FlowChartTableProps) => {
  const classes = useStyles();

  const { fromDate, toDate, recognitionType, devices } = filtersData;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [maxValues, setMaxValues] = useState<Record<string, number>>({});

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleMaxValueChange = useCallback((deviceId: string, newValue: number) => {
    setMaxValues((prev) => ({ ...prev, [deviceId]: newValue }));
  }, []);

  const maxY = useMemo(() => {
    const maxValue = Object.entries(maxValues).reduce((max, [id, value]) => {
      if (devices?.find(({ deviceId }) => deviceId === id) && value > max) {
        return value;
      }
      return max;
    }, 0);
    const step =
      maxValue <= 100
        ? Math.ceil(maxValue / numTicksRows)
        : Math.ceil(maxValue / numTicksRows / 10) * 10;
    return step * numTicksRows || defaultMaxY;
  }, [devices, maxValues]);

  useEffect(() => {
    setMaxValues((prev) => {
      const newMaxValues: Record<string, number> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (devices?.some((device) => device.deviceId === key)) {
          newMaxValues[key] = value;
        }
      });
      return newMaxValues;
    });
  }, [devices, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [filtersData]);

  if (
    devices.length === 0 ||
    (recognitionType !== RecognitionType.CAR_FLOW && recognitionType !== RecognitionType.HUMAN_FLOW)
  ) {
    return null;
  }

  return (
    <>
      <Paper square={false} elevation={0} variant="outlined" className={classes.tableContent}>
        {devices
          .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map(({ deviceId, name, projectKey }) => (
            <FlowChartTableRow
              key={deviceId}
              deviceId={deviceId}
              name={name}
              projectKey={projectKey || null}
              recognitionType={recognitionType}
              start={fromDate.getTime()}
              end={toDate.getTime()}
              maxY={maxY}
              onMaxValueChange={handleMaxValueChange}
            />
          ))}
      </Paper>
      <ThemeTablePagination
        count={devices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        nextIconButtonProps={{ className: classes.nextButton }}
      />
    </>
  );
};

export default memo(FlowChartTable);
