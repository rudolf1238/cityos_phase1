import { makeStyles, styled } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { FunctionComponent, PropsWithChildren, useCallback, useState } from 'react';

import { FetchResult, useApolloClient, useMutation } from '@apollo/client';
import { IconButton, InputLabel, MenuItem, Select } from '@material-ui/core';
import { PhotoCamera, Send } from '@material-ui/icons';
import { isString } from 'lodash';
import { useForm } from 'react-hook-form';
import { useStore } from 'city-os-common/reducers';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import uploadImg from '../../api/uploadImg';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
import {
  UPDATE_MESSAGEBOARD,
  UpdateMessageboardInput,
  UpdateMessageboardPayload,
  UpdateMessageboardResponse,
} from '../../api/updateMessageboard';
import isGqlError from 'city-os-common/libs/isGqlError';

const useStyles = makeStyles((theme) => ({
  InputBoxWrap: {
    height: 240,
  },

  Textarea: {
    border: 'none',
    borderRadius: '',
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
  },

  select: {
    width: '200px',
  },
}));

const Input = styled('input')({
  display: 'none',
});

interface InputProps {
  id: string;
  onSubmitMessage?: any;
  text?: string;
  time?: string;
  responseArray?: [];
  onCallUpdateBox: unknown;
}
interface UpdateMessageboardForm {
  id: string;
  deviceId: string;
  content: string;
  user: string | undefined;
  status: string;
  file: string;

  // files: FileList;
}

const UpdateAbnormalInputBox: FunctionComponent<InputProps> = ({
  onSubmitMessage,
  id,
}: PropsWithChildren<InputProps>) => {
  // const AddDevices: VoidFunctionComponent = () => {
  // const router = useRouter();
  const [input, setInput] = useState(onSubmitMessage);
  const router = useRouter();
  const deviceId = isString(router.query.id) ? router.query.id : '';
  const [name, setname] = useState('');
  const { t } = useTranslation(['common', 'device']);

  const methods = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });
  const {
    dispatch,
    user,
    userProfile: { divisionGroup },
  } = useStore();
  const classes = useStyles();
  const groupId = divisionGroup?.id;
  const userEmail = user.email;

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isValid, isDirty, errors },
  } = useForm<UpdateMessageboardForm>({
    defaultValues: {
      id,
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(event.target.value);
    setValue('status', event.target.value, { shouldDirty: true });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setValue('content', e.target.value, { shouldDirty: true });
    console.log(`content:${e.target.value}`);
    console.log(`getcontent:${getValues('content')}`);
  };

  // TODO:IMAGE
  let fileID = '';
  const handleOnChangeImage = async (event: { currentTarget: { files: FileList } }) => {
    if (event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0];
      fileID = (await uploadImg({ file })).fileInfo._id;
      setValue('file', fileID, { shouldDirty: true });
    }
    }
  };

  const handleAddMessage = useCallback(
    ({
      id,
      deviceId,
      content,
      user,
      status,
      file,
    }: // files,
    UpdateMessageboardInput): Promise<FetchResult<UpdateMessageboardResponse> | void> => {
      return updateMessageboard({
        variables: {
          groupId,
          UpdateMessageboardInput: {
            id: watch('id'),
            deviceId: watch('deviceId'),
            content: watch('content'),
            user: watch('user'),
            status: watch('status'),
            file: watch('file'),
          },
        },
      });
    },
    [groupId, UpdateAbnormalInputBox],
  );

  const { isvalue, setIsvalue, isvaluestate, setIsvaluestate } = useMyContext();
  const handleSave = useCallback(
    async (currentData: UpdateMessageboardInput) => {
      setValue('deviceId', deviceId, { shouldDirty: true });
      setValue('user', userEmail, { shouldDirty: true });
      setValue('id', id, { shouldDirty: true });
      console.log(`deviceId:${watch('deviceId')}`);
      console.log(`content:${watch('content')}`);
      console.log(`user:${watch('user')}`);
      console.log(`file:${watch('file')}`);
      // currentData.deviceType.push(DeviceTypeArray[i]) ;
      const updateResult = await Promise.allSettled([handleAddMessage(currentData)]);
      setIsvalue('true');
      setIsvaluestate('true');
      onCallUpdateBox();
    },
    [handleAddMessage],
  );

  const [updateMessageboard] = useMutation<UpdateMessageboardResponse, UpdateMessageboardPayload>(
    UPDATE_MESSAGEBOARD,
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
  function refreshPage() {
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div className={classes.InputBoxWrap}>
        <input
          className={classes.Textarea}
          type="text"
          placeholder="在這留下你想說的話"
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

          {/* <label htmlFor="icon-button-file">
            <Input
              accept="image/*"
              id="icon-button-file"
              type="file"
              onChange={handleOnChangeImage}
            />
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label> */}
          <IconButton color="primary" aria-label="upload picture" component="label">
            <PhotoCamera />
            <Input accept="image/*" type="file" onChange={handleOnChangeImage} hidden />
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
        </div>
      </div>
    </form>
  );
};

export default UpdateAbnormalInputBox;
