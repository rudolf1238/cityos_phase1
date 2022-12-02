import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { StorageKey, getItem, getValue } from 'city-os-common/libs/storage';
import { isString } from 'city-os-common/libs/validators';
import { makeStyles } from '@material-ui/core/styles';
// import { useMutation } from '@apollo/client';
import { useStore } from 'city-os-common/reducers';
// import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Header from 'city-os-common/modules/Header';
import React, { FunctionComponent, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
// import ReducerActionType from 'city-os-common/reducers/actions';
// import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

// import {
//   DELETE_MESSAGEBOARD,
//   DeleteMessageboardPayload,
//   DeleteMessageboardResponse,
// } from '../../api/deleteMessageboard';
// import {
//   DELETE_MESSAGEBOARD_SON,
//   DeleteMessageboardSonPayload,
//   DeleteMessageboardSonResponse,
// } from '../../api/deleteMessageboardSon';
// import { useMyContext } from './AbnormalMessagecontext';
import AbnormalInputBoxSon from './AbnormalInputBoxSon';

import useAbnormalTranslation from '../../hooks/useAbnormalTranslation';

const useStyles = makeStyles(() => ({
  subCommentContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
}));
interface InputProps {
  name?: string;
  text?: string;
  time?: string;
  id?: string;
  pictureId?: string;
  status?: string;
  photo?: string;
  responseArray?: Array<MessageResp>;
  messageList?: Message[];
  value?: string;
  // onCallInputBox?: any;
}

interface Message {
  id: string;
  name: string;
  text: string;
  time: string;
  pictureId: string;
  status: string;
  responseArray: Array<MessageResp>;
  photo: string;
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

const PhotoItem = ({ groupId, photo }: { groupId: string; photo: string }) => {
  const [fileInfo, setFileInfo] = useState<string>('');
  useEffect(() => {
    if (photo) {
      const src = `${
        process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || 'http://localhost:4000/image-mgmt/'
      }${photo}`;
      // const token = localStorage.getItem('ACCESS');
      const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
      const options = {
        method: 'GET',
        headers: {
          authorization: `Bearer ${refreshToken || ''}`,
          'group-id': groupId,
        },
      };

      void fetch(src, options)
        .then((res) => res.blob())
        .then((blob) => {
          setFileInfo(URL.createObjectURL(blob));
        });
    }
  }, [groupId, photo]);
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img width="80%" height="80%" src={fileInfo} />;
};

const CustomAvatar = ({ groupId, photo }: { groupId: string; photo: string }) => {
  const [fileInfo, setFileInfo] = useState<string>('');
  useEffect(() => {
    if (photo) {
      const src = `${
        process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || 'http://localhost:4000/image-mgmt/'
      }${photo}`;
      // const token = localStorage.getItem('ACCESS');
      const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
      const options = {
        method: 'GET',
        headers: {
          authorization: `Bearer ${refreshToken || ''}`,
          'group-id': groupId,
        },
      };

      void fetch(src, options)
        .then((res) => res.blob())
        .then((blob) => {
          setFileInfo(URL.createObjectURL(blob));
        });
    }
  }, [groupId, photo]);
  return <Avatar src={fileInfo} />;
};

const MenuItemSon: FunctionComponent<InputProps> = ({
  name,
  time,
  value,
  pictureId,
  status,
  photo,
}: PropsWithChildren<InputProps>) => {
  // const [isShowValue, setisShowValue] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);
  // const { t } = useTranslation(['common', 'mainLayout']);
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const classes = useStyles();
  const { t } = useAbnormalTranslation(['common', 'column', 'device']);
  // const groupId = divisionGroup?.id ? divisionGroup?.id : '';
  // const { isvalue, setIsvalue } = useMyContext();

  // const handleError = useCallback(
  //   (error: Error) => {
  //     dispatch({
  //       type: ReducerActionType.ShowSnackbar,
  //       payload: {
  //         severity: 'error',
  //         message: 'Remove Message failed_ Please try again',
  //       },
  //     });
  //     if (D_DEBUG) console.error(error);
  //   },
  //   [dispatch, t],
  // );

  // const [deleteMessageboardSon] = useMutation<
  //   DeleteMessageboardSonResponse,
  //   DeleteMessageboardSonPayload
  // >(DELETE_MESSAGEBOARD_SON, {
  //   onCompleted: async () => {
  //     dispatch({
  //       type: ReducerActionType.ShowSnackbar,
  //       payload: {
  //         severity: 'success',
  //         message: 'This messageboard has been removed successfully',
  //       },
  //     });
  //   },
  //   onError: (error) => {
  //     handleError(error);
  //   },
  // });

  // const handleRemove = useCallback(async () => {
  //   if (!id) return;
  //   setIsDeleting(true);
  //   await deleteMessageboardSon({
  //     variables: {
  //       id,
  //     },
  //   });
  //   setIsvalue('true');
  //   if (isMountedRef.current) setIsDeleting(false);
  // }, [permissionGroup?.group.id, isMountedRef, deleteMessageboardSon, handleError, id, groupId]);

  // const atCallUpdateBox = () => {
  //   setisShowValue(false);
  // };
  // const savephoto = new Map();
  // useEffect(() => {
  //   if (photo != undefined) {
  //     if (savephoto.hasOwnProperty(photo.toString())) {
  //       setFileInfo(savephoto.get(photo));
  //     } else {
  //       const src = `${process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT}/${photo}`;
  //       console.log(src);
  //       // const token = localStorage.getItem('ACCESS');
  //       const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
  //       const options = {
  //         method: 'GET',
  //         headers: {
  //           authorization: `Bearer ${refreshToken}`,
  //           'group-id': groupId,
  //         },
  //       };

  //       fetch(src, options)
  //         .then((res) => res.blob())
  //         .then((blob) => {
  //           setFileInfo(URL.createObjectURL(blob));
  //           savephoto.set(photo, URL.createObjectURL(blob));
  //         });
  //     }
  //   }
  // }, [groupId, photo, savephoto]);
  return (
    <List>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <CustomAvatar groupId={divisionGroup?.id ? divisionGroup?.id : ''} photo={photo || ''} />
        </ListItemAvatar>
        <ListItemText>
          <span>{name} </span>
          {t('device:Post this message at {{time}}', {
            time: time || 0,
          })}
          <Header status={status} />
          <p className={classes.subCommentContent}>{value}</p>
          <br />
          {pictureId && (
            <PhotoItem groupId={divisionGroup?.id ? divisionGroup?.id : ''} photo={pictureId} />
          )}
        </ListItemText>

        <Divider />
      </ListItem>
      <Divider variant="inset" component="li" />
    </List>
  );
};

function getmessageListItemsSon(menuItemSon: InputProps[] | undefined): ReactNode[] {
  return menuItemSon
    ? menuItemSon.reduce<ReactNode[]>(
        (acc, { id, name, text, time, pictureId, status, photo }) =>
          acc.concat(
            <MenuItemSon
              key={id}
              id={id}
              name={name}
              value={text}
              time={time}
              pictureId={pictureId}
              status={status}
              photo={photo}
            />,
          ),
        [],
      )
    : [];
}

const MenuItem: FunctionComponent<InputProps> = ({
  id,
  name,
  time,
  value,
  pictureId,
  status,
  responseArray,
  photo,
}: PropsWithChildren<InputProps>) => {
  const [isShowResponsended, setisShowResponse] = useState(false);
  const { t } = useAbnormalTranslation(['common', 'column', 'device']);
  // const [isShowValue, setisShowValue] = useState(false);
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const atCallInputBoxSon = () => {
    setisShowResponse(false);
  };

  const messageListItemSon = getmessageListItemsSon(responseArray);
  const classes = useStyles();
  // const getPhoto = getPhotoItem(pictureId)

  return (
    <List>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          {/* <Avatar alt="Remy Sharp" src={fileInfo} /> */}
          <CustomAvatar groupId={divisionGroup?.id ? divisionGroup?.id : ''} photo={photo || ''} />
        </ListItemAvatar>
        <ListItemText>
          <span>{name} </span>
          {t('device:Post this message at {{time}}', {
            time: time || 0,
          })}
          <Header status={status} />
          <p className={classes.subCommentContent}>{value}</p>
          {pictureId && (
            <PhotoItem groupId={divisionGroup?.id ? divisionGroup?.id : ''} photo={pictureId} />
            // <div>{getPhotoItem(pictureId)}</div>
          )}
          {/* {isShowValue && (
            <UpdateAbnormalInputBox
              onSubmitMessage={value}
              id={id}
              onCallUpdateBox={atCallUpdateBox}
            />
          )} */}
          {messageListItemSon}
          <Button
            onClick={() => {
              setisShowResponse(!isShowResponsended);
            }}
          >
            {t('device:Responsended Message')}
          </Button>
          {isShowResponsended && (
            <AbnormalInputBoxSon
              onSubmitMessage=""
              msgId={id}
              onCallInputBoxSon={atCallInputBoxSon}
            />
          )}
        </ListItemText>
        <Divider />
      </ListItem>
      <Divider variant="inset" component="li" />
    </List>
  );
};

function getmessageListItems(menuItems: InputProps[] | undefined): ReactNode[] {
  return menuItems
    ? menuItems.reduce<ReactNode[]>(
        (acc, { id, name, text, time, responseArray, pictureId, status, photo }) =>
          acc.concat(
            <MenuItem
              key={id}
              id={id}
              name={name}
              value={text}
              time={time}
              pictureId={pictureId}
              status={status}
              photo={photo}
              responseArray={responseArray}
            />,
          ),
        [],
      )
    : [];
}

const AbnormalMessage: FunctionComponent<InputProps> = ({
  messageList,
}: PropsWithChildren<InputProps>) => {
  const messageListItem = getmessageListItems(messageList);
  // onCallInputBox();
  const messageLists = messageListItem;
  return <div>{messageLists}</div>;
};

export default AbnormalMessage;
