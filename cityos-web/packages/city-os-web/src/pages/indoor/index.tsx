import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import { BuildingEdge, Query } from 'city-os-indoor/libs/type';
import {
  GET_BUILDINGS,
  GetBuildingsPayload,
  GetBuildingsResponse,
} from 'city-os-indoor/api/getBuildings';
import { useStore } from 'city-os-common/reducers';
import AddBuildingDialog from 'city-os-indoor/modules/dialog/AddBuildingDialog';
import I18nIndoorProvider from 'city-os-indoor/modules/I18nIndoorProvider';
import useIndoorTranslation from 'city-os-indoor/hooks/useIndoorTranslation';

const useStyles = makeStyles((theme) => ({
  headerContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(3),
  },
  titleContainer: {
    marginTop: theme.spacing(0.75),
  },
  divisionSelectorContainer: {
    marginLeft: 'auto',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      maxWidth: theme.spacing(45),
    },
  },
  bodyContainer: {
    position: 'relative',
    height: `calc(100vh - ${theme.spacing(27)}px)`,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      height: `calc(100vh - ${theme.spacing(21)}px)`,
    },
  },
  addBuildingBtn: {
    position: 'absolute',
    zIndex: 999,
    right: theme.spacing(4),
    bottom: theme.spacing(5),

    '&:hover': {
      backgroundColor: '#0094e5',
    },
  },
  addBuildingDialog: {
    width: 1024,
    height: '95vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },

  addBuildingDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

const Indoor: VoidFunctionComponent = () => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const { t } = useIndoorTranslation(['indoor']);
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.INDOOR]);

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ groupId: selectedId, gid: selectedId });
    },
    [changeRoute],
  );

  const [isAddBuildingDialogOpen, setIsAddBuildingDialogOpen] = React.useState(false);

  const handleAddBuildingAction: React.MouseEventHandler<HTMLButtonElement> = (
    _e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setIsAddBuildingDialogOpen(true);
  };

  const handleAddBuildingDialogClose = useCallback(
    (_flag?: boolean) => {
      if (isMountedRef.current) setIsAddBuildingDialogOpen(false);
    },
    [isMountedRef],
  );

  const {
    userProfile: { permissionGroup },
  } = useStore();

  const router = useRouter();
  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const groupId = useMemo(
    () => routerQuery.groupId || routerQuery.pid || permissionGroup?.group.id,
    [permissionGroup?.group.id, routerQuery.groupId, routerQuery.pid],
  );

  const { data: getBuildingsData, refetch: refetchGetBuildings } = useQuery<
    GetBuildingsResponse,
    GetBuildingsPayload
  >(GET_BUILDINGS, {
    variables: { groupId: groupId || '' },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
      void refetchGetBuildings();
    },
    skip: !groupId,
  });

  React.useEffect(() => {
    void refetchGetBuildings();
  }, [refetchGetBuildings, groupId]);

  const buildingEdgeList = useMemo<BuildingEdge[]>(() => {
    if (getBuildingsData !== undefined) {
      return getBuildingsData.getBuildings?.edges || [];
    }
    return [];
  }, [getBuildingsData]);

  const BuildingMapLoading = useMemo(
    () => <Skeleton variant="rect" className={classes.bodyContainer} />,
    [classes.bodyContainer],
  );

  const BuildingMap = useMemo(
    () =>
      dynamic(() => import('city-os-indoor/modules/map/BuildingMap'), {
        loading: () => BuildingMapLoading,
        ssr: false,
      }),
    [BuildingMapLoading],
  );

  return (
    <I18nIndoorProvider>
      <MainLayout>
        <Guard subject={Subject.INDOOR} action={Action.VIEW}>
          <Grid container className={classes.headerContainer}>
            <Grid item className={classes.titleContainer} xs={12} sm={6} md={6} lg={6}>
              <Typography variant="h3" component="div" gutterBottom noWrap>
                {t('indoor:Indoor Map')}
              </Typography>
            </Grid>
            <Grid item className={classes.divisionSelectorContainer} xs={12} sm={6} md={6} lg={6}>
              <DivisionSelector onChange={handleGroupChange} />
            </Grid>
          </Grid>
          <Grid container className={classes.bodyContainer}>
            <BuildingMap buildingEdgeList={buildingEdgeList} />
            <Guard subject={Subject.INDOOR} action={Action.ADD} fallback={null}>
              <ThemeIconButton
                color="primary"
                variant="contained"
                className={classes.addBuildingBtn}
                onClick={handleAddBuildingAction}
              >
                <AddIcon />
              </ThemeIconButton>
            </Guard>
          </Grid>
          <Guard subject={Subject.INDOOR} action={Action.ADD} fallback={null}>
            <AddBuildingDialog
              open={isAddBuildingDialogOpen}
              onClose={handleAddBuildingDialogClose}
              styles={{
                root: classes.addBuildingDialog,
                content: classes.addBuildingDialogContent,
              }}
            />
          </Guard>
        </Guard>
      </MainLayout>
    </I18nIndoorProvider>
  );
};

export default memo(Indoor);
