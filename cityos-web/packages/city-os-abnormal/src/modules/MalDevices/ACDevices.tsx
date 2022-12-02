import { SubmitHandler, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { DeviceType, SortOrder, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ReducerActionType from 'city-os-common/reducers/actions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import Switch from '@material-ui/core/Switch';

import isGqlError from 'city-os-common/libs/isGqlError';

import ErrorCode from 'city-os-common/libs/errorCode';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';

import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import {
  GET_MALDEVICES_ON_DEVICE,
  GetDeviceResponse,
  GetMalDevicePayload,
  PartialNode,
} from '../../api/getMalDevices';

import {
  MalDeviceUpdatePayload,
  MalDeviceUpdateResponse,
  UPDATE_MALDEVICES,
} from '../../api/updateMalDevices';

import { MaldeviceSortField, NotifyType } from '../../libs/schema';

import IconData from './IconData';

import { ADD_MALDEVICES, MalDevicePayload, MalDeviceResponse } from '../../api/addMalDevices';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '80vw',
    minWidth: 550,
  },

  basicInfo: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },

  submitButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(10),
  },

  textField: {
    flex: 1,
    maxWidth: 360,
  },

  subtitle: {
    color: theme.palette.info.main,
  },

  subtitleerr: {
    color: 'red',
  },

  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },

  formControl: {
    margin: theme.spacing(1),
    width: 300,
  },

  divisionSelector: {
    width: 320,
  },

  toggle: {
    paddingTop: theme.spacing(0.5),
  },
}));

interface AddDevicesForm {
  name: string;
  deviceType: string[];
  notifyType: string[];
  division_id: string[];
  emailAddr: string[];
  status: string;
  deviceId: string[];
}
interface CUMalDevicesProps {
  type: string;
  queryId: string;
  open: boolean;
  onClose: () => void;
}

interface Query {
  gid?: string;
  q?: string;
  sortBy?: MaldeviceSortField;
  order?: SortOrder;
  n?: number;
  p?: number;
}

const ACDevices: FunctionComponent<CUMalDevicesProps> = ({
  type,
  queryId,
  open,
  onClose,
}: CUMalDevicesProps) => {
  const { t } = useTranslation(['common', 'info']);
  const classes = useStyles();
  const [currentName, setCurrentName] = useState<Required<PartialNode>>();
  const DeviceTypeArray = Object.values(DeviceType);
  const NotifyTypeArray = Object.values(NotifyType);
  const [areColored, setColor] = useState<boolean[]>(Array(DeviceTypeArray.length).fill(false));
  const [areNotify, setAreNotify] = useState<boolean[]>(Array(NotifyTypeArray.length).fill(false));
  const [ntype, setNtype] = useState<string[]>([]);
  const [dd, setDd] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.INFO]);
  const [empty, setEmpty] = useState<boolean>(true);
  const isMountedRef = useIsMountedRef();
  const {
    dispatch,
    userProfile: { divisionGroup },
  } = useStore();

  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    watch,
    reset,
    formState: { /* isValid, */ isDirty, errors },
  } = useForm<AddDevicesForm>({
    defaultValues: {
      name: queryId,
      deviceType: [],
      notifyType: [],
      division_id: [],
      status: 'OFF',
    },
    mode: 'onChange',
  });

  const setname = watch('name');
  const setDeviceType = useCallback(
    (list: DeviceType) => {
      const devicearray = [] as string[];
      const enumKey = Number(
        Object.keys(DeviceTypeArray)[Object.values(DeviceTypeArray).indexOf(list)],
      );
      setDd([]);
      setColor((prev) => {
        const res: boolean[] = Object.assign([], prev, { [enumKey]: !prev[enumKey] });
        res.map((item: boolean, j: number) => {
          if (item === true) {
            devicearray.push(DeviceTypeArray[j]);
            setDd((previtem) => [...previtem, DeviceTypeArray[j]]);
          }
          return item;
        });
        return res;
      });
      return list;
    },
    [DeviceTypeArray, setDd],
  );

  const getDeviceType = useCallback(
    (deviceTypeData: DeviceType[]) => {
      // console.log('getDeviceType', deviceTypeData);
      deviceTypeData.map((list: DeviceType) => {
        setDeviceType(list);
        return list;
      });
      return dd;
    },
    [dd, setDeviceType],
  );

  const setNotifyType = useCallback(
    (list: NotifyType) => {
      const notifyarray = [] as string[];
      const enumKey = Number(
        Object.keys(NotifyTypeArray)[Object.values(NotifyTypeArray).indexOf(list)],
      );
      setNtype([]);
      setAreNotify((prev) => {
        const res: boolean[] = Object.assign([], prev, { [enumKey]: !prev[enumKey] });
        res.map((item: boolean, j: number) => {
          if (item === true) {
            notifyarray.push(NotifyTypeArray[j]);
            setNtype((previtem) => [...previtem, NotifyTypeArray[j]]);
          }
          return item;
        });
        return res;
      });
      return list;
    },
    [NotifyTypeArray],
  );

  const getNotifyType = useCallback(
    (notifyTypeData: NotifyType[]) => {
      // console.log('getDeviceType', notifyTypeData);
      notifyTypeData.map((list: NotifyType) => {
        setNotifyType(list);
        return list;
      });
      return null;
    },
    [setNotifyType],
  );

  const getTypeData = useCallback(
    (deviceTypeData: DeviceType[], notifyTypeData: NotifyType[]) => {
      // console.log('notifyTypeData', notifyTypeData);
      getDeviceType(deviceTypeData);
      getNotifyType(notifyTypeData);
    },
    [getDeviceType, getNotifyType],
  );

  const handleChange = useCallback(
    (devicelist: DeviceType | undefined, notifylist: NotifyType | undefined) => {
      if (devicelist !== undefined) setDeviceType(devicelist);
      if (notifylist !== undefined) setNotifyType(notifylist);
    },
    [setDeviceType, setNotifyType],
  );

  const { refetch } = useQuery<GetDeviceResponse, GetMalDevicePayload>(GET_MALDEVICES_ON_DEVICE, {
    variables: {
      groupId: divisionGroup?.id,
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getMalDevices }) => {
      const newName = getMalDevices.edges.find(({ node }) => node.name === queryId);
      if (newName) {
        setCurrentName(newName.node);
        getTypeData(newName.node?.deviceType, newName.node?.notifyType);
      }
    },
  });

  useMemo(() => {
    let typestatus = 'ON';
    console.log('typestatus_before', typestatus);
    if (queryId !== '') {
      if (currentName?.status === 'ON') setToggle(true);
      else setToggle(false);
      typestatus = currentName?.status === 'ON' ? 'ON' : 'OFF';
    } else {
      setToggle(true);
      typestatus = 'ON';
    }
    console.log('typestatus_after', typestatus);
    setValue('status', typestatus, { shouldDirty: true });
    console.log('getvalue_status', getValues('status'));
  }, [currentName?.status, queryId, setValue, setToggle, getValues]);

  useEffect(() => {
    const selectedOption = [] as string[];
    const groupid = divisionGroup?.id ? divisionGroup?.id : '';
    selectedOption.push(groupid);
    setValue('division_id', selectedOption, { shouldDirty: true });
  }, [divisionGroup?.id, setValue]);

  useEffect(() => {
    setValue('deviceType', dd, { shouldDirty: true });
    // console.log('dd', dd);
  }, [areColored, dd, setValue]);

  useEffect(() => {
    setValue('notifyType', ntype, { shouldDirty: true });
    // console.log('ntype', ntype);
  }, [areNotify, ntype, setValue]);

  const handleSwitchChange = useCallback(
    (to: boolean) => {
      console.log('to', to);
      setToggle(!to);
    },
    [setToggle],
  );

  useEffect(() => {
    const typestatus = toggle === true ? 'ON' : 'OFF';
    console.log('toggle', toggle);
    setValue('status', typestatus, { shouldDirty: true });
    console.log('getvalue_status_effect', getValues('status'));
  }, [getValues, setValue, toggle]);

  const dialogOnClose = useCallback(() => {
    if (queryId === '') {
      setColor(Array(DeviceTypeArray.length).fill(false));
      setAreNotify(Array(NotifyTypeArray.length).fill(false));
      setToggle(true);
      setDd([]);
      setNtype([]);
    }
    reset();
    onClose();
  }, [queryId, reset, onClose, DeviceTypeArray.length, NotifyTypeArray.length]);

  const [addMlDeviceType] = useMutation<MalDeviceResponse, MalDevicePayload>(ADD_MALDEVICES, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('info:MalDevicesData sent_'),
        },
      });
    },
    onError: (error) => {
      const isExistedError = isGqlError(error, ErrorCode.NAME_DUPLICATED);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: isExistedError
            ? t('info:The name_{{duplicate}} exists  in the database already_', {
                duplicate: setname,
              })
            : t('info:MalDevicesData failed_ Please try again_'),
        },
      });
    },
  });

  const [updateMlDevices] = useMutation<MalDeviceUpdateResponse, MalDeviceUpdatePayload>(
    UPDATE_MALDEVICES,
    {
      onCompleted: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('info:MalDevicesData sent_'),
          },
        });
        void refetch();
      },
      onError: (error) => {
        const isExistedError = isGqlError(error, ErrorCode.NAME_DUPLICATED);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: isExistedError
              ? t('info:The name_{{duplicate}} exists  in the database already_', {
                  duplicate: setname,
                })
              : t('info:MalDevicesData failed_ Please try again_'),
          },
        });
      },
    },
  );

  const onSubmit = useCallback<SubmitHandler<AddDevicesForm>>(
    async (data) => {
      if (data.name === null || data.name === '') return;
      console.log('toggle_submit', toggle);
      const groupid = divisionGroup?.id ? divisionGroup?.id : '';
      if (queryId !== '') {
        await updateMlDevices({
          variables: {
            groupId: groupid,
            MalDeviceUpdate: {
              queryname: queryId,
              name: watch('name'),
              deviceType: getValues('deviceType'),
              notifyType: getValues('notifyType'),
              status: getValues('status'),
              division_id: getValues('division_id'),
            },
          },
        });
      } else if (queryId === '') {
        const selectedOption = [] as string[];
        selectedOption.push(groupid);
        setValue('division_id', selectedOption, { shouldDirty: true });
        const typestatus = toggle === true ? 'ON' : 'OFF';
        console.log('typestatus_submit', typestatus);
        setValue('status', typestatus, { shouldDirty: true });
        await addMlDeviceType({
          variables: {
            groupId: groupid,
            MalDeviceInput: {
              name: watch('name'),
              deviceType: watch('deviceType'),
              notifyType: watch('notifyType'),
              status: watch('status'),
              division_id: getValues('division_id'),
            },
          },
        });
      }
      if (isMountedRef.current) dialogOnClose();
    },
    [
      toggle,
      divisionGroup?.id,
      queryId,
      isMountedRef,
      dialogOnClose,
      updateMlDevices,
      watch,
      getValues,
      setValue,
      addMlDeviceType,
    ],
  );

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId, p: 1 });
      const deviceTypeData = currentName?.deviceType ? currentName?.deviceType : [];
      const notifyTypeData = currentName?.notifyType ? currentName?.notifyType : [];
      getTypeData(deviceTypeData, notifyTypeData);
    },
    [changeRoute, currentName?.deviceType, currentName?.notifyType, getTypeData],
  );

  useEffect(() => {
    if (dd.length > 0 && ntype.length > 0 && setname) setEmpty(false);
    else setEmpty(true);
  }, [dd, ntype, setEmpty, setname]);

  useEffect(() => {
    register('name', { required: true });
  }, [register]);

  useEffect(() => {}, [setname]);

  return (
    <BaseDialog
      open={open}
      onClose={() => dialogOnClose()}
      title={
        type === 'E'
          ? t('info:Edit MalDevices Notification')
          : t('info:Add MalDevices Notification')
      }
      titleVariant="h4"
      titleAlign="center"
      content={
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="subtitle2" align="center" className={classes.subtitle}>
            {t('info:Division')}
            <Divider orientation="horizontal" />
          </Typography>

          <section className={classes.basicInfo}>
            <DivisionSelector classes={classes.textField} onChange={handleGroupChange} />
          </section>

          <Typography
            variant="subtitle2"
            align="center"
            className={setname ? classes.subtitle : classes.subtitleerr}
          >
            {t('info:Name')}
            <Divider orientation="horizontal" />
          </Typography>

          <section className={classes.basicInfo}>
            <TextField
              label={t('info:Name')}
              type="text"
              variant="outlined"
              className={classes.textField}
              placeholder={t('info:Device Name')}
              InputLabelProps={{ shrink: true }}
              value={watch('name')}
              inputProps={register('name', {})}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </section>

          <Typography
            variant="subtitle2"
            align="center"
            className={dd.length > 0 ? classes.subtitle : classes.subtitleerr}
          >
            {t('info:Device Type')}
            <Divider orientation="horizontal" />
          </Typography>

          <section className={classes.basicInfo}>
            <div className={classes.type}>
              {DeviceTypeArray.map((list, index) => (
                <IconData
                  devicetypeData={list}
                  typeindex={index}
                  onselect={areColored}
                  clickChange={handleChange}
                />
              ))}
            </div>
          </section>

          <Typography
            variant="subtitle2"
            align="center"
            className={ntype.length > 0 ? classes.subtitle : classes.subtitleerr}
          >
            {t('info:Notify Type')}
            <Divider orientation="horizontal" />
          </Typography>

          <section className={classes.basicInfo}>
            <div className={classes.type}>
              {NotifyTypeArray.map((list, index) => (
                <IconData
                  notitypeData={list}
                  typeindex={index}
                  onselect={areNotify}
                  clickChange={handleChange}
                />
              ))}
            </div>
          </section>

          <Typography variant="subtitle2" align="center" className={classes.subtitle}>
            {t('info:Device Status')}

            <Divider orientation="horizontal" />
          </Typography>

          <section className={classes.basicInfo}>
            <Switch
              color="primary"
              checked={toggle}
              onChange={() => {
                handleSwitchChange(toggle);
              }}
              name="checked"
            />
            <span className={classes.toggle}>{toggle ? t('info:Open') : t('info:Close')}</span>
          </section>

          <div className={classes.submitButtonWrapper}>
            <Button variant="contained" color="primary" type="submit" disabled={!isDirty || empty}>
              {t('common:Save')}
            </Button>
          </div>
        </form>
      }
    />
  );
};

export default ACDevices;
