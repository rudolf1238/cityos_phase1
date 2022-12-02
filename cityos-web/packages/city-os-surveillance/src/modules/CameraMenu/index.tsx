import { fade, makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  Dispatch,
  SetStateAction,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceType, IDevice, SortField, SortOrder } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import CircleCheckbox from 'city-os-common/modules/Checkbox';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import InfiniteScroll from 'city-os-common/modules/InfiniteScroll';
import Loading from 'city-os-common/modules/Loading';

import {
  SEARCH_DEVICES_ON_SURVEILLANCE_MENU,
  SearchDevicesPayload,
  SearchDevicesResponse,
} from '../../api/searchDevicesOnSurveillanceMenu';
import { useSurveillanceContext } from '../SurveillanceProvider';
import useSurveillanceTranslation from '../../hooks/useSurveillanceTranslation';

import CameraList from './CameraList';

const useStyles = makeStyles((theme) => ({
  panel: {
    zIndex: theme.zIndex.speedDial,
    height: '100%',
  },

  toggle: {
    top: theme.spacing(5),
  },

  paper: {
    position: 'absolute',
    top: theme.spacing(3),
    left: theme.spacing(3),
    transition: 'all 0.5s ease-in-out',
    zIndex: theme.zIndex.drawer,
    width: 320,
  },

  openMenu: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  menuHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2, 2),
  },

  searchField: {
    width: '100%',
  },

  menuFooter: {
    marginTop: 'auto',
    paddingTop: 0,
    paddingBottom: 0,

    '& li': {
      backgroundColor: 'transparent',
    },
  },

  listItem: {
    '&:hover': {
      backgroundColor: 'transparent',
    },

    '&:last-child': {
      borderTop: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    },
  },

  text: {
    color: theme.palette.text.primary,
  },

  infiniteScroll: {
    flex: 1,
  },
}));

interface CameraMenuProps {
  showCameraMenu: boolean;
  setKeyword: (keyword: string | null) => void;
  setShowCameraMenu: Dispatch<SetStateAction<boolean>>;
}

const CameraMenu: VoidFunctionComponent<CameraMenuProps> = ({
  showCameraMenu,
  setKeyword,
  setShowCameraMenu,
}: CameraMenuProps) => {
  const { t } = useSurveillanceTranslation('common');
  const classes = useStyles();
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const {
    keyword,
    selectedDevices,
    setSelectedDevices,
    clearAllSelected,
    setIsUpdating,
  } = useSurveillanceContext();
  const isMountedRef = useIsMountedRef();
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  const { data, loading, fetchMore } = useQuery<SearchDevicesResponse, SearchDevicesPayload>(
    SEARCH_DEVICES_ON_SURVEILLANCE_MENU,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        filter: {
          type: DeviceType.CAMERA,
          sortField: SortField.NAME,
          sortOrder: SortOrder.ASCENDING,
          keyword: keyword ?? undefined,
        },
        size: 20,
      },
      skip: !divisionGroup?.id,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  );

  const cameraList = useMemo<IDevice[]>(
    () => data?.searchDevices.edges.map(({ node }) => node) || [],
    [data],
  );

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
  }, [setKeyword]);

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

  const selectAllPoles = useCallback(async () => {
    let newData: SearchDevicesResponse | undefined = data;
    while (newData?.searchDevices.pageInfo.hasNextPage) {
      // eslint-disable-next-line no-await-in-loop
      newData = await fetchNextPage(newData?.searchDevices.pageInfo.endCursor ?? undefined);
      if (!isMountedRef.current) return;
    }
    const newCameraList: IDevice[] = newData?.searchDevices.edges.map(({ node }) => node) || [];
    const newSelectedDevices = newCameraList.map(({ deviceId }) => ({
      deviceId,
      fixedIndex: null,
    }));
    setSelectedDevices(newSelectedDevices);
    setIsUpdating(true);
  }, [data, setSelectedDevices, setIsUpdating, fetchNextPage, isMountedRef]);

  const isSelectAll = useMemo(
    () =>
      cameraList.every(({ deviceId }) =>
        selectedDevices.some((selectedDevice) => selectedDevice.deviceId === deviceId),
      ),
    [cameraList, selectedDevices],
  );

  const toggleSelectAll = useCallback(async () => {
    if (!isSelectAll) {
      setSelectAllLoading(true);
      await selectAllPoles();
      if (isMountedRef.current) {
        setSelectAllLoading(false);
      }
      return;
    }
    clearAllSelected();
  }, [isSelectAll, clearAllSelected, selectAllPoles, isMountedRef]);

  const handleOnBottomHit = useCallback(async () => {
    if (data?.searchDevices.pageInfo.hasNextPage && !loading) await fetchNextPage();
  }, [data?.searchDevices, loading, fetchNextPage]);

  return (
    <div>
      <ExtendablePanel
        size={344}
        open={showCameraMenu}
        onToggle={() => setShowCameraMenu(false)}
        PaperProps={{
          elevation: 24,
        }}
        classes={{ root: classes.panel, toggle: classes.toggle }}
      >
        <div className={classes.openMenu}>
          <div className={classes.menuHeader}>
            <DivisionSelector />
            <BasicSearchField
              placeholder={t('Search')}
              size="small"
              onSearch={setKeyword}
              onClear={handleClearSearch}
              InputProps={{ margin: 'none' }}
              className={classes.searchField}
            />
          </div>
          <InfiniteScroll
            onBottomHit={handleOnBottomHit}
            isLoading={loading}
            hasMoreData={!!data?.searchDevices.pageInfo.hasNextPage}
            className={classes.infiniteScroll}
          >
            <CameraList list={cameraList} />
          </InfiniteScroll>
          <List className={classes.menuFooter}>
            <ListItem className={classes.listItem}>
              <ListItemIcon>
                <CircleCheckbox checked={isSelectAll} onChange={toggleSelectAll} />
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
        </div>
      </ExtendablePanel>
      <Loading open={selectAllLoading} />
    </div>
  );
};

export default memo(CameraMenu);
