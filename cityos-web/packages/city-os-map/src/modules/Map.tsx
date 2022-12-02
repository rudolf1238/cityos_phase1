import { Map as LeafletMapClass } from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

import { Action, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import useHiddenStyles from 'city-os-common/styles/hidden';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';

import Details from './Details';
import I18nMapProvider from './I18nMapProvider';
import MapProvider, { FilterType, MapContextValue } from './MapProvider';
import PoleMenu from './PoleMenu';

const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
});

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    gridTemplateColumns: 'auto 1fr',
    height: '100%',
  },

  poleMenu: {
    gridRow: '1 / 3',
  },

  divisionSelector: {
    position: 'fixed',
    top: theme.spacing(11),
    right: theme.spacing(3),
    zIndex: theme.zIndex.mobileStepper,
    width: theme.spacing(75),

    [theme.breakpoints.down('md')]: {
      maxWidth: theme.spacing(36),
    },
  },
}));

const IntelligentLightMap: VoidFunctionComponent = () => {
  const classes = useStyles();
  const hiddenClasses = useHiddenStyles();
  const poleMenuTimer = useRef<number | null>(null);
  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const [selectedIdList, setSelectedIdList] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<FilterType>(FilterType.ALL);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showPoleMenu, setShowPoleMenu] = useState<boolean>(false);
  const [showCluster, setShowCluster] = useState<boolean>(false);
  const [disableClick, setDisableClick] = useState<boolean>(false);
  const [deviceList, setDeviceList] = useState<IDevice[]>([]);

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const clearAllSelected = useCallback(() => {
    setSelectedIdList(new Set());
    setIsSelectAll(false);
  }, []);

  const contextValue = useMemo<MapContextValue>(
    () => ({
      map,
      keyword,
      filterType,
      selectedIdList,
      showDetails,
      showMore,
      showPoleMenu,
      showCluster,
      disableClick,
      deviceList,
      setMap,
      setSelectedIdList,
      setIsSelectAll,
      clearAllSelected,
      setShowDetails,
      setShowMore,
      setShowPoleMenu,
      setShowCluster,
      setDisableClick,
      setDeviceList,
    }),
    [
      map,
      keyword,
      filterType,
      selectedIdList,
      showDetails,
      showMore,
      showPoleMenu,
      showCluster,
      disableClick,
      deviceList,
      clearAllSelected,
    ],
  );

  useEffect(() => {
    if (selectedIdList.size === 0) {
      setShowDetails(false);
      setShowMore(false);
    } else {
      setShowDetails(true);
      setShowPoleMenu(true);
    }
  }, [selectedIdList]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!map) return;
      map.invalidateSize(true);
    }, 500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [map, showDetails]);

  useEffect(() => {
    if (!map) return () => {};
    if (poleMenuTimer.current === null) {
      poleMenuTimer.current = window.setInterval(() => {
        map.invalidateSize(true);
      }, 1000 / 30);
    }
    const timeoutId = window.setTimeout(() => {
      if (poleMenuTimer.current) window.clearInterval(poleMenuTimer.current);
      poleMenuTimer.current = null;
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [map, showPoleMenu]);

  return (
    <I18nMapProvider>
      <MainLayout>
        <Guard subject={Subject.LIGHTMAP} action={Action.VIEW}>
          <MapProvider value={contextValue}>
            <div className={classes.mapContainer}>
              {map && (
                <PoleMenu
                  className={classes.poleMenu}
                  isSelectAll={isSelectAll}
                  setKeyword={setKeyword}
                  setFilterType={setFilterType}
                />
              )}
              <MapContainer />
              {map && selectedIdList.size > 0 && <Details />}
            </div>
            <DivisionSelector
              classes={clsx(classes.divisionSelector, {
                [hiddenClasses.hidden]:
                  showMore ||
                  !permissionGroup?.group.subGroups ||
                  permissionGroup.group.subGroups.length === 0,
              })}
            />
          </MapProvider>
        </Guard>
      </MainLayout>
    </I18nMapProvider>
  );
};

export default memo(IntelligentLightMap);
