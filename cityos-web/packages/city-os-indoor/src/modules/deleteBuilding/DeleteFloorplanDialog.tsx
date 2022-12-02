import React, { VoidFunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

import { GPSPoint, IDevice, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import ReducerActionType from 'city-os-common/reducers/actions';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import {
  DELETE_BUILDING,
  DeleteBuildingInfoPayload,
  DeleteBuildingInfoResponse,
} from '../../api/deleteBuildinginfo';
import { Floor } from '../../libs/type';
import {
  FloorInput,
  UPDATE_BUILDING,
  UpdateBuildingInfoPayload,
  UpdateBuildingInfoResponse,
} from '../../api/updateBuildinginfo';
import {
  GET_BUILDINGINFO,
  GetBuildingPayload,
  GetBuildingResponse,
} from '../../api/getBuildinginfo';
import I18nMapProvider from '../I18nIndoorProvider';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    width: 'min(600px, 90vw)',
  },

  subtitle: {
    alignSelf: 'flex-start',
  },

  textField: {
    minWidth: 280,
    maxWidth: 360,
  },
}));

interface DeleteFloorplanDialogProps {
  open: boolean;
  onClose: () => void;
  buildingdeviceId: string;
  floornum: number;
}
interface EditfloorInfo {
  deviceId: string;
  name: string;
  floors: FloorInput[];
  location: GPSPoint;
}

const DeleteFloorplanDialog: VoidFunctionComponent<DeleteFloorplanDialogProps> = ({
  open,
  onClose,
  buildingdeviceId,
  floornum,
}: DeleteFloorplanDialogProps) => {
  const { t } = useIndoorTranslation(['indoor']);
  const classes = useStyles();
  const router = useRouter();
  const isMountedRef = useIsMountedRef();
  const initGPS = {
    lat: 0,
    lng: 0,
  } as GPSPoint;
  const [gpsdata, setGpsdata] = useState<GPSPoint>(initGPS);
  const [err, setErr] = useState<ApolloError | undefined>(undefined);
  const [name, setName] = useState<string>('');
  const [floordata, setFloordata] = useState<FloorInput[]>([]);
  const [del, conDel] = useState<boolean>(true);

  const {
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EditfloorInfo>({
    defaultValues: {
      deviceId: buildingdeviceId,
      name: '',
      floors: [],
      location: initGPS,
    },
    mode: 'onChange',
  });

  const {
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();

  const { data: build, refetch } = useQuery<GetBuildingResponse, GetBuildingPayload>(
    GET_BUILDINGINFO,
    {
      variables: {
        groupId: divisionGroup?.id,
        filter: {
          deviceId: buildingdeviceId,
        },
      },
      onCompleted: ({ getBuildings }) => {
        if (!getBuildings) return;

        getBuildings.edges[0].node.attributes.map(() => {
          setName(getBuildings.edges[0].node.name);
          if (getBuildings.edges[0].node.location) {
            const newLocation = {
              lat: getBuildings.edges[0].node.location.lat,
              lng: getBuildings.edges[0].node.location.lng,
            };
            if (newLocation) setGpsdata(newLocation);
          }
          return null;
        });
      },
      onError: (error) => {
        setErr(error);
        console.log('err', err);
      },
    },
  );

  const [updateBuilding] = useMutation<UpdateBuildingInfoResponse, UpdateBuildingInfoPayload>(
    UPDATE_BUILDING,
  );

  const [deleteBuilding] = useMutation<DeleteBuildingInfoResponse, DeleteBuildingInfoPayload>(
    DELETE_BUILDING,
  );

  const [confirmValue, setConfirmValue] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveFloorplan = useCallback(async () => {
    setIsDeleting(true);
    // console.log('removefloorplan:');
    try {
      const groupId = divisionGroup?.id ? divisionGroup?.id : '';
      await updateBuilding({
        variables: {
          groupId,
          deviceId: buildingdeviceId,
          buildingInput: {
            name: getValues('name'),
            floors: getValues('floors'),
            location: getValues('location'),
          },
        },
      });
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('indoor:The floorplan has been deleted successfully_'),
        },
      });
      void refetch();
    } catch (error) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('indoor:Delete failed_ Please try again_'),
        },
      });

      if (D_DEBUG) console.error(error);
    }
    if (isMountedRef.current) {
      setIsDeleting(false);
      setConfirmValue('');
      onClose();
    }
  }, [
    isMountedRef,
    divisionGroup?.id,
    updateBuilding,
    buildingdeviceId,
    getValues,
    dispatch,
    t,
    refetch,
    onClose,
  ]);

  const handleRemoveBuilding = useCallback(async () => {
    try {
      const groupId = divisionGroup?.id ? divisionGroup?.id : '';
      await deleteBuilding({
        variables: {
          groupId,
          deviceId: buildingdeviceId,
        },
      });

      void router.push({
        pathname: `${subjectRoutes[Subject.INDOOR]}`,
      });
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('indoor:The building has been deleted successfully_'),
        },
      });
    } catch (error) {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('indoor:Delete failed_ Please try again_'),
        },
      });
      // if (D_DEBUG) console.error(error);
    }
    if (isMountedRef.current) {
      setIsDeleting(false);
      setConfirmValue('');
      onClose();
    }
  }, [
    isMountedRef,
    divisionGroup?.id,
    deleteBuilding,
    buildingdeviceId,
    router,
    dispatch,
    t,
    onClose,
  ]);

  const isValid = useMemo(() => confirmValue === 'DELETE', [confirmValue]);

  useEffect(() => {
    const needfloor = build?.getBuildings.edges[0].node.floors.filter(
      (f) => f.floorNum !== floornum,
    );
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    // console.log(`needfloor:${needfloor}`);

    setFloordata([]);
    needfloor?.map((f: Floor) => {
      const tmpfloor: FloorInput = {
        id: f.id,
        name: f.name,
        devices: f.devices.map((d: IDevice) => d.id),
        floorNum: f.floorNum,
        imageLeftTop: f.imageLeftTop,
        imageRightBottom: f.imageRightBottom,
      };
      setFloordata((prev) => [...prev, tmpfloor]);
      return null;
    });
  }, [build?.getBuildings.edges, floornum]);

  useEffect(() => {
    // console.log(`gpsdata:${JSON.stringify(gpsdata)}`);
    // console.log(`floordata:${JSON.stringify(floordata)}`);

    if (build?.getBuildings !== undefined) {
      if (build?.getBuildings.edges.length > 0) {
        if (build?.getBuildings.edges[0].node.floors.length === 1) conDel(true);
        else conDel(false);
      }
    }

    setValue('name', name, { shouldDirty: true });
    setValue('deviceId', buildingdeviceId, { shouldDirty: true });
    setValue('location', gpsdata, { shouldDirty: true });
    setValue('floors', floordata, { shouldDirty: true });
  }, [setValue, gpsdata, floordata, name, buildingdeviceId, del, conDel, build?.getBuildings]);

  return (
    <I18nMapProvider>
      <BaseDialog
        open={open}
        onClose={onClose}
        title={t('indoor:Are you sure you want to delete?')}
        content={
          <div className={classes.content}>
            <Typography variant="body1" className={classes.subtitle}>
              {t(
                'indoor:This floor will no longer be able to be used. If this is only one floor, this building will no longer to be used, too.',
              )}
            </Typography>
            <TextField
              value={confirmValue}
              onChange={(event) => setConfirmValue(event.target.value.toUpperCase())}
              placeholder={t('indoor:Type “DELETE” to confirm')}
              fullWidth
              variant="outlined"
              error={!!errors.name}
              className={classes.textField}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!isValid || isDeleting}
              onClick={del ? handleRemoveBuilding : handleRemoveFloorplan}
            >
              {t('indoor:Ok')}
            </Button>
          </div>
        }
      />
    </I18nMapProvider>
  );
};

export default DeleteFloorplanDialog;
