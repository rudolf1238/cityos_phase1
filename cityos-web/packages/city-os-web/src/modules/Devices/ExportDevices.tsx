import { makeStyles } from '@material-ui/core/styles';
import { useApolloClient } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useState } from 'react';
import stringify from 'csv-stringify';

import { Attribute, DeviceType, SortField, SortOrder } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import downloadFile from 'city-os-common/libs/downloadFile';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  PartialNode,
  SEARCH_DEVICES_ON_DEVICE,
  SearchDevicesPayload,
  SearchDevicesResponse,
} from '../../api/searchDevicesOnDevice';
import createCSVwithBOM from '../../libs/createCSVwithBOM';
import getGroupsString from '../../libs/getGroupString';
import useWebTranslation from '../../hooks/useWebTranslation';

import ExportIcon from '../../assets/icon/export.svg';

const getAttributesString = (attributes: Attribute[]) => {
  const resultArr = attributes.map(({ key, value }) => `${key}:${value}`);
  return resultArr.join('; ');
};

const useStyles = makeStyles(() => ({
  exportIcon: {
    fill: 'none',
  },
}));

interface ExportDevicesProps {
  sortField?: SortField;
  sortOrder?: SortOrder;
  filterType?: DeviceType | 'ALL';
  keyword?: string;
  columns: { title: string; field: string }[];
}

const ExportDevices: VoidFunctionComponent<ExportDevicesProps> = ({
  sortField,
  sortOrder,
  filterType = 'ALL',
  keyword,
  columns,
}: ExportDevicesProps) => {
  const { t } = useWebTranslation(['common', 'device']);
  const { tDevice } = useDeviceTranslation();
  const classes = useStyles();
  const {
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();
  const client = useApolloClient();

  const [loading, setLoading] = useState(false);

  const getAllDevices = useCallback(
    async (after?: string) =>
      client.query<SearchDevicesResponse, SearchDevicesPayload>({
        query: SEARCH_DEVICES_ON_DEVICE,
        variables: {
          groupId: divisionGroup?.id || '',
          filter: {
            sortField: sortField && sortOrder ? sortField : undefined,
            sortOrder: sortField && sortOrder ? sortOrder : undefined,
            type: filterType !== 'ALL' ? filterType : undefined,
            keyword,
          },
          after,
        },
      }),
    [client, divisionGroup?.id, filterType, keyword, sortField, sortOrder],
  );

  const handleExport = useCallback(
    (mergedData: PartialNode[]): Promise<void> => {
      const basicColumns = columns.map((col) => ({
        key: col.field,
        header: col.title,
      }));
      const adjustedColumns = [
        ...basicColumns,
        {
          key: 'lat',
          header: t('device:Latitude'),
        },
        {
          key: 'lng',
          header: t('device:Longitude'),
        },
        {
          key: 'attributes',
          header: t('device:Attributes'),
        },
      ];
      const exportData = mergedData.map((rowData) => ({
        ...rowData,
        type: tDevice(rowData.type),
        group: getGroupsString(rowData.groups),
        lat: rowData.location?.lat || '',
        lng: rowData.location?.lng || '',
        attributes: getAttributesString(rowData?.attributes || []),
      }));

      return new Promise((resolve, reject) => {
        stringify(
          exportData,
          {
            columns: adjustedColumns,
            header: true,
          },
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              const file = createCSVwithBOM(output);
              downloadFile(file, 'Device List.csv');
              resolve();
            }
          },
        );
      });
    },
    [columns, tDevice, t],
  );

  const handleOnClick = useCallback(async () => {
    setLoading(true);
    try {
      let endCursor: string | undefined;
      const result = [];
      for (;;) {
        const {
          data: {
            searchDevices: { pageInfo, edges },
          },
          // eslint-disable-next-line no-await-in-loop
        } = await getAllDevices(endCursor);
        result.push(...edges.map(({ node }) => node));
        if (!pageInfo.hasNextPage) {
          break;
        }
        endCursor = pageInfo.endCursor;
      }
      await handleExport(result);
    } catch (error) {
      if (D_DEBUG) console.log(error);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('common:Download failed_ Please try again_'),
        },
      });
    }
    setLoading(false);
  }, [handleExport, getAllDevices, dispatch, t]);

  return (
    <ThemeIconButton
      tooltip={t('common:Export')}
      color="primary"
      variant="contained"
      onClick={handleOnClick}
      disabled={loading}
    >
      <ExportIcon className={classes.exportIcon} />
    </ThemeIconButton>
  );
};

export default ExportDevices;
