import { makeStyles, styled } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';

import { FetchResult, useMutation } from '@apollo/client';
import { IconButton, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import { StorageKey, getItem, getValue } from 'city-os-common/libs/storage';
import { isString } from 'lodash';
import { useForm } from 'react-hook-form';
import { useStore } from 'city-os-common/reducers';
import { useTranslation } from 'react-i18next';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import Button from '@material-ui/core/Button';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { useMyContext } from './AbnormalMessagecontext';

import {
  ADD_MESSAGEBOARD_SON,
  AddMessageboardSonPayload,
  AddMessageboardSonResponse,
  MessageboardInputSon,
} from '../../api/addMessageboardSon';
import uploadImg from '../../api/uploadImg';

const useStyles = makeStyles((theme) => ({
  InputBoxWrap: {
    height: 240,
  },

  Textarea: {
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    width: '100%',
    height: '200px',
    fontSize: '20px',
    resize: 'none',
    boxSizing: 'border-box',
    '&.focus': {
      outline: 'none',
    },
  },
  save: {
    float: 'right',
    display: 'block',
    paddingBottom: theme.spacing(2),
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
}));
const Input = styled('input')({
  display: 'none',
});
interface InputProps {
  onSubmitMessage?: string;
  text?: string;
  time?: string;
  responseArray?: [];
  msgId: string | undefined;
  onCallInputBoxSon: () => void;
}
// const AbnormalInputBox: FunctionComponent<InputProps> = ({

// }: PropsWithChildren<InputProps>) => {
interface MessageboardSonForm {
  deviceId: string;
  msgId: string;
  content: string;
  user: string | undefined;
  status: string;
  file: string;
}

const AbnormalInputBoxSon: FunctionComponent<InputProps> = ({
  onSubmitMessage = '',
  msgId,
  onCallInputBoxSon = () => {},
}: PropsWithChildren<InputProps>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [input, setInput] = useState(onSubmitMessage);
  const router = useRouter();
  const deviceId = isString(router.query.id) ? router.query.id : '';
  const {
    dispatch,
    user,
    userProfile: { divisionGroup },
  } = useStore();
  const { t } = useTranslation(['common', 'user', 'inviteUser']);
  const classes = useStyles();
  const groupId = divisionGroup?.id;
  const userEmail = user.email;
  const { setIsvalue, setIsvaluestate } = useMyContext();

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { isValid, isDirty, errors },
  } = useForm<MessageboardSonForm>({
    defaultValues: {
      deviceId,
      msgId,
      content: '',
      user: '',
      status: '',
      file: '',
    },
    mode: 'onChange',
  });

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

  const handleAddMessage = useCallback((): Promise<FetchResult<AddMessageboardSonResponse> | void> => {
    console.log(`deviceId:${watch('deviceId')}`);
    console.log(`msgId:${watch('msgId')}`);
    console.log(`content:${watch('content')}`);
    console.log(`file:${watch('file')}`);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return addMessageboardSon({
      variables: {
        groupId,
        MessageboardInputSon: {
          deviceId: watch('deviceId'),
          msgId: watch('msgId'),
          content: watch('content'),
          user: watch('user'),
          status: watch('status'),
          file: watch('file'),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, AbnormalInputBoxSon]);

  // selection optional
  const [status, setStatus] = React.useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setStatus(event.target.value);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setValue('status', event.target.value, { shouldDirty: true });
  };

  // const handleMessageChange = useCallback(e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
  //     setInput(e.target.value);
  //     setValue('content', e.target.value, { shouldDirty: true });
  //     console.log(`content:${watch('content')}`);
  //     console.log(`getcontent:${getValues('content')}`);
  //   };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
    setValue('content', e.target.value, { shouldDirty: true });
    console.log(`content:${e.target.value}`);
    console.log(`getcontent:${getValues('content')}`);
  };

  const handleSave = useCallback(
    async (currentData: MessageboardInputSon) => {
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
      setValue('msgId', msgId || '', { shouldDirty: true });
      console.log(`deviceId:${watch('deviceId')}`);
      console.log(`content:${watch('content')}`);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`user:${watch('user')}`);
      console.log(`file:${watch('file')}`);
      // currentData.deviceType.push(DeviceTypeArray[i]) ;
      await Promise.allSettled([handleAddMessage()]);

      setIsvalue('true');
      setIsvaluestate('true');
      setInput('');
      setValue('content', '', { shouldDirty: true });
      setValue('file', '', { shouldDirty: true });
      onCallInputBoxSon();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleAddMessage],
  );

  const [addMessageboardSon] = useMutation<AddMessageboardSonResponse, AddMessageboardSonPayload>(
    ADD_MESSAGEBOARD_SON,
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
      onError: () => {
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
          placeholder="編輯回覆"
          value={input}
          onChange={handleMessageChange}
        />
        <InputLabel id="select-label">Status</InputLabel>
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
            // onClick={refreshPage}
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
    </form>
  );
};

export default AbnormalInputBoxSon;
