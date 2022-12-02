import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import capitalize from 'lodash/capitalize';
import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import {
  AgeGroup,
  CameraEventSortField,
  RecognitionType,
  SortOrder,
  ageGroup,
} from 'city-os-common/libs/schema';
import {
  CAMERA_EVENT_HISTORY,
  CameraEventHistoryPayload,
  CameraEventHistoryResponse,
} from 'city-os-common/api/cameraEventHistory';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import { isGender } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import formatDate from 'city-os-common/libs/formatDate';
import useAgeGroupTranslation from 'city-os-common/hooks/useAgeGroupTranslation';
import useGenderTranslation from 'city-os-common/hooks/useGenderTranslation';

import GenderIcon from 'city-os-common/modules/GenderIcon';
import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeTablePagination from 'city-os-common/modules/ThemeTablePagination';

import { CarModel, Color, FiltersData } from '../../libs/type';
import { defaultColors } from '../../libs/constants';
import { isAgeGroup, isCarModel, isColor } from '../../libs/validators';
import useCarModelTranslation from '../../hooks/useCarModelTranslation';
import useColorTranslation from '../../hooks/useColorTranslation';
import useEventsTranslation from '../../hooks/useEventsTranslation';

import AdultIcon from '../../assets/icon/adult.svg';
import CarIcon from '../../assets/icon/car.svg';
import ChildIcon from '../../assets/icon/child.svg';
import EventSnapshot from './EventSnapshot';
import LocationIcon from '../../assets/icon/location.svg';
import MotorIcon from '../../assets/icon/motor.svg';
import SeniorIcon from '../../assets/icon/senior.svg';
import TruckIcon from '../../assets/icon/truck.svg';
import YouthIcon from '../../assets/icon/youth.svg';

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

  detectedResult: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },

  maleIcon: {
    color: theme.palette.gadget.male,
  },

  femaleIcon: {
    color: theme.palette.gadget.female,
  },

  vehicleIcon: {
    color: theme.palette.events.traffic,
  },

  childIcon: {
    color: theme.palette.warning.main,
  },

  youthIcon: {
    color: theme.palette.success.main,
  },

  adultIcon: {
    color: theme.palette.gadget.revenue,
  },

  seniorIcon: {
    color: fade(theme.palette.gadget.contrastText, 0.5),
  },

  colorBullet: {
    borderRadius: theme.shape.borderRadius * 0.25,
    width: 12,
    height: 12,
  },

  white: {
    border: `1px solid ${fade(theme.palette.gadget.contrastText, 0.5)}`,
  },
}));

type RecognitionTableType =
  | RecognitionType.CAR_IDENTIFY
  | RecognitionType.HUMAN_SHAPE
  | RecognitionType.HUMAN_FLOW_ADVANCE;

interface BasicRowData {
  key: string;
  name: string;
  snapshotUrl?: string;
  /** Date number in millisecond */
  time: number;
  id: string;
}

interface CarIdentifyRowData extends BasicRowData {
  carModel: string;
  carColor: string;
  plateNumber: string;
}

interface HumanShapeRowData extends BasicRowData {
  humanShapeGender: string;
  clothesColor: string;
}

interface HumanFlowAdvanceRowData extends BasicRowData {
  humanFlowGender: string;
  ageGroup: number | undefined;
}

type RowData<T extends RecognitionTableType> = T extends RecognitionType.CAR_IDENTIFY
  ? CarIdentifyRowData
  : T extends RecognitionType.HUMAN_SHAPE
  ? HumanShapeRowData
  : T extends RecognitionType.HUMAN_FLOW_ADVANCE
  ? HumanFlowAdvanceRowData
  : never;

interface VehicleIconProps {
  vehicleType: CarModel;
}

const VehicleIcon: VoidFunctionComponent<VehicleIconProps> = ({
  vehicleType,
}: VehicleIconProps) => {
  const classes = useStyles();

  switch (vehicleType) {
    case CarModel.MOTOR:
      return <MotorIcon className={classes.vehicleIcon} />;
    case CarModel.TRUCK:
      return <TruckIcon className={classes.vehicleIcon} />;
    default:
      return <CarIcon className={classes.vehicleIcon} />;
  }
};

interface AgeGroupIconProps {
  ageGroup: AgeGroup;
}

const AgeGroupIcon: VoidFunctionComponent<AgeGroupIconProps> = ({
  ageGroup: ageGroupIdx,
}: AgeGroupIconProps) => {
  const classes = useStyles();

  switch (ageGroupIdx) {
    case ageGroup.CHILD:
      return <ChildIcon className={classes.childIcon} />;
    case ageGroup.YOUTH:
      return <YouthIcon className={classes.youthIcon} />;
    case ageGroup.ADULT:
      return <AdultIcon className={classes.adultIcon} />;
    default:
      return <SeniorIcon className={classes.seniorIcon} />;
  }
};

interface RecognitionTableProps {
  filtersData: FiltersData;
  setPreviewDeviceId: (deviceId: string | undefined) => void;
}

const RecognitionTable: VoidFunctionComponent<RecognitionTableProps> = ({
  filtersData,
  setPreviewDeviceId,
}: RecognitionTableProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useEventsTranslation(['column', 'common', 'events']);
  const { tGender } = useGenderTranslation();
  const { tColor } = useColorTranslation();
  const { tCarModel } = useCarModelTranslation();
  const { tAgeGroup } = useAgeGroupTranslation();
  const {
    userProfile: { divisionGroup },
  } = useStore();

  const {
    recognitionType,
    fromDate,
    toDate,
    devices,
    carModel,
    carColor,
    plateNumber,
    humanShapeGender,
    clothesColor,
    humanFlowGender,
    ageGroup: humanAgeGroup,
  } = filtersData;

  const [sortField, setSortField] = useState<CameraEventSortField>(CameraEventSortField.TIME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESCENDING);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [pageVariables, setPageVariables] = useState<{ before?: string; after?: string }>({
    before: undefined,
    after: undefined,
  });

  const deviceIds = useMemo(
    () =>
      devices?.reduce<string[]>((acc, { deviceId }) => (deviceId ? acc.concat(deviceId) : acc), []),
    [devices],
  );

  const { data: eventHistoryData, loading: cameraEventsLoading } = useQuery<
    CameraEventHistoryResponse,
    CameraEventHistoryPayload
  >(CAMERA_EVENT_HISTORY, {
    skip: !divisionGroup?.id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        from: fromDate.getTime(),
        to: toDate.getTime(),
        deviceIds,
        type: recognitionType,
        sortField,
        sortOrder,
        carIdentifyFilterInput: {
          vehicleType: carModel !== 'ALL' ? carModel : null,
          vehicleColor: carColor !== 'ALL' ? carColor : null,
          numberPlate: plateNumber.trim().length > 0 ? plateNumber.trim() : null,
        },
        humanShapeFilterInput: {
          gender: humanShapeGender !== 'ALL' ? humanShapeGender : null,
          clothesColor: clothesColor !== 'ALL' ? clothesColor : null,
        },
        humanFlowAdvanceFilterInput: {
          humanFlowSex: humanFlowGender !== 'ALL' ? humanFlowGender : null,
          humanFlowAge: humanAgeGroup !== 'ALL' ? humanAgeGroup : null,
        },
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
    (field: CameraEventSortField) => (order: SortOrder) => {
      setPage(0);
      setSortField(field);
      setSortOrder(order);
      setPageVariables({ before: undefined, after: undefined });
    },
    [],
  );

  const columns = useMemo(
    () => [
      {
        title: t('column:Device Name'),
        field: 'name',
        textWrap: 'nowrap' as const,
      },
      ...(() => {
        switch (recognitionType) {
          case RecognitionType.CAR_IDENTIFY: {
            const extraColumns: Column<RowData<typeof recognitionType>>[] = [
              {
                title: t('events:Car Model'),
                field: 'carModel',
                sortOrder:
                  sortField === CameraEventSortField.VEHICLE_TYPE ? sortOrder : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.VEHICLE_TYPE),
                render: ({ carModel: vehicleType, ..._props }: RowData<typeof recognitionType>) =>
                  isCarModel(vehicleType) ? (
                    <div className={classes.detectedResult}>
                      <VehicleIcon vehicleType={vehicleType} />
                      <Typography variant="body1">{tCarModel(vehicleType)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">{vehicleType}</Typography>
                  ),
              },
              {
                title: t('events:Color'),
                field: 'carColor',
                sortOrder:
                  sortField === CameraEventSortField.VEHICLE_COLOR
                    ? sortOrder
                    : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.VEHICLE_COLOR),
                render: ({ carColor: color, ..._props }: RowData<typeof recognitionType>) =>
                  isColor(color) ? (
                    <div className={classes.detectedResult}>
                      <div
                        className={clsx(classes.colorBullet, {
                          [classes.white]: color === Color.WHITE,
                        })}
                        style={{ backgroundColor: theme.palette.gadget[defaultColors[color]] }}
                      />
                      <Typography variant="body1">{tColor(color)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">{color}</Typography>
                  ),
              },
              {
                title: capitalize(t('events:Car plate')),
                field: 'plateNumber',
              },
            ];
            return extraColumns;
          }
          case RecognitionType.HUMAN_SHAPE: {
            const extraColumns: Column<RowData<typeof recognitionType>>[] = [
              {
                title: t('column:Gender'),
                field: 'humanShapeGender',
                sortOrder:
                  sortField === CameraEventSortField.GENDER ? sortOrder : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.GENDER),
                render: ({
                  humanShapeGender: gender,
                  ..._props
                }: RowData<typeof recognitionType>) =>
                  isGender(gender) ? (
                    <div className={classes.detectedResult}>
                      <GenderIcon gender={gender} />
                      <Typography variant="body1">{tGender(gender)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">{gender}</Typography>
                  ),
              },
              {
                title: t('column:Clothes Color'),
                field: 'clothesColor',
                sortOrder:
                  sortField === CameraEventSortField.CLOTHES_COLOR
                    ? sortOrder
                    : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.CLOTHES_COLOR),
                render: ({ clothesColor: color, ..._props }: RowData<typeof recognitionType>) =>
                  isColor(color) ? (
                    <div className={classes.detectedResult}>
                      <div
                        className={clsx(classes.colorBullet, {
                          [classes.white]: color === Color.WHITE,
                        })}
                        style={{ backgroundColor: theme.palette.gadget[defaultColors[color]] }}
                      />
                      <Typography variant="body1">{tColor(color)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">{color}</Typography>
                  ),
              },
            ];
            return extraColumns;
          }
          case RecognitionType.HUMAN_FLOW_ADVANCE: {
            const extraColumns: Column<RowData<typeof recognitionType>>[] = [
              {
                title: t('column:Gender'),
                field: 'humanFlowGender',
                sortOrder:
                  sortField === CameraEventSortField.HUMAN_FLOW_SEX
                    ? sortOrder
                    : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.HUMAN_FLOW_SEX),
                render: ({ humanFlowGender: gender, ..._props }: RowData<typeof recognitionType>) =>
                  isGender(gender) ? (
                    <div className={classes.detectedResult}>
                      <GenderIcon gender={gender} />
                      <Typography variant="body1">{tGender(gender)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">{gender}</Typography>
                  ),
              },
              {
                title: t('events:Age Group'),
                field: 'ageGroup',
                sortOrder:
                  sortField === CameraEventSortField.HUMAN_FLOW_AGE
                    ? sortOrder
                    : SortOrder.ASCENDING,
                sort: handleSort(CameraEventSortField.HUMAN_FLOW_AGE),
                render: ({ ageGroup: group, ..._props }: RowData<typeof recognitionType>) =>
                  isAgeGroup(group) ? (
                    <div className={classes.detectedResult}>
                      <AgeGroupIcon ageGroup={group} />
                      <Typography variant="body1">{tAgeGroup(group)}</Typography>
                    </div>
                  ) : (
                    <Typography variant="body1">---</Typography>
                  ),
              },
            ];
            return extraColumns;
          }
          default:
            return [];
        }
      })(),
      {
        title: t('column:Snapshot'),
        field: 'snapshot',
        render: (rowData: BasicRowData) => {
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
        textWrap: 'nowrap' as const,
        sortOrder: sortField === CameraEventSortField.TIME ? sortOrder : SortOrder.ASCENDING,
        sort: handleSort(CameraEventSortField.TIME),
        render: ({ time }: BasicRowData) =>
          formatDate(time, t('variables:dateFormat.common.dateTime')),
      },
      {
        title: t('column:Device ID'),
        field: 'id',
        textWrap: 'nowrap' as const,
        sortOrder: sortField === CameraEventSortField.ID ? sortOrder : SortOrder.ASCENDING,
        sort: handleSort(CameraEventSortField.ID),
      },
      {
        title: t('column:Location'),
        field: 'location',
        render: (rowData: BasicRowData) => (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setPreviewDeviceId(rowData.id);
            }}
          >
            <LocationIcon />
          </IconButton>
        ),
      },
    ],
    [
      sortField,
      sortOrder,
      recognitionType,
      classes.detectedResult,
      classes.colorBullet,
      classes.white,
      theme.palette.gadget,
      t,
      handleSort,
      tCarModel,
      tColor,
      tGender,
      tAgeGroup,
      setPreviewDeviceId,
    ],
  );

  const tableData = useMemo(
    () =>
      cameraEventHistory?.edges?.map(
        ({
          node: {
            deviceId: id,
            deviceName,
            time,
            pedestrian,
            gender,
            clothesColor: humanClothesColor,
            vehicle,
            vehicleType,
            vehicleColor,
            numberPlate,
            humanFlowSex,
            humanFlowAge,
            humanFlowImage,
          },
        }) => {
          let snapshotUrl: string | undefined;
          switch (recognitionType) {
            case RecognitionType.CAR_IDENTIFY:
              snapshotUrl = vehicle || undefined;
              break;
            case RecognitionType.HUMAN_SHAPE:
              snapshotUrl = pedestrian || undefined;
              break;
            case RecognitionType.HUMAN_FLOW_ADVANCE:
              snapshotUrl = humanFlowImage || undefined;
              break;
            default:
              snapshotUrl = undefined;
          }

          return {
            key: uuidv4(),
            name: deviceName,
            snapshotUrl,
            time,
            id,
            carModel: vehicleType || '---',
            carColor: vehicleColor || '---',
            plateNumber: numberPlate || '---',
            humanShapeGender: gender || '---',
            clothesColor: humanClothesColor || '---',
            humanFlowGender: humanFlowSex || '---',
            ageGroup:
              humanFlowAge !== null && humanFlowAge !== undefined && humanFlowAge < 3
                ? humanFlowAge
                : undefined,
          };
        },
      ) || [],
    [cameraEventHistory?.edges, recognitionType],
  );

  useEffect(() => {
    setPage(0);
    setPageVariables({ before: undefined, after: undefined });
  }, [filtersData]);

  return (
    <>
      <NestedTable
        disabledSelection
        columns={columns}
        data={tableData}
        disableNoDataMessage={!cameraEventHistory}
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

export default memo(RecognitionTable);
