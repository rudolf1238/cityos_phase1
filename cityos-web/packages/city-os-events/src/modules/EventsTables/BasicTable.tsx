import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import {
  CAMERA_EVENT_HISTORY,
  CameraEventHistoryPayload,
  CameraEventHistoryResponse,
} from 'city-os-common/api/cameraEventHistory';
import {
  CameraEventSortField,
  RecognitionType,
  SortOrder,
  Subject,
} from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { isGender, isSortOrder } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import formatDate from 'city-os-common/libs/formatDate';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useAgeGroupTranslation from 'city-os-common/hooks/useAgeGroupTranslation';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useGenderTranslation from 'city-os-common/hooks/useGenderTranslation';

import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { FiltersData, Query } from '../../libs/type';
import { isAgeGroup, isCameraEventSortField, isCarModel, isColor } from '../../libs/validators';
import useCarModelTranslation from '../../hooks/useCarModelTranslation';
import useColorTranslation from '../../hooks/useColorTranslation';
import useEventsTranslation from '../../hooks/useEventsTranslation';
import useRecognitionTypeTranslation from '../../hooks/useRecognitionTypeTranslation';

import EventSnapshot from './EventSnapshot';
import LocationIcon from '../../assets/icon/location.svg';

const useStyles = makeStyles((theme) => ({
  nestedTable: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },

  row: {
    '& > div:nth-of-type(1)': {
      paddingLeft: theme.spacing(4),
    },
  },

  loading: {
    marginTop: theme.spacing(10),
  },
}));

interface CustomColumn<T> extends Omit<Column<T>, 'field'> {
  field: string;
}

interface RowData {
  key: string;
  name: string;
  type: RecognitionType;
  detectedResult?: string;
  snapshotUrl?: string;
  /** Date number in millisecond */
  time: number;
  id: string;
}

interface BasicTableProps {
  filtersData: Pick<FiltersData, 'fromDate' | 'toDate'>;
  setPreviewDeviceId: (deviceId: string | undefined) => void;
}

const BasicTable: VoidFunctionComponent<BasicTableProps> = ({
  filtersData: { fromDate, toDate },
  setPreviewDeviceId,
}: BasicTableProps) => {
  const classes = useStyles();
  const router = useRouter();
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.IVS_EVENTS]);

  const { t } = useEventsTranslation(['column', 'variables', 'events']);
  const { tAgeGroup } = useAgeGroupTranslation();
  const { tCarModel } = useCarModelTranslation();
  const { tColor } = useColorTranslation();
  const { tGender } = useGenderTranslation();
  const { tRecognitionType } = useRecognitionTypeTranslation();
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const sortField = isCameraEventSortField(router.query.sortBy)
    ? router.query.sortBy
    : CameraEventSortField.TIME;
  const sortOrder = isSortOrder(router.query.order) ? router.query.order : SortOrder.DESCENDING;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [pageVariables, setPageVariables] = useState<{ before?: string; after?: string }>({
    before: undefined,
    after: undefined,
  });

  const { data: eventHistoryData, loading: cameraEventsLoading } = useQuery<
    CameraEventHistoryResponse,
    CameraEventHistoryPayload
  >(CAMERA_EVENT_HISTORY, {
    skip: !permissionGroup?.group?.id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {
      groupId: permissionGroup?.group?.id || '',
      filter: {
        from: fromDate.getTime(),
        to: toDate.getTime(),
        sortField,
        sortOrder,
      },
      ...pageVariables,
      size: rowsPerPage,
    },
  });

  const cameraEventHistory = eventHistoryData?.cameraEventHistory;

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setPageVariables({ before: undefined, after: undefined });
  }, []);

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      if (!eventHistoryData) return;
      const { endCursor, beforeCursor } = eventHistoryData.cameraEventHistory.pageInfo;
      const before = newPage < page && beforeCursor ? beforeCursor : undefined;
      const after = newPage > page && endCursor ? endCursor : undefined;
      setPage(before || after ? newPage : 0);
      setPageVariables({ before, after });
    },
    [page, eventHistoryData],
  );

  const handleSort = useCallback(
    (newSortField: CameraEventSortField) => (newSortOrder: SortOrder) => {
      changeRoute({
        sortBy: newSortField,
        order: newSortOrder,
      });
      setPage(0);
      setPageVariables({ before: undefined, after: undefined });
    },
    [changeRoute],
  );

  const tableData = useMemo<RowData[]>(
    () =>
      cameraEventHistory?.edges?.map(
        ({
          node: {
            deviceId: id,
            deviceName,
            time,
            type: recognitionType,
            pedestrian,
            gender,
            clothesColor,
            vehicle,
            vehicleType,
            vehicleColor,
            numberPlate,
            humanFlowSex,
            humanFlowAge,
            humanFlowImage,
          },
        }) => {
          let detectedItems: (string | null | undefined)[];
          let snapshotUrl: string | undefined;
          switch (recognitionType) {
            case RecognitionType.HUMAN_SHAPE: {
              const genderText = isGender(gender) ? tGender(gender) : gender;
              const colorText = isColor(clothesColor) ? tColor(clothesColor) : clothesColor;
              detectedItems = [genderText, colorText];
              snapshotUrl = pedestrian || undefined;
              break;
            }
            case RecognitionType.CAR_IDENTIFY: {
              const carModelText = isCarModel(vehicleType) ? tCarModel(vehicleType) : vehicleType;
              const colorText = isColor(vehicleColor) ? tColor(vehicleColor) : vehicleColor;
              detectedItems = [carModelText, colorText, numberPlate];
              snapshotUrl = vehicle || undefined;
              break;
            }
            case RecognitionType.HUMAN_FLOW_ADVANCE: {
              const genderText = isGender(humanFlowSex) ? tGender(humanFlowSex) : humanFlowSex;
              const ageText = isAgeGroup(humanFlowAge) ? tAgeGroup(humanFlowAge) : '';
              detectedItems = [genderText, ageText];
              snapshotUrl = humanFlowImage || undefined;
              break;
            }
            default:
              detectedItems = [];
              snapshotUrl = undefined;
              break;
          }
          const detectedResult = detectedItems
            .map((item) => item && item.trim())
            .filter((item) => item)
            .join(', ');

          return {
            key: uuidv4(),
            name: deviceName,
            type: recognitionType,
            detectedResult: detectedResult.length > 0 ? detectedResult : '---',
            snapshotUrl,
            time,
            id,
          };
        },
      ) || [],
    [cameraEventHistory?.edges, tAgeGroup, tCarModel, tColor, tGender],
  );

  const columns = useMemo<CustomColumn<RowData>[]>(
    () => [
      {
        title: t('column:Device Name'),
        field: 'name',
        textWrap: 'nowrap',
      },
      {
        title: t('events:Camera Type'),
        field: 'type',
        textWrap: 'nowrap',
        sortOrder:
          sortField === CameraEventSortField.RECOGNITION_TYPE ? sortOrder : SortOrder.ASCENDING,
        sort: handleSort(CameraEventSortField.RECOGNITION_TYPE),
        render: (rowData: RowData) => tRecognitionType(rowData.type),
      },
      {
        title: t('events:Detected Result'),
        field: 'detectedResult',
        textWrap: 'nowrap',
      },
      {
        title: t('column:Snapshot'),
        field: 'snapshot',
        render: (rowData: RowData) => {
          const { id, time, name, snapshotUrl } = rowData;
          return (
            <EventSnapshot
              device={{ deviceId: id, name }}
              initialTime={time}
              url={snapshotUrl}
              alt={t('events:Snapshot of {{name}} at {{time}}', {
                name,
                time: formatDate(time, t('variables:dateFormat.common.dateTime')),
              })}
            />
          );
        },
      },
      {
        title: t('events:Datetime'),
        field: 'datetime',
        textWrap: 'nowrap',
        sortOrder: sortField === CameraEventSortField.TIME ? sortOrder : SortOrder.ASCENDING,
        sort: handleSort(CameraEventSortField.TIME),
        render: ({ time }: RowData) => formatDate(time, t('variables:dateFormat.common.dateTime')),
      },
      {
        title: t('column:Device ID'),
        field: 'id',
        textWrap: 'nowrap',
        sortOrder: sortField === CameraEventSortField.ID ? sortOrder : SortOrder.ASCENDING,
        sort: handleSort(CameraEventSortField.ID),
      },
      {
        title: t('column:Location'),
        field: 'location',
        render: (rowData: RowData) => (
          <ThemeIconButton
            color="primary"
            size="small"
            variant="standard"
            tooltip={t('column:Location')}
            onClick={() => {
              setPreviewDeviceId(rowData.id);
            }}
          >
            <LocationIcon />
          </ThemeIconButton>
        ),
      },
    ],
    [sortField, sortOrder, handleSort, setPreviewDeviceId, t, tRecognitionType],
  );

  return (
    <>
      <NestedTable
        disabledSelection
        columns={columns}
        data={tableData}
        disableNoDataMessage={!cameraEventHistory}
        noDataMessage={t('events:No data in the last 24 hours_')}
        classes={{
          container:
            cameraEventHistory && cameraEventHistory.totalCount > 0
              ? classes.nestedTable
              : undefined,
          row: classes.row,
        }}
      />
      {!cameraEventHistory && cameraEventsLoading && (
        <CircularProgress className={classes.loading} />
      )}
      {cameraEventHistory && cameraEventHistory.totalCount > 0 && (
        <ThemeTablePagination
          count={cameraEventHistory.totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </>
  );
};

export default memo(BasicTable);
