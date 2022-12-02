import { makeStyles, styled } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  FunctionComponent,
  PropsWithChildren,
  VoidFunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Divider,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  TextareaAutosize,
} from '@material-ui/core';
import { FetchResult, useApolloClient, useMutation } from '@apollo/client';
import { PhotoCamera, Send } from '@material-ui/icons';
import {
  UPDATE_MESSAGEBOARD_SON,
  UpdateMessageboardSonInput,
  UpdateMessageboardSonPayload,
  UpdateMessageboardSonResponse,
} from '../../api/updateMessageboardSon';
import { isString } from 'lodash';
import { useForm } from 'react-hook-form';
import { useStore } from 'city-os-common/reducers';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';
import isGqlError from 'city-os-common/libs/isGqlError';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
import { MyContext, useMyContext } from '../../modules/Abnormals/AbnormalMessagecontext';
import uploadImg from '../../api/uploadImg';

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
  id: any;
  onSubmitMessage?: any;
  onCallUpdateBox: any;
  text?: string;
  time?: string;
  responseArray?: [];
}
interface FormDataName {
  name: string;
}
interface FormDataText {
  text: string;
}
// const AbnormalInputBox: FunctionComponent<InputProps> = ({

// }: PropsWithChildren<InputProps>) => {
interface UpdateMessageboardSonForm {
  id: string;
  deviceId: string;
  content: string;
  user: string | undefined;
  status: string;
  file: string;
}

const UpdateAbnormalInputBoxSon: FunctionComponent<InputProps> = ({
  onSubmitMessage,
  id,
  onCallUpdateBox,
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
    userProfile: { permissionGroup, divisionGroup, joinedGroups },
  } = useStore();
  const classes = useStyles();
  const client = useApolloClient();
  const isMountedRef = useIsMountedRef();
  const [hasNewOption, setHasNewOption] = useState(false);
  const groupId = divisionGroup?.id;
  const userEmail = user.email;

  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    watch,
    reset,
    formState: { isValid, isDirty, errors },
  } = useForm<UpdateMessageboardSonForm>({
    defaultValues: {
      id,
      deviceId,
      content: '',
      user: '',
      status: '',
      file: '',

      // permission: [],
    },
    mode: 'onChange',
  });

  // selection optional
  const [status, setStatus] = React.useState('');
  const handleChange = (event: any) => {
    setStatus(event.target.value);
    setValue('status', event.target.value, { shouldDirty: true });
  };

  const handleMessageChange = (e: any) => {
    setInput(e.target.value);
    setValue('content', e.target.value, { shouldDirty: true });
    console.log(`content:${e.target.value}`);
    console.log(`getcontent:${getValues('content')}`);
  };

  // TODO:IMAGE
  const handleOnChangeImage = async (event: any) => {
    if (event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0];
      const fileID = (await uploadImg({ file })).fileInfo._id;
      setValue('file', fileID, { shouldDirty: true });
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
    }: UpdateMessageboardSonInput): Promise<FetchResult<UpdateMessageboardSonResponse> | void> => {
      console.log(`deviceId:${watch('deviceId')}`);
      console.log(`id:${watch('id')}`);
      console.log(`content:${watch('content')}`);
      console.log(`user:${watch('user')}`);
      console.log(`file:${watch('file')}`);
      return updateMessageboardSon({
        variables: {
          groupId,
          UpdateMessageboardSonInput: {
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
    [groupId, UpdateAbnormalInputBoxSon],
  );

  const { isvalue, setIsvalue, isvaluestate, setIsvaluestate } = useMyContext();
  const handleSave = useCallback(
    async (currentData: UpdateMessageboardSonInput) => {
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

  const [updateMessageboardSon] = useMutation<
    UpdateMessageboardSonResponse,
    UpdateMessageboardSonPayload
  >(UPDATE_MESSAGEBOARD_SON, {
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
      const isExistedError = isGqlError(error, ErrorCode.USER_ALREADY_EXISTED);
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: 'Send fail, Please try again.',
        },
      });
    },
  });
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

export default UpdateAbnormalInputBoxSon;
