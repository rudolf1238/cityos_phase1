import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, {
  RefObject,
  UIEventHandler,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import CircularProgress from '@material-ui/core/CircularProgress';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { DeviceFilter, DeviceInSearch } from '../libs/schema';
import {
  SEARCH_DEVICES_ON_DEVICES_SEARCH,
  SearchDevicesOnDevicesSearchPayload,
  SearchDevicesOnDevicesSearchResponse,
} from '../api/searchDevicesOnDevicesSearch';
import { useStore } from '../reducers';
import useCommonTranslation from '../hooks/useCommonTranslation';
import useIsMountedRef from '../hooks/useIsMountedRef';

import BasicSearchField from './BasicSearchField';
import CameraIcon from '../assets/icon/camera.svg';
import CircleCheckbox from './Checkbox';

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    cursor: 'pointer',
    paddingRight: theme.spacing(1),
  },

  input: {
    textAlign: 'left',
  },

  paper: {
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: 320,
    minHeight: 112,
  },

  menuHeader: {
    position: 'absolute',
    top: 0,
    zIndex: theme.zIndex.drawer,
    width: '100%',
  },

  menuBody: {
    marginTop: theme.spacing(13.75),
    maxHeight: 170,
    overflowY: 'auto',
  },

  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },

  menuItem: {
    padding: 0,
  },

  itemContainer: {
    padding: theme.spacing(2, 3),
  },

  selectedItem: {
    '&.MuiListItem-button.Mui-selected': {
      backgroundColor: 'transparent',
    },
  },

  searchField: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,

    '& > fieldset.MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent !important',
    },

    '& .MuiIconButton-root': {
      color: theme.palette.primary.main,
    },
  },

  selectAllItem: {
    borderTop: `1px solid ${theme.palette.grey[50]}`,
    borderBottom: `1px solid ${theme.palette.grey[50]}`,
  },

  cameraIcon: {
    color: theme.palette.gadget.reserved,
  },
}));

const isBottom = (scrollRef: RefObject<HTMLDivElement>) =>
  scrollRef.current &&
  scrollRef.current.scrollTop + scrollRef.current.clientHeight + 200 >=
    scrollRef.current.scrollHeight;

const mergeSearchDevices = (
  previousQueryResult: SearchDevicesOnDevicesSearchResponse,
  fetchMoreResult: SearchDevicesOnDevicesSearchResponse | undefined,
) => {
  if (!fetchMoreResult) return previousQueryResult;
  if (!previousQueryResult.searchDevices) return fetchMoreResult;
  return {
    searchDevices: {
      ...fetchMoreResult.searchDevices,
      edges: [...previousQueryResult.searchDevices.edges, ...fetchMoreResult.searchDevices.edges],
    },
  };
};

export interface DevicesSearchFieldProps {
  deviceFilter?: Pick<DeviceFilter, 'type' | 'attribute'>;
  label?: string;
  value: DeviceInSearch[];
  disabled?: boolean;
  className?: string;
  onChange: (devices: DeviceInSearch[]) => void;
}

const DevicesSearchField: VoidFunctionComponent<DevicesSearchFieldProps> = ({
  deviceFilter = {},
  label,
  value: selectedDevices,
  disabled,
  className,
  onChange,
}: DevicesSearchFieldProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const {
    userProfile: { divisionGroup },
  } = useStore();

  const isMountedRef = useIsMountedRef();
  const menuToggleRef = useRef(null);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [isSelectedFetching, setIsSelectedFetching] = useState(true);

  const { data, fetchMore, loading } = useQuery<
    SearchDevicesOnDevicesSearchResponse,
    SearchDevicesOnDevicesSearchPayload
  >(SEARCH_DEVICES_ON_DEVICES_SEARCH, {
    skip: !divisionGroup?.id || disabled,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        keyword: keyword || '',
        ...deviceFilter,
      },
      size: 20,
    },
    onCompleted: ({ searchDevices: { pageInfo, edges } }) => {
      const deviceIds = new Set(edges.map(({ node: { deviceId } }) => deviceId));
      if (
        pageInfo.hasNextPage &&
        selectedDevices.some(({ deviceId }) => !deviceIds.has(deviceId))
      ) {
        void fetchMore({
          variables: { after: pageInfo.endCursor },
          updateQuery: (previousQueryResult, { fetchMoreResult }) => {
            return mergeSearchDevices(previousQueryResult, fetchMoreResult);
          },
        });
      } else {
        setIsSelectedFetching(false);
      }
    },
  });

  const fetchNextPage = useCallback(
    async (after?: string) => {
      let updatedRes: SearchDevicesOnDevicesSearchResponse | undefined;
      await fetchMore({
        variables: { after: after || data?.searchDevices.pageInfo.endCursor },
        updateQuery: (previousQueryResult, { fetchMoreResult }) => {
          const newResult = mergeSearchDevices(previousQueryResult, fetchMoreResult);
          updatedRes = newResult;
          return newResult;
        },
      });
      return updatedRes;
    },
    [data?.searchDevices, fetchMore],
  );

  const handleToggleSelect = useCallback(
    (device: DeviceInSearch) => {
      const isSelected = selectedDevices?.some(({ deviceId }) => deviceId === device.deviceId);
      const newSelectedDevices = isSelected
        ? selectedDevices?.filter(({ deviceId }) => deviceId !== device.deviceId)
        : selectedDevices?.concat({
            deviceId: device.deviceId,
            name: device.name,
            sensors: device.sensors,
            projectKey: device.projectKey,
          });
      onChange(newSelectedDevices);
    },
    [onChange, selectedDevices],
  );

  const clearAllSelected = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const devicesOptions = useMemo<DeviceInSearch[]>(
    () =>
      data?.searchDevices.edges.map(({ node: { deviceId, name, groups, sensors } }) => ({
        deviceId,
        name,
        sensors,
        projectKey: groups?.[0].projectKey || null,
      })) || [],
    [data],
  );

  const isSelectAll = useMemo(
    () =>
      selectedDevices?.length > 0 &&
      devicesOptions.length === selectedDevices?.length &&
      devicesOptions.every(({ deviceId }) =>
        selectedDevices.some((device) => device.deviceId === deviceId),
      ),
    [devicesOptions, selectedDevices],
  );

  const handleSelectAll = useCallback(async () => {
    let newData: SearchDevicesOnDevicesSearchResponse | undefined = data;
    while (newData?.searchDevices.pageInfo.hasNextPage) {
      // eslint-disable-next-line no-await-in-loop
      newData = await fetchNextPage(newData?.searchDevices.pageInfo.endCursor ?? undefined);
      if (!isMountedRef.current) return;
    }
    const newDeviceList =
      newData?.searchDevices.edges.map(({ node: { deviceId, name, groups, sensors } }) => ({
        deviceId,
        name,
        sensors,
        projectKey: groups?.[0].projectKey || null,
      })) || [];
    if (!isMountedRef.current) return;
    onChange(newDeviceList);
  }, [data, isMountedRef, onChange, fetchNextPage]);

  const toggleSelectAll = useCallback(async () => {
    if (!isSelectAll) {
      setSelectAllLoading(true);
      await handleSelectAll();
      if (isMountedRef.current) {
        setSelectAllLoading(false);
      }
      return;
    }
    clearAllSelected();
  }, [isSelectAll, clearAllSelected, handleSelectAll, isMountedRef]);

  const handleScroll: UIEventHandler = useCallback(() => {
    const pageInfo = data?.searchDevices.pageInfo;
    if (!loading && pageInfo?.hasNextPage && isBottom(menuScrollRef)) {
      void fetchNextPage(pageInfo.endCursor);
    }
  }, [data?.searchDevices.pageInfo, fetchNextPage, loading]);

  return (
    <>
      <TextField
        variant="outlined"
        type="button"
        value={
          selectedDevices?.length > 0
            ? t('{{count}} Selected', { count: selectedDevices.length })
            : t('Select devices')
        }
        label={label || t('Devices')}
        disabled={disabled}
        InputProps={{
          ref: menuToggleRef,
          classes: {
            root: classes.inputRoot,
            input: classes.input,
          },
          endAdornment: <ExpandMoreRoundedIcon />,
          onClick: () => {
            setOpen((prev) => !prev);
          },
        }}
        InputLabelProps={{ shrink: true }}
        fullWidth
        className={className}
      />
      <Popover
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        anchorEl={menuToggleRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        classes={{ paper: classes.paper }}
      >
        <div className={classes.menuHeader}>
          <MenuItem
            disableGutters
            classes={{ root: classes.menuItem, selected: classes.selectedItem }}
          >
            <BasicSearchField
              placeholder={t('Search')}
              onSearch={setKeyword}
              onClear={() => {
                setKeyword(null);
              }}
              InputProps={{
                margin: 'none',
                className: classes.searchField,
              }}
              disableForm
            />
          </MenuItem>
          <MenuItem
            classes={{
              root: clsx(classes.menuItem, classes.selectAllItem),
              selected: classes.selectedItem,
            }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={toggleSelectAll}
            disabled={isSelectedFetching || selectAllLoading}
          >
            <Grid container alignItems="center" className={classes.itemContainer}>
              <Grid item xs={2}>
                <CircleCheckbox
                  checked={isSelectAll}
                  disabled={isSelectedFetching || selectAllLoading}
                />
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body2">{t('Select All')}</Typography>
              </Grid>
              <Grid item xs={1} container alignItems="center">
                {(isSelectedFetching || selectAllLoading) && <CircularProgress size={20} />}
              </Grid>
            </Grid>
          </MenuItem>
        </div>
        <div className={classes.menuBody} ref={menuScrollRef} onScroll={handleScroll}>
          {devicesOptions.map((device) => (
            <MenuItem
              key={device.deviceId}
              value={device.deviceId}
              classes={{
                root: classes.menuItem,
                selected: classes.selectedItem,
              }}
            >
              <Grid
                container
                alignItems="center"
                className={classes.itemContainer}
                onClick={() => {
                  handleToggleSelect(device);
                }}
              >
                <Grid item xs={2}>
                  <CircleCheckbox
                    checked={selectedDevices?.some(({ deviceId }) => deviceId === device.deviceId)}
                  />
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" noWrap>
                    {device.name}
                  </Typography>
                </Grid>
                <Grid item xs={1} container alignItems="center" className={classes.cameraIcon}>
                  <CameraIcon />
                </Grid>
              </Grid>
            </MenuItem>
          ))}
          {loading && (
            <div className={classes.loading}>
              <CircularProgress />
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default memo(DevicesSearchField);
