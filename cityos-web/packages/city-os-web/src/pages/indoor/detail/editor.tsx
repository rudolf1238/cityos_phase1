import 'leaflet/dist/leaflet.css';
import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { Map as LeafletMapClass } from 'leaflet';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import dynamic from 'next/dynamic';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { Action, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useIsEnableRule from 'city-os-common/hooks/useIsEnableRule';

import { Building, Floor, Query } from 'city-os-indoor/libs/type';
import {
  GET_FULL_BUILDINGS,
  GetFullBuildingsPayload,
  GetFullBuildingsResponse,
} from 'city-os-indoor/api/getFullBuildings';
import {
  GPSPointInput,
  UPDATE_BUILDING,
  UpdateBuildingPayload,
  UpdateBuildingResponse,
} from 'city-os-indoor/api/updateBuilding';
import {
  UPDATE_FLOORPLAN,
  UpdateFloorplanPayload,
  UpdateFloorplanResponse,
} from 'city-os-indoor/api/updateFloorplan';
import UploadService from 'city-os-indoor/api/fileUpload';
import useIndoorTranslation from 'city-os-indoor/hooks/useIndoorTranslation';

import DeleteFloorplanDialog from 'city-os-indoor/modules/deleteBuilding/DeleteFloorplanDialog';
import DeviceSelectSideMenu from 'city-os-indoor/modules/custom/DeviceSelectSideMenu';
import EditorPageProvider, {
  EditorPageContextValue,
} from 'city-os-indoor/modules/EditorPageProvider';
import FileSelector from 'city-os-indoor/modules/common/FileSelector';
import FloorSelector from 'city-os-indoor/modules/custom/FloorSelector';
import I18nIndoorProvider from 'city-os-indoor/modules/I18nIndoorProvider';
import ThemeIconButtonMoreMenu from 'city-os-indoor/modules/custom/ThemeIconButtonMoreMenu';

import { EDIT_DEVICE, EditDevicePayload, EditDeviceResponse } from '../../../api/editDevice';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  headerContainer: {
    marginTop: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(3),
  },
  content: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'hidden',
    marginTop: theme.spacing(3),
    background: '#ffffff',
  },
  headerButton: {
    width: theme.spacing(22.5),
    height: theme.spacing(6.875),
  },
  subContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    '&>div::selection': {
      background: '#00000000',
    },
  },
  sideBar: {
    display: 'flex',
  },
}));

type ImageId = {
  _id: string;
};

const IndoorDetailEditorPage: VoidFunctionComponent = () => {
  const {
    user,
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();
  const AccessToken = `Bearer ${user.accessToken || ''}`;
  const groupId = permissionGroup?.group?.id || '';

  const deleteImages = React.useCallback(
    async (imageIds: ImageId[]) => {
      void UploadService.deleteImages(imageIds, AccessToken, groupId);
    },
    [AccessToken, groupId],
  );

  const [updateFloorplan] = useMutation<UpdateFloorplanResponse, UpdateFloorplanPayload>(
    UPDATE_FLOORPLAN,
    {
      onCompleted: ({ updateFloorplan: oldImageId }) => {
        const imageIds: ImageId[] = [];
        if (D_DEBUG) console.log(String().concat('oldImageId:', oldImageId));
        imageIds.push({ _id: oldImageId });
        try {
          if (oldImageId.indexOf('error') === -1) {
            void deleteImages(imageIds);
          }
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'success',
              message: 'common:The information has been saved successfully_',
            },
          });
        } catch (_e) {
          console.error(_e);
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: 'common:Save failed_ Please try again_',
            },
          });
        }
      },
      onError: (error) => {
        if (error !== undefined && error.message.indexOf("reading 'id'") !== -1) {
          console.log('Incorrect floor information.');
        }

        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: 'common:Save failed_ Please try again_',
          },
        });
      },
    },
  );

  const [openEditFloorplansDialog, setOpenEditFloorplansDialog] = useState(false);

  const classes = useStyles();
  const router = useRouter();
  const { t } = useIndoorTranslation(['indoor', 'common']);
  // const changeRoute = useChangeRoute<Query>(`${subjectRoutes[Subject.INDOOR]}/detail/editor`);
  const routerQuery: Query = useMemo(() => router.query, [router.query]);

  const [deviceList, setDeviceList] = useState<IDevice[]>([]);
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [isMapEdit, setIsMapEdit] = useState<boolean>(false);
  const [map, setMap] = useState<LeafletMapClass | null>(null);

  const contextValue = useMemo<EditorPageContextValue>(
    () => ({
      deviceList,
      setDeviceList,
      selectedFloorNumber,
      setSelectedFloorNumber,
      building,
      setBuilding,
      activeId,
      setActiveId,
      floor,
      setFloor,
      isMapEdit,
      setIsMapEdit,
      map,
      setMap,
    }),
    [activeId, building, deviceList, floor, isMapEdit, map, selectedFloorNumber],
  );

  const { data: getFullBuildingsData, refetch: refetchGetFullBuilding } = useQuery<
    GetFullBuildingsResponse,
    GetFullBuildingsPayload
  >(GET_FULL_BUILDINGS, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      filter: { deviceId: routerQuery.deviceId || '' },
    },
    onError: (error) => {
      if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  useEffect(() => {
    if (getFullBuildingsData !== undefined) {
      if (getFullBuildingsData.getBuildings.edges.length > 0) {
        setBuilding(getFullBuildingsData.getBuildings.edges[0].node);
      }
    }
  }, [getFullBuildingsData]);

  useEffect(() => {
    if (building !== null) {
      setFloor(
        building.floors.find((currentFloor) => currentFloor.floorNum === selectedFloorNumber) ||
          null,
      );
    }
  }, [building, selectedFloorNumber]);

  useEffect(() => {
    if (openEditFloorplansDialog === false) {
      void refetchGetFullBuilding();
    }
  }, [openEditFloorplansDialog, refetchGetFullBuilding]);

  useEffect(() => {
    if (floor !== null) {
      setDeviceList(floor.devices || []);
    }
  }, [floor]);

  const [openDeleteFloorplan, setOpenDeleteFloorplan] = useState(false);
  const handleCloseDeleteFloorplan = useCallback(() => {
    setOpenDeleteFloorplan(false);
  }, []);

  const canRemove = useIsEnableRule({ subject: Subject.INDOOR, action: Action.REMOVE });

  const moreMenuContent = [
    {
      id: 'replace-this-floorplan-file',
      label: t('indoor:Replace this floorplan file'),
      onClick: () => {
        setOpenEditFloorplansDialog(true);
      },
    },
    canRemove && (building?.floors || []).length > 1
      ? {
          id: 'delete-this-floorplan',
          label: t('Delete this floorplan'),
          onClick: () => {
            setOpenDeleteFloorplan(true);
          },
          errorColor: true,
        }
      : null,
  ];

  const handleCancelClick = useCallback(() => {
    void router.push({
      pathname: `${subjectRoutes[Subject.INDOOR]}/detail`,
      query: {
        deviceId: routerQuery.deviceId,
      },
    });
  }, [router, routerQuery.deviceId]);

  const [updateBuilding] = useMutation<UpdateBuildingResponse, UpdateBuildingPayload>(
    UPDATE_BUILDING,
    {
      onCompleted: (data) => {
        if (data.updateBuilding) {
          void router.push({
            pathname: `${subjectRoutes[Subject.INDOOR]}/detail`,
            query: {
              deviceId: routerQuery.deviceId,
            },
          });
        } else {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: t('indoor:Update building failed_'),
            },
          });
        }
      },
      onError: (error) => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('indoor:Update building failed_'),
          },
        });
        if (D_DEBUG) {
          console.error(error);
        }
      },
    },
  );

  const [editDevice] = useMutation<EditDeviceResponse, EditDevicePayload>(EDIT_DEVICE, {
    onCompleted: (data) => {
      if (!data.editDevice) {
        if (D_DEBUG) console.error('editDevice error');
      }
    },
    onError: (error) => {
      if (D_DEBUG) {
        console.error(error);
      }
    },
  });

  const handleSaveClick = useCallback(async () => {
    const floorInput = (building?.floors || []).map((f: Floor) => ({
      id: f.id,
      name: f.name,
      floorNum: f.floorNum,
      imageLeftTop: f.imageLeftTop,
      imageRightBottom: f.imageRightBottom,
      devices: f.devices.map((d: IDevice) => d.id),
    }));

    if (D_DEBUG) {
      console.info({
        groupId: permissionGroup?.group.id || '',
        deviceId: routerQuery.deviceId || '',
        buildingInput: {
          name: building?.name || '',
          floors: floorInput || [],
        },
      });
    }

    building?.floors.map((f) => {
      f.devices.map(async (d) => {
        await editDevice({
          variables: {
            deviceId: d.deviceId,
            editDeviceInput: {
              attributes: (d.attributes || []).map((a) => ({ key: a.key, value: a.value })),
            },
          },
        });
      });
      return null;
    });

    await updateBuilding({
      variables: {
        groupId: permissionGroup?.group.id || '',
        deviceId: routerQuery.deviceId || '',
        buildingInput: {
          name: building?.name || 'None',
          floors: floorInput || [],
          location: {
            lat: building?.location?.lat || 0,
            lng: building?.location?.lng || 0,
          } as GPSPointInput,
        },
      },
    });
  }, [
    building?.floors,
    building?.location?.lat,
    building?.location?.lng,
    building?.name,
    editDevice,
    permissionGroup?.group.id,
    routerQuery.deviceId,
    updateBuilding,
  ]);

  const EditorMap = useMemo(
    () =>
      dynamic(() => import('city-os-indoor/modules/map/EditorMap'), {
        ssr: false,
      }),
    [],
  );

  const setBuildName = debounce((name: string) => {
    setBuilding({ ...building, name } as Building);
  }, 1000);

  const handleCloseEditFloorplansDialog = useCallback(
    (imageId: string | undefined) => {
      const deviceId = building?.deviceId || '';
      const floorNum = selectedFloorNumber || 0;

      if (imageId !== undefined && imageId.trim() !== '') {
        void updateFloorplan({
          variables: { groupId, deviceId, floorNum, imageId: imageId || '' },
        });

        const buildingClone = JSON.parse(JSON.stringify(building)) as Building;
        if (floor && buildingClone.floors) {
          const floorIndex = buildingClone.floors.findIndex((f) => f.id === floor.id);
          if (floorIndex !== -1) {
            buildingClone.floors[floorIndex].id = imageId || '';
            setBuilding(buildingClone);
          }
        }
      }

      setOpenEditFloorplansDialog(false);
      return null;
    },
    [building, floor, groupId, selectedFloorNumber, updateFloorplan],
  );

  return (
    <I18nIndoorProvider>
      <MainLayout>
        <Guard subject={Subject.INDOOR} action={Action.MODIFY}>
          <EditorPageProvider value={contextValue}>
            <div className={classes.root}>
              <Grid
                container
                className={classes.headerContainer}
                justify="space-between"
                alignItems="center"
              >
                <Grid item container md={6} lg={6}>
                  {building && (
                    <TextField
                      type="text"
                      variant="outlined"
                      label={t('indoor:Building Name')}
                      placeholder={t('indoor:Insert building name')}
                      style={{ marginRight: '1em' }}
                      defaultValue={building?.name}
                      onChange={(e) => {
                        setBuildName(e.target.value);
                      }}
                    />
                  )}
                  <ThemeIconButtonMoreMenu
                    menuItemList={moreMenuContent}
                    menuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                    }}
                  />
                </Grid>
                <Grid item container justify="flex-end" md={6} lg={6}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    className={classes.headerButton}
                    style={{ marginRight: '1em' }}
                    onClick={handleCancelClick}
                  >
                    {t('common:Cancel')}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      void handleSaveClick();
                    }}
                  >
                    {t('common:Save')}
                  </Button>
                </Grid>
              </Grid>
              <div className={classes.content}>
                {building !== null && building.floors !== null && building.floors.length > 0 && (
                  <FloorSelector
                    floorList={building.floors}
                    selectedFloorNumber={selectedFloorNumber}
                    setSelectedFloorNumber={setSelectedFloorNumber}
                  />
                )}
                <div className={classes.subContainer}>
                  <EditorMap />
                </div>
                <div className={classes.sideBar}>
                  <DeviceSelectSideMenu open onToggle={(_isOpen: boolean) => {}} />
                </div>
              </div>
            </div>
            <FileSelector
              open={openEditFloorplansDialog}
              setOpen={setOpenEditFloorplansDialog}
              onClose={handleCloseEditFloorplansDialog}
            />
            <Guard subject={Subject.INDOOR} action={Action.REMOVE}>
              <DeleteFloorplanDialog
                open={openDeleteFloorplan}
                onClose={handleCloseDeleteFloorplan}
                buildingdeviceId={routerQuery.deviceId || ''}
                floornum={selectedFloorNumber || 0}
              />
            </Guard>
          </EditorPageProvider>
        </Guard>
      </MainLayout>
    </I18nIndoorProvider>
  );
};

export default IndoorDetailEditorPage;
