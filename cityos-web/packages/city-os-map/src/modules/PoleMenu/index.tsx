import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  Dispatch,
  SetStateAction,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { DeviceType, IDevice, SortField, SortOrder } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import CircleCheckbox from 'city-os-common/modules/Checkbox';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import InfiniteScroll from 'city-os-common/modules/InfiniteScroll';
import Loading from 'city-os-common/modules/Loading';

import { FilterType, useMapContext } from '../MapProvider';
import {
  SEARCH_DEVICES_ON_MAP_MENU,
  SearchDevicesPayload,
  SearchDevicesResponse,
} from '../../api/searchDevicesOnMapMenu';
import useMapTranslation from '../../hooks/useMapTranslation';

import Filter from './Filter';
import PoleList from './PoleList';
import TitleBar from './TitleBar';

const useStyles = makeStyles((theme) => ({
  poleMenu: {
    zIndex: theme.zIndex.speedDial,
    height: '100%',
  },

  paper: {
    position: 'absolute',
    top: theme.spacing(3),
    left: theme.spacing(3),
    transition: 'all 0.5s ease-in-out',
    zIndex: theme.zIndex.drawer,
    width: theme.spacing(40),
  },

  openMenu: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  menuHeader: {
    padding: theme.spacing(4, 0.75, 2, 2),
  },

  filters: {
    display: 'flex',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },

  selectedList: {
    flexShrink: 0,
    borderBottom: `4px solid ${theme.palette.text.disabled}`,
    maxHeight: theme.spacing(35),
    overflowY: 'auto',
  },

  menuFooter: {
    marginTop: 'auto',

    '& li': {
      backgroundColor: 'transparent',
    },
  },

  list: {
    borderTop: `1px solid ${theme.palette.text.disabled}`,
    padding: theme.spacing(0, 0, 0, 2),
  },

  listItem: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  text: {
    color: theme.palette.text.primary,
  },

  infiniteScroll: {
    flex: 1,
  },
}));

interface SelectAllControllerProps {
  isSelectAll: boolean;
  onChange: () => void;
}

const SelectAllController: VoidFunctionComponent<SelectAllControllerProps> = ({
  isSelectAll,
  onChange,
}: SelectAllControllerProps) => {
  const classes = useStyles();
  const { t } = useMapTranslation('common');

  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <ListItemIcon>
          <CircleCheckbox checked={isSelectAll} onChange={onChange} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" className={classes.text}>
              {t('Select All')}
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
};

interface PoleMenuProps {
  className?: string;
  isSelectAll: boolean;
  setKeyword: Dispatch<SetStateAction<string | undefined>>;
  setFilterType: Dispatch<SetStateAction<FilterType>>;
}

const PoleMenu: VoidFunctionComponent<PoleMenuProps> = ({
  className,
  isSelectAll,
  setKeyword,
  setFilterType,
}: PoleMenuProps) => {
  const { t } = useMapTranslation(['common', 'map']);
  const classes = useStyles();
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const {
    keyword,
    filterType,
    selectedIdList,
    showPoleMenu,
    setShowMore,
    setSelectedIdList,
    setIsSelectAll,
    clearAllSelected,
    setShowPoleMenu,
  } = useMapContext();
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  const { data, loading, fetchMore } = useQuery<SearchDevicesResponse, SearchDevicesPayload>(
    SEARCH_DEVICES_ON_MAP_MENU,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        filter: {
          type: DeviceType.LAMP,
          sortField: SortField.NAME,
          sortOrder: SortOrder.ASCENDING,
          keyword,
          enableSchedule: filterType === FilterType.NO_SCHEDULE ? false : undefined, // undefined would include enable and disable schedule
          isDevicesUnderLampActive: filterType === FilterType.ERROR ? false : undefined, // undefined would include active and error devices on lamp
        },
        size: 20,
      },
      skip: !divisionGroup?.id,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  );

  const deviceList = useMemo<IDevice[]>(
    () => data?.searchDevices.edges.map(({ node }) => node) || [],
    [data],
  );

  const onSearch = useCallback(
    (searchWord) => {
      setKeyword(searchWord);
      clearAllSelected();
    },
    [clearAllSelected, setKeyword],
  );

  const onClearSearch = useCallback(() => {
    setKeyword(undefined);
    clearAllSelected();
  }, [clearAllSelected, setKeyword]);

  const fetchNextPage = useCallback(
    async (after?: string) => {
      let updatedRes: SearchDevicesResponse | undefined;
      await fetchMore({
        variables: { after: after || data?.searchDevices.pageInfo.endCursor },
        updateQuery: (previousQueryResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousQueryResult;
          if (!previousQueryResult.searchDevices) return fetchMoreResult;
          const newResult: SearchDevicesResponse = {
            searchDevices: {
              ...fetchMoreResult.searchDevices,
              edges: [
                ...previousQueryResult.searchDevices.edges,
                ...fetchMoreResult.searchDevices.edges,
              ],
            },
          };
          updatedRes = newResult;
          return newResult;
        },
      });
      return updatedRes;
    },
    [data?.searchDevices, fetchMore],
  );

  const clickCardMenu = useCallback(() => {
    if (downMd) {
      setShowMore(false);
    }
    setShowPoleMenu(true);
  }, [downMd, setShowMore, setShowPoleMenu]);

  const selectAllPoles = useCallback(async () => {
    let newData: SearchDevicesResponse | undefined = data;
    while (newData?.searchDevices.pageInfo.hasNextPage) {
      // eslint-disable-next-line no-await-in-loop
      newData = await fetchNextPage(newData?.searchDevices.pageInfo.endCursor ?? undefined);
    }
    const newDeviceList: IDevice[] = newData?.searchDevices.edges.map(({ node }) => node) || [];
    const selectedIds = new Set(newDeviceList.map(({ deviceId }) => deviceId));
    setSelectedIdList(selectedIds);
  }, [data, fetchNextPage, setSelectedIdList]);

  const toggleSelectAll = useCallback(async () => {
    if (!isSelectAll) {
      setSelectAllLoading(true);
      await selectAllPoles();
      setIsSelectAll(true);
      setSelectAllLoading(false);
      return;
    }
    clearAllSelected();
  }, [isSelectAll, clearAllSelected, selectAllPoles, setIsSelectAll]);

  const handleOnBottomHit = useCallback(async () => {
    if (data?.searchDevices.pageInfo.hasNextPage && !loading) await fetchNextPage();
  }, [data?.searchDevices, loading, fetchNextPage]);

  useEffect(() => {
    clearAllSelected();
  }, [clearAllSelected, divisionGroup]);

  useEffect(() => {
    if (isSelectAll && deviceList.length !== selectedIdList.size) {
      setIsSelectAll(false);
    }
  }, [deviceList.length, isSelectAll, selectedIdList.size, setIsSelectAll]);

  return (
    <div className={className}>
      {showPoleMenu || (
        <Paper className={classes.paper} onClick={clickCardMenu}>
          <TitleBar onClick={clearAllSelected} />
        </Paper>
      )}
      <ExtendablePanel
        size={344}
        open={showPoleMenu}
        disableCollapseButton={!showPoleMenu}
        onToggle={() => setShowPoleMenu(false)}
        PaperProps={{
          elevation: 24,
        }}
        classes={{ root: classes.poleMenu }}
      >
        <div className={classes.openMenu}>
          <div className={classes.menuHeader}>
            <TitleBar onClick={clearAllSelected} />
            <BasicSearchField
              placeholder={t('common:Search')}
              size="small"
              onSearch={onSearch}
              onClear={onClearSearch}
              InputProps={{ margin: 'none' }}
            />
            <div className={classes.filters}>
              <Filter
                type={FilterType.ALL}
                label={t('common:All')}
                isFocus={filterType === FilterType.ALL}
                onClick={() => {
                  clearAllSelected();
                  setFilterType(FilterType.ALL);
                }}
              />
              <Filter
                type={FilterType.ERROR}
                label={t('map:Malfunctioning')}
                isFocus={filterType === FilterType.ERROR}
                onClick={() => {
                  clearAllSelected();
                  setFilterType(FilterType.ERROR);
                }}
              />
              <Filter
                type={FilterType.NO_SCHEDULE}
                label={t('map:No Schedule')}
                isFocus={filterType === FilterType.NO_SCHEDULE}
                onClick={() => {
                  clearAllSelected();
                  setFilterType(FilterType.NO_SCHEDULE);
                }}
              />
            </div>
          </div>
          <InfiniteScroll
            onBottomHit={handleOnBottomHit}
            isLoading={loading}
            hasMoreData={!!data?.searchDevices.pageInfo.hasNextPage}
            className={classes.infiniteScroll}
          >
            <PoleList poleList={deviceList} />
          </InfiniteScroll>
          <div className={classes.menuFooter}>
            <SelectAllController isSelectAll={isSelectAll} onChange={toggleSelectAll} />
          </div>
        </div>
      </ExtendablePanel>
      <Loading open={selectAllLoading} />
    </div>
  );
};

export default memo(PoleMenu);
