import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import AddIcon from '@material-ui/icons/Add';

import { Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import { Building, Query } from '../../libs/type';
import { GET_CAMERA, GetCameraPayload, GetCameraResponse, PartialNode } from '../../api/getCamera';
import { IDevice } from '../../../../city-os-common/src/libs/schema';
import { useEditorPageContext } from '../EditorPageProvider';

/** css animation constants */
// const animationBuffer = 300;
const twinkleDuration = 1_000;
const twinkleDelay = 0;
const twinkleTimes = 2;
const fadeOutDelay = twinkleDuration * twinkleTimes;
const fadeOutDuration = 10_000;

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
  },

  selectedMenuTablet: {
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      right: 0,
      height: '100%',
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
  },

  extendablePanel: {
    height: '100%',
    position: 'relative',
  },

  toggle: {
    top: theme.spacing(14),
  },

  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.background.oddRow,
    borderTop: `1px solid ${theme.palette.background.miniTab}`,
    borderBottom: `1px solid ${theme.palette.background.miniTab}`,
  },

  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
  },

  listItem: {
    gap: theme.spacing(1),
    height: theme.spacing(7),
    paddingLeft: theme.spacing(4),
    cursor: 'pointer',

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },

    '&::after': {
      display: 'none',
    },
  },

  activeItem: {
    '&$selected': {
      animation: `$fadeOut ${fadeOutDuration}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  selectedItem: {
    '&$selected': {
      animation: `$twinkle ${twinkleDuration}ms ${twinkleDelay}ms ${twinkleTimes} ${theme.transitions.easing.sharp}, $fadeOut ${fadeOutDuration}ms ${fadeOutDelay}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  '@keyframes fadeOut': {
    from: {
      backgroundColor: theme.palette.action.selected,
    },

    to: {
      backgroundColor: 'transparent',
    },
  },

  '@keyframes twinkle': {
    '50%': {
      backgroundColor: theme.palette.action.selected,
    },

    '100%': {
      backgroundColor: 'transparent',
    },
  },

  selected: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,

    '&:last-child': {
      borderBottom: '1px solid transparent',
    },
  },

  listItemIcon: {
    minWidth: 24,
    color: theme.palette.info.contrastText,
  },

  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },

  cameraIcon: {
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '50%',
  },

  listItemIconSmall: {
    position: 'absolute',
    left: 6,
  },

  pushPinIcon: {
    color: 'rgba(0, 0, 0, 0.12)',
    height: 13,
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
  menuBody: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing(0, 2.5, 2, 2.5),
    gap: theme.spacing(1),
    overflow: 'overlay',
  },
  cameraBox: {
    width: 141,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
  },
  cameraBoxImage: {
    borderRadius: theme.spacing(1),
    width: 141,
    height: 79,
    position: 'relative',
  },
  cameraBoxLabel: {
    width: '100%',
    color: theme.palette.text.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  cameraHoverBox: {
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.spacing(1),
    opacity: 0,
    '&:hover': {
      opacity: 1,
    },
    cursor: 'pointer',
  },
  cameraHoverBoxIcon: {
    color: theme.palette.primary.main,
  },

  loadingMusk: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: theme.zIndex.speedDial,
  },
}));

interface CameraSelectSideMenuProps {
  open: boolean;
  onToggle: (isOpen: boolean) => void;
}

const CameraSelectSideMenu: VoidFunctionComponent<CameraSelectSideMenuProps> = ({
  open,
  onToggle,
}: CameraSelectSideMenuProps) => {
  const classes = useStyles();
  // const { t } = useIndoorTranslation(['indoor', 'common']);
  // const isMountedRef = useIsMountedRef();

  const {
    isMapEdit,
    deviceList,
    building,
    setBuilding,
    floor,
    map,
    setActiveId,
  } = useEditorPageContext();

  const changeRoute = useChangeRoute<Query>(`${subjectRoutes[Subject.INDOOR]}/detail/editor`);

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ groupId: selectedId });
    },
    [changeRoute],
  );

  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const { data: getCameraData, refetch } = useQuery<GetCameraResponse, GetCameraPayload>(
    GET_CAMERA,
    {
      variables: {
        groupId: routerQuery?.groupId || permissionGroup?.group.id || '',
      },
      onError: (error) => {
        if (D_DEBUG) console.error(error.graphQLErrors);
      },
    },
  );

  const checkIsSelected = useCallback(
    (deviceId: string) => deviceList.filter((device) => deviceId === device.deviceId).length > 0,
    [deviceList],
  );

  const cameraList = React.useMemo(
    () =>
      (getCameraData?.searchDevices.edges || []).filter(
        (device) => !checkIsSelected(device.node.deviceId),
      ),
    [checkIsSelected, getCameraData?.searchDevices.edges],
  );

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  const handleAddCamera = useCallback(
    (
      _e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      camera: {
        node: PartialNode;
      },
    ) => {
      const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
      if (floor && buildingClone.floors) {
        const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);

        const newDevice = JSON.parse(JSON.stringify(camera.node)) as IDevice;

        const newDeviceAttributes = [...(newDevice.attributes || [])];

        if (newDeviceAttributes !== null) {
          const xIndex = newDeviceAttributes.findIndex((a) => a.key === 'x');
          const yIndex = newDeviceAttributes.findIndex((a) => a.key === 'y');

          const x =
            (map?.getBounds().getSouthEast().lng || 0) * 0.95 +
            (map?.getBounds().getSouthWest().lng || 0) * 0.05;

          if (xIndex >= 0) {
            newDeviceAttributes[xIndex] = {
              key: 'x',
              value: String(x),
            };
          } else {
            newDeviceAttributes.push({
              key: 'x',
              value: String(x),
            });
          }

          const y =
            (map?.getBounds().getSouthEast().lat || 0) * 0.9 +
            (map?.getBounds().getNorthEast().lat || 0) * 0.1;

          if (yIndex >= 0) {
            newDeviceAttributes[yIndex] = {
              key: 'y',
              value: String(y),
            };
          } else {
            newDeviceAttributes.push({
              key: 'y',
              value: String(y),
            });
          }
          newDevice.attributes = newDeviceAttributes;
          buildingClone.floors[floorIndex].devices.push(newDevice);
          if (buildingClone) {
            setBuilding(buildingClone);
            setActiveId(newDevice.deviceId);
          }
        }
      }
    },
    [building, floor, map, setActiveId, setBuilding],
  );

  return (
    <div className={classes.selectedMenu}>
      <ExtendablePanel
        size={330}
        open={open}
        onToggle={onToggle}
        direction="right"
        PaperProps={{
          className: classes.paper,
        }}
        classes={{ root: classes.extendablePanel, toggle: classes.toggle }}
      >
        {isMapEdit && <div className={classes.loadingMusk} />}
        <div className={classes.openMenu}>
          <div className={classes.menuHeader}>
            <DivisionSelector onChange={handleGroupChange} />
          </div>
          {/* TODO: 先不管到底自動載入，以後有時間再說 */}
          {/* <InfiniteScroll
            // onBottomHit={handleOnBottomHit}
            // isLoading={loading}
            // hasMoreData={!!data?.searchDevices.pageInfo.hasNextPage}
            className={classes.infiniteScroll}
          >
            
          </InfiniteScroll> */}
          <div className={classes.menuBody}>
            {cameraList.map((camera) => (
              <div className={classes.cameraBox}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                  onClick={(e) => {
                    handleAddCamera(e, camera);
                  }}
                >
                  <div
                    className={classes.cameraBoxImage}
                    style={{
                      background: `url('https://thumbs.dreamstime.com/b/photo-camera-icon-logo-design-element-can-be-used-as-as-complement-to-95288793.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className={classes.cameraHoverBox}>
                      <AddIcon className={classes.cameraHoverBoxIcon} />
                    </div>
                  </div>
                </div>
                <span className={classes.cameraBoxLabel}>{camera.node.name}</span>
              </div>
            ))}
          </div>
        </div>
      </ExtendablePanel>
    </div>
  );
};

export default memo(CameraSelectSideMenu);
