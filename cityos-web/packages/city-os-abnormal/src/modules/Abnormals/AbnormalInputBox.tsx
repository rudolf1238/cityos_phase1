import { FetchResult, useMutation } from '@apollo/client';
import { IconButton, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import { StorageKey, getItem, getValue } from 'city-os-common/libs/storage';
import { isString } from 'lodash';
import { makeStyles, styled } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useStore } from 'city-os-common/reducers';
import { useTranslation } from 'react-i18next';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import Button from '@material-ui/core/Button';
import ErrorCode from 'city-os-common/libs/errorCode';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import React, { ChangeEvent, FunctionComponent, PropsWithChildren, useCallback } from 'react';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import isGqlError from 'city-os-common/libs/isGqlError';

import {
  ADD_MESSAGEBOARD,
  AddMessageboardPayload,
  AddMessageboardResponse,
  MessageboardInput,
} from '../../api/addMessageboard';
import uploadImg from '../../api/uploadImg';

const useStyles = makeStyles((theme) => ({
  InputBoxWrap: {
    height: 320,
  },
  form: {
    width: '80vw',
    minWidth: 550,
  },
  Textarea: {
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    width: '100%',
    height: '170px',
    fontSize: '20px',
    resize: 'none',
    boxSizing: 'border-box',
    '&.focus': {
      outline: 'none',
    },
  },

  Nickname: {
    marginRight: '20px',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    width: '150px',
    height: '45px',
    boxSizing: 'border-box',
    '&.focus': {
      outline: 'none',
    },
  },

  submit: {
    border: 'none',
    borderRadius: '5px',
    height: '30px',
    cursor: 'pointer',
    transition: 'all 0.5s ease',
    userSelect: 'none',
    '&.focus': {
      outline: 'none',
    },
    '&.hover': {
      background: '#febfcf',
    },
  },
  warp: {
    background: '#9dcef2',
    margin: '0',
    padding: '15px',
    width: '700px',
  },
  fullHeight: {
    height: '100%',
  },
  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },
  save: {
    float: 'right',
    display: 'block',
    paddingBottom: theme.spacing(2),
  },
  headerButton: {
    width: theme.spacing(22.5),
    height: theme.spacing(6.875),
  },

  select: {
    width: '200px',
  },

  body: {
    flex: '1 0 auto',
    width: theme.spacing(62),
    marginTop: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? '#121a38' : 'rgba(0, 0, 0, 0.05)',
    borderTop: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    borderBottom: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    minHeight: 0,
    overflow: 'auto',
    maxHeight: `calc(95vh - ${theme.spacing(33.875)}px - 125px)`,
  },
  uploadingCardImage: {
    width: '70%',
    height: '70%',
    display: 'flex',
    borderRadius: theme.spacing(1),
    boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
  },
  uploadingCardIconBtn: {
    backgroundColor: 'unset',
    color: theme.palette.primary.main,
    border: 'unset',
    width: theme.spacing(5),
    height: theme.spacing(5),
    '&:hover': {
      backgroundColor: `${theme.palette.action.selected}80`,
      border: 'unset',
    },
    boxShadow: 'unset',
  },
  uploadingCardContent: {
    height: '100%',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(4, 0, 1.25, 0),
    marginRight: -theme.spacing(2),
  },
  uploadingCardContentBody: {
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: '16px',
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    '&>span:last-child': {
      color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    },
    paddingLeft: theme.spacing(0.5),
  },
  uploadingCardContentFooter: {},
}));

const Input = styled('input')({
  display: 'none',
});

export interface Message {
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
interface InputProps {
  onSubmitMessage?: string;
  text?: string;
  time?: string;
  responseArray?: [];
  onCallInputBox?: () => void;
}

// const AbnormalInputBox: FunctionComponent<InputProps> = ({

// }: PropsWithChildren<InputProps>) => {
interface MessageboardForm {
  deviceId: string;
  content: string;
  user: string;
  status: string;
  file: string;
}

const AbnormalInputBox: FunctionComponent<InputProps> = ({
  onSubmitMessage = '',
  onCallInputBox = () => {},
}: PropsWithChildren<InputProps>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [input, setInput] = React.useState(onSubmitMessage);
  const router = useRouter();
  const deviceId = isString(router.query.id) ? router.query.id : '';
  const { t } = useTranslation(['common', 'device']);

  const {
    dispatch,
    user,
    userProfile: { divisionGroup },
  } = useStore();

  const classes = useStyles();
  const groupId = divisionGroup?.id;
  const userEmail = user.email || '';

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    // eslint-disable-next-line no-empty-pattern
    formState: {},
  } = useForm<MessageboardForm>({
    defaultValues: {
      deviceId,
      content: '',
      user: '',
      status: '',
      file: '',
    },
    mode: 'onChange',
  });

  // selection optional
  const [status, setStatus] = React.useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setStatus(event.target.value);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setValue('status', event.target.value, { shouldDirty: true });
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
    setValue('content', e.target.value, { shouldDirty: true });
    console.log(`content:${e.target.value}`);
    console.log(`getcontent:${getValues('content')}`);
  };

  let fileID = '';
  const [url, setUrl] = React.useState('');
  const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
  const authorization = `Bearer ${refreshToken || ''}`;
  // TODO:IMAGE
  const handleOnChangeImage: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.currentTarget.files != null) {
      if (event.currentTarget.files.length > 0) {
        const file = event.currentTarget.files[0];
        if (
          !file.type.includes('image/jpg') &&
          !file.type.includes('image/jpeg') &&
          !file.type.includes('image/png') &&
          !file.type.includes('image/gif') &&
          !file.type.includes('image/JPG') &&
          !file.type.includes('image/JPEG') &&
          !file.type.includes('image/PNG') &&
          !file.type.includes('image/GIF') &&
          !file.type.includes('image/gif')
        ) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message:
                'Image Type is error. Only image files are allowed! (ex: *.jpg, *png, and *gif)',
            },
          });
          return;
        }
        // jpg | jpeg | png | gif | JPG | JPEG | PNG | GIF;
        const upload = await uploadImg({ file, authorization, groupId });
        // eslint-disable-next-line no-underscore-dangle
        fileID = upload.fileInfo._id;
        setValue('file', fileID, { shouldDirty: true });
        setUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleClearImg = useCallback(() => {
    setUrl('');
    setValue('file', '', { shouldDirty: true });
  }, [setValue]);

  const handleAddMessage = useCallback((): Promise<FetchResult<AddMessageboardResponse> | void> => {
    console.log(`deviceId:${watch('deviceId')}`);
    console.log(`content:${watch('content')}`);
    console.log(`user:${watch('user')}`);
    console.log(`file:${watch('file')}`);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return addMessageboard({
      variables: {
        groupId,
        MessageboardInput: {
          deviceId: watch('deviceId'),
          content: watch('content'),
          user: watch('user'),
          status: watch('status'),
          file: watch('file'),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, AbnormalInputBox]);

  const handleSave = useCallback(
    async (currentData: MessageboardInput) => {
      if (currentData.content.trim() === '' || currentData.content.trim() === null) {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: 'Content is empty.',
          },
        });
        return;
      }
      setValue('deviceId', deviceId, { shouldDirty: true });
      setValue('user', userEmail, { shouldDirty: true });
      console.log(`deviceId:${watch('deviceId')}`);
      console.log(`content:${watch('content')}`);
      console.log(`user:${watch('user')}`);
      console.log(`file:${watch('file')}`);
      await Promise.allSettled([handleAddMessage()]);
      setInput('');
      setValue('file', '', { shouldDirty: true });
      setValue('content', '', { shouldDirty: true });
      setUrl('');
      setStatus('');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      onCallInputBox();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleAddMessage],
  );

  const [addMessageboard] = useMutation<AddMessageboardResponse, AddMessageboardPayload>(
    ADD_MESSAGEBOARD,
    {
      onCompleted: () => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: 'Send OK!',
          },
        });
      },
      onError: (error) => {
        isGqlError(error, ErrorCode.USER_ALREADY_EXISTED);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: 'Send fail, Please try again.',
          },
        });
      },
    },
  );

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div>
        <input
          className={classes.Textarea}
          type="text"
          placeholder="請寫下您的留言..."
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={input}
          onChange={handleMessageChange}
        />
        <div>
          <InputLabel id="select-label">Device Status</InputLabel>
          <span className={classes.select}>
            <Select
              labelId="select-label"
              id="simple-select"
              value={status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="ERROR">ERROR</MenuItem>
              <MenuItem value="PROCESSING">PROCESSING</MenuItem>
              <MenuItem value="DONE">DONE</MenuItem>
            </Select>
          </span>

          <IconButton color="primary" aria-label="upload picture" component="label">
            <AddPhotoAlternateIcon />
            <Input
              accept="image/gif, image/jpeg, image/png"
              type="file"
              onChange={handleOnChangeImage}
              hidden
            />
          </IconButton>
          <span className={classes.save}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="small"
              startIcon={<Send />}
            >
              {t('common:Save')}
            </Button>
          </span>
          {url && (
            <ThemeIconButton
              aria-label="delete"
              classes={{
                root: classes.uploadingCardIconBtn,
              }}
              onClick={() => {
                handleClearImg();
              }}
            >
              <HighlightOffIcon />
            </ThemeIconButton>
          )}
          {url && <img src={url} alt="" className={classes.uploadingCardImage} />}
        </div>
      </div>
    </form>
  );
};

export default AbnormalInputBox;
