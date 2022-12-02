import { Action, GPSPoint, Subject } from 'city-os-common/libs/schema';
import { Container, Grid } from '@material-ui/core';
import { format } from 'date-fns';
// import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import i18n from 'i18next';

import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import { DetailFormData } from '../../modules/Devices/types';
import {
  GET_DEVICE_ON_DEVICE_DETAIL,
  GetDevicePayload,
  GetDeviceResponse,
} from '../../api/getDeviceOnDeviceDetail';
import {
  GET_MAINTENANCEUSER,
  GetMaintenceUserResponse,
  GetMaintenceUserload,
} from '../../api/getMaintenanceUser';
import { GET_RESPONSEMSG, GetMSGResponse, GetResponseMSGload } from '../../api/getResponseMSG';
import { MyContext } from '../../modules/Abnormals/AbnormalMessagecontext';
import AbnormalInputBox, { Message } from '../../modules/Abnormals/AbnormalInputBox';
import AbnormalMessage from '../../modules/Abnormals/AbnormalMessage';
import UserDetail from '../../modules/Maintenance_staffs/UserDetail';

// const useStyles = makeStyles(() => ({
//   root: {
//     display: 'flex',
//     height: 900,
//   },
// }));

interface MaintenanceUser {
  id: string;
  name: string;
  email: string;
}

interface MessageResp {
  id: string;
  name: string;
  text: string;
  time: string;
  pictureId: string;
  status: string;
  photo: string;
}
const parseGPSLocation = (location: GPSPoint): string =>
  location ? `${location.lat}, ${location.lng}` : '';

const DeviceDetail: VoidFunctionComponent = () => {
  const { t } = useTranslation(['common', 'device']);
  const {
    userProfile: { permissionGroup, divisionGroup },
  } = useStore();
  const router = useRouter();
  const methods = useForm<DetailFormData>({
    mode: 'onChange',
    shouldUnregister: true,
  });
  const { reset, register } = methods;
  const [defaultValues, setDefaultValues] = useState<DetailFormData>({
    name: '',
    location: '',
    desc: '',
    attributes: [],
    sensors: [],
    editSensorInputs: [],
    maintainstatus: '',
  });

  const [defaultMessage, setDefaultMessage] = useState<string>('');

  // const [defaultMessagearr, setDefaultMessagearr] = useState<Message[]>([])
  const deviceId = isString(router.query.id) ? router.query.id : '';
  const backLink = isString(router.query.back) ? router.query.back : undefined;

  const { error, refetch: refetchdevice } = useQuery<GetDeviceResponse, GetDevicePayload>(
    GET_DEVICE_ON_DEVICE_DETAIL,
    {
      variables: {
        deviceId: deviceId || '',
      },
      skip: !deviceId || !permissionGroup?.group.id,
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ getDevices }) => {
        const currentDevice = getDevices[0];
        const initValues = {
          name: currentDevice.name,
          location: currentDevice.location ? parseGPSLocation(currentDevice.location) : '',
          desc: currentDevice.desc || '',
          maintainstatus: currentDevice.maintainstatus,
          attributes: currentDevice.attributes
            ? currentDevice.attributes
                .map((attribute) => ({
                  id: uuidv4(),
                  keyName: attribute.key,
                  value: attribute.value,
                }))
                .sort((a, b) => a.keyName.localeCompare(b.keyName, i18n.language))
            : [],
          // attributes: currentDevice.attributes
          //   ? currentDevice.attributes
          //     .map(({ key, value }) => ({
          //       id: uuidv4(),
          //       keyName: key,
          //       value,
          //     }))
          //     .sort((a, b) => a.keyName.localeCompare(b.keyName, i18n.language))
          //   : [],
          sensors: currentDevice.sensors,
          editSensorInputs: [],
        };
        setDefaultValues(initValues);
        reset(initValues);
        register('attributes');
        register('sensors');
        register('editSensorInputs');
      },
    },
  );

  // 設備管理員清單
  const [defaultUser, setDefaultUser] = useState<MaintenanceUser[]>([]);
  const { refetch: refetchUser } = useQuery<GetMaintenceUserResponse, GetMaintenceUserload>(
    GET_MAINTENANCEUSER,
    {
      variables: {
        groupId: divisionGroup?.id || '',
        deviceId: deviceId || '',
      },
      skip: !deviceId || !permissionGroup?.group.id,
      fetchPolicy: 'cache-and-network',
      onCompleted: ({ getMaintenanceUser }) => {
        const matainenceUser = getMaintenanceUser.edge.map((response) => {
          //  console.log(response);
          const resp: MaintenanceUser = {
            id: response.id,
            name: response.name,
            email: response.email,
          };
          return resp;
        });
        setDefaultUser(matainenceUser);
      },
    },
  );

  // useEffect(() => {
  //   console.log(defaultUser);
  // }, [defaultUser]);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(5);
  const [progess, setProgess] = useState<boolean>(false);
  // const [isResp, setIsResp] = useState<boolean>(false);
  const { refetch: refetchdata } = useQuery<GetMSGResponse, GetResponseMSGload>(GET_RESPONSEMSG, {
    variables: {
      groupId: divisionGroup?.id || '',
      deviceId: deviceId || '',
      page,
      size,
    },
    skip: !deviceId || !permissionGroup?.group.id,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getResponseMsg }) => {
      const msgs = getResponseMsg.edges.map(({ node }) => {
        const date = new Date(node.responsemsgFa.updatedAt);
        const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss');
        // console.log(node.responsemsgFa.updatedAt);

        const resps = node.responsemsgSon.map((respson) => {
          // for (let respson of node.responsemsgSon) {
          let dateStrSon = '';
          if (respson.updatedAt) {
            const dateSon = new Date(respson.updatedAt);
            dateStrSon = format(dateSon, 'yyyy-MM-dd HH:mm:ss');
          }

          const resp: MessageResp = {
            id: respson.id,
            name: respson.name,
            text: respson.content,
            time: dateStrSon,
            pictureId: respson.pictureId,
            photo: respson.photo,
            status: respson.status,
          };
          return resp;
          // const savephoto = new Map();

          // }
        });

        const msg: Message = {
          id: node.responsemsgFa.id,
          name: node.responsemsgFa.name,
          text: node.responsemsgFa.content,
          time: dateStr,
          status: node.responsemsgFa.status,
          pictureId: node.responsemsgFa.pictureId,
          responseArray: resps,
          photo: node.responsemsgFa.photo,
        };
        return msg;
      });

      setDefaultMessage('');
      setMessageList(msgs);
      setProgess(true);
      // progess = true;
      if (page === 0) {
        setMessage(msgs);
      } else {
        setMessage([...message, ...msgs]);
      }

      // setDefaultMessagearr(msgs)
    },
  });

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  // const ADD_MESSAGE = 'ADD_MESSAGE';

  /*
   * action creator
   */
  // function messageList(state = [defaultMessage], action: { type: any; info: any }) {
  //   switch (action.type) {
  //     case ADD_MESSAGE:
  //       return action.info;
  //     default:
  //       return state;
  //   }
  // }
  // const classes = useStyles();
  const [isvalue, setIsvalue] = React.useState('false');
  const [isvaluestate, setIsvaluestate] = React.useState('false');

  const providerValue: {
    isvalue: string;
    setIsvalue: React.Dispatch<React.SetStateAction<string>>;
    isvaluestate: string;
    setIsvaluestate: React.Dispatch<React.SetStateAction<string>>;
  } = {
    isvalue,
    setIsvalue,
    isvaluestate,
    setIsvaluestate,
  };
  const atCallInputBox = () => {
    setPage(0);
    void refetchdata();
    void refetchdevice();
    void refetchUser();
  };

  React.useEffect(() => {
    if (isvalue === 'true') {
      if (progess) {
        setProgess(false);
        setSize((page + 1) * size);
        setPage(0);
        // setIsResp(true);
        void refetchdata();
        // if (isvaluestate == 'true') {
        void refetchdevice();
        void refetchUser();
        // }
        setIsvaluestate('false');
        setIsvalue('false');
      }
    }
  }, [isvalue, isvaluestate, page, progess, refetchUser, refetchdata, refetchdevice, size]);
  // const [progress, setProgress] = useState(0);

  const onBottomHandle = useCallback(() => {
    console.log('onBottomHandle');
    if (messageList.length !== 0) {
      if (progess) {
        setProgess(false);
        if (size !== 5) {
          setPage(size / 5);
          setSize(5);
          // setIsResp(false);
        } else {
          setPage(page + 1);
        }
        void refetchdata();
      }
    }
  }, [messageList.length, page, progess, refetchdata, size]);
  const scrollPercentHandle = useCallback((percent: number) => {
    console.log({ percent });
    // setProgress(percent);
  }, []);

  //  useEffect(() => {
  //       const messageListAdd = messageList?.map((response) => {
  //     //  console.log(response);
  //     const resp: Message = {
  //       id: response.id,
  //       name: response.name,
  //       text: response.text,
  //       time: response.time,
  //       pictureId: response.pictureId,
  //       status: response.status,
  //       responseArray: response.responseArray,
  //       photo: response.photo,
  //     };
  //     return resp;
  //   // });
  //     setMessage(message.push(messageList))
  //   }, [messageList]);

  return (
    <MainLayout onBottom={onBottomHandle} scrollPercent={scrollPercentHandle}>
      <Guard subject={Subject.DEVICE} action={Action.VIEW} forbidden={isForbidden}>
        <PageContainer>
          <Header
            title={defaultValues.name || deviceId || ''}
            description={t('device:Show Device Details')}
            backLinkText={t('device:Malfunction Device')}
            backLinkHref={backLink || subjectRoutes[Subject.ABNORMAL_MANAGEMENT]}
            status={defaultValues.maintainstatus}
          />
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <div>
                  <AbnormalInputBox
                    onSubmitMessage={defaultMessage}
                    onCallInputBox={atCallInputBox}
                  />
                  {/* <Divider /> */}
                  <MyContext.Provider value={providerValue}>
                    <AbnormalMessage messageList={message} />
                  </MyContext.Provider>
                </div>
              </Grid>
              <Grid item xs={4}>
                <UserDetail messageList={defaultUser} />
              </Grid>
            </Grid>
          </Container>
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default DeviceDetail;
