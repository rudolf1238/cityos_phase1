import { useApolloClient } from '@apollo/client';
import React, { VoidFunctionComponent, useCallback, useState } from 'react';
import stringify from 'csv-stringify';

import { SortOrder, UserSortField } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import downloadFile from 'city-os-common/libs/downloadFile';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  PartialNode,
  SEARCH_USERS,
  SearchUsersPayload,
  SearchUsersResponse,
} from '../../api/searchUsers';
import createCSVwithBOM from '../../libs/createCSVwithBOM';
import getGroupsString from '../../libs/getGroupString';
import useWebTranslation from '../../hooks/useWebTranslation';

import ExportIcon from '../../assets/icon/export.svg';

interface ExportUsersProps {
  userSortField?: UserSortField;
  sortOrder?: SortOrder;
  keyword?: string;
  columns: { title: string; field: string }[];
}

const ExportUsers: VoidFunctionComponent<ExportUsersProps> = ({
  userSortField,
  sortOrder,
  keyword,
  columns,
}: ExportUsersProps) => {
  const { t } = useWebTranslation('common');

  const {
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();
  const client = useApolloClient();

  const [loading, setLoading] = useState(false);

  const getAllUsers = useCallback(
    async (after?: string) =>
      client.query<SearchUsersResponse, SearchUsersPayload>({
        query: SEARCH_USERS,
        variables: {
          groupId: divisionGroup?.id || '',
          filter: {
            userSortField: userSortField && sortOrder ? userSortField : undefined,
            sortOrder: userSortField && sortOrder ? sortOrder : undefined,
            keyword,
          },
          after,
        },
      }),
    [client, divisionGroup?.id, userSortField, sortOrder, keyword],
  );

  const handleError = useCallback(
    (error) => {
      if (D_DEBUG) console.log(error);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('Download failed_ Please try again_'),
        },
      });
    },
    [dispatch, t],
  );

  const handleExport = useCallback(
    (mergedData: PartialNode[]) => {
      const adjustedColumns = columns.map((col) => ({
        key: col.field,
        header: col.title,
      }));
      adjustedColumns.push({
        key: 'group',
        header: t('Divisions'),
      });
      const exportData = mergedData.map((rowData) => ({
        ...rowData,
        group: getGroupsString(rowData.groups.map(({ group }) => group)),
      }));

      stringify(
        exportData,
        {
          columns: adjustedColumns,
          header: true,
        },
        (err, output) => {
          if (err) {
            handleError(err);
          } else {
            const file = createCSVwithBOM(output);
            downloadFile(file, 'User List.csv');
          }
        },
      );
    },
    [columns, handleError, t],
  );

  const handleOnClick = useCallback(async () => {
    setLoading(true);
    const result: {
      pageInfo: { hasNextPage: boolean; endCursor: string | undefined };
      mergedData: PartialNode[];
      isError: boolean;
    } = {
      pageInfo: {
        hasNextPage: true,
        endCursor: undefined,
      },
      mergedData: [],
      isError: false,
    };

    while (result.pageInfo.hasNextPage && !result.isError) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await getAllUsers(result.pageInfo.endCursor);
        result.pageInfo = data.searchUsers.pageInfo;
        result.mergedData = [
          ...result.mergedData,
          ...data.searchUsers.edges.map(({ node }) => node),
        ];
      } catch (error) {
        result.isError = true;
        handleError(error);
      }
    }
    if (!result.isError) handleExport(result.mergedData);
    setLoading(false);
  }, [getAllUsers, handleExport, handleError]);

  return (
    <ThemeIconButton
      tooltip={t('Export')}
      color="primary"
      variant="contained"
      onClick={handleOnClick}
      disabled={loading}
    >
      <ExportIcon />
    </ThemeIconButton>
  );
};

export default ExportUsers;
