import { InputBaseComponentProps } from '@material-ui/core/InputBase';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import React, {
  FocusEvent,
  RefObject,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import DeleteIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { User } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import CircleCheckbox from 'city-os-common/modules/Checkbox';
import InfoIcon from 'city-os-common/assets/icon/info.svg';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { ActionType, NotifyAction, NotifyContentTag } from '../../../../libs/type';
import useAutomationTranslation from '../../../../hooks/useAutomationTranslation';

import SearchUserField from './SearchUserField';

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: theme.spacing(4, 8),
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1),
    width: 588,
  },

  receiverInput: {
    gap: theme.spacing(1),
    margin: theme.spacing(1),
    padding: theme.spacing(2, 1),
    height: 120,
    overflow: 'auto',
  },

  receiverChip: {
    background: theme.palette.background.textFieldChip,
    padding: theme.spacing(0, 1.5),
    color: theme.palette.text.primary,
    fontSize: theme.typography.subtitle2.fontSize,

    '& > $deleteIcon': {
      margin: 0,
    },
  },

  receiverChipLabel: {
    padding: theme.spacing(0, 0.25),
  },

  deleteIcon: {
    color: theme.palette.primary.main,

    '&:hover': {
      color: theme.palette.primary.light,
    },
  },

  contentField: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    whiteSpace: 'pre-wrap',
  },

  contentInputWrapper: {
    padding: theme.spacing(1),
    width: '100%',
  },

  contentInputScroll: {
    padding: theme.spacing(4, 1),
    height: 260,
    overflow: 'auto',
  },

  contentInputRoot: {
    position: 'relative',
    minHeight: '100%',
  },

  contentInputView: {
    height: '100%',
    wordBreak: 'break-all',
    pointerEvents: 'none',
  },

  contentInputEdit: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    wordBreak: 'break-all',
    color: 'transparent',
    caretColor: theme.palette.text.primary,
  },

  highlight: {
    color: theme.palette.primary.main,
  },

  tagWrapper: {
    background: theme.palette.background.oddRow,
    padding: theme.spacing(1.5, 0),
    width: '100%',

    '& > button': {
      marginLeft: theme.spacing(1),
    },

    '& > button:first-child': {
      marginLeft: 0,
    },

    '& $infoButton': {
      marginLeft: theme.spacing(0.5),
    },
  },

  contentTag: {
    borderWidth: 1,
    padding: theme.spacing(1, 0.5),
    minWidth: 160,

    '&:hover': {
      borderWidth: 1,
    },
  },

  infoButton: {
    padding: 0,
    width: 24,
    height: 24,
  },

  contentInfo: {
    gap: theme.spacing(2.5),
    padding: theme.spacing(0, 1, 0, 3.5),
  },

  snapshotInfo: {
    gap: theme.spacing(2.5),
    padding: theme.spacing(1, 2),
  },

  snapshotText: {
    margin: theme.spacing(0, 0.5, 0, 1.5),
  },

  dialogButton: {
    alignSelf: 'center',
    marginTop: theme.spacing(2),
  },
}));

const isContentTagElement = (target: unknown) =>
  target instanceof Element && target.getAttribute('data-type') === 'content-tag';

const CustomContentInput: VoidFunctionComponent<InputBaseComponentProps> = ({
  inputRef,
  value,
  className,
  ...rest
}: InputBaseComponentProps) => {
  const classes = useStyles();

  const markedText = useMemo(() => {
    if (!isString(value)) return '';
    const targetStrings = Object.values(NotifyContentTag).map((text) => `%${text}%`);
    return value.split(new RegExp(`(${targetStrings.join('|')})`, 'ig')).map((text, idx) =>
      idx % 2 === 1 ? (
        // eslint-disable-next-line react/no-array-index-key
        <span key={idx.toString()} className={classes.highlight}>
          {text}
        </span>
      ) : (
        text
      ),
    );
  }, [value, classes.highlight]);

  return (
    <div className={classes.contentInputWrapper}>
      <div className={classes.contentInputScroll}>
        <div className={classes.contentInputRoot}>
          <div className={clsx(className, classes.contentInputView)}>{markedText}</div>
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={value as string}
            {...rest}
            className={clsx(className, classes.contentInputEdit)}
          />
        </div>
      </div>
    </div>
  );
};

interface NotifySettingDialogProps {
  notifyAction?: NotifyAction;
  onClose: (submitData?: NotifyAction) => void;
}

const NotifySettingDialog: VoidFunctionComponent<NotifySettingDialogProps> = ({
  notifyAction,
  onClose,
}: NotifySettingDialogProps) => {
  const { t } = useAutomationTranslation(['common', 'automation']);
  const classes = useStyles();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<NotifyAction>({
    mode: 'onChange',
    defaultValues: {
      actionType: ActionType.NOTIFY,
      users: notifyAction?.users,
      message: notifyAction?.message,
      snapshot: notifyAction?.snapshot || false,
    },
  });

  const users = watch('users');
  const message = watch('message');
  const snapshot = watch('snapshot');

  const onReceiverDelete = useCallback(
    (idx: number) => {
      if (!users) return;
      const newUsers = [...users];
      newUsers.splice(idx, 1);
      setValue('users', newUsers, { shouldValidate: true });
    },
    [users, setValue],
  );

  const onTagClick = useCallback(
    (tag: NotifyContentTag) => {
      const element = textAreaRef.current;
      if (!element) return;

      const tagText = `%${tag}%`;
      const newMessage = `${message.slice(0, element.selectionStart)}${tagText}${message.slice(
        element.selectionEnd,
      )}`;
      const newSelectionStart = element.selectionStart + tagText.length;

      setValue('message', newMessage, { shouldValidate: true });
      element.focus();
      element.setSelectionRange(newSelectionStart, newSelectionStart);
    },
    [message, setValue],
  );

  const onSnapshotToggle = useCallback(() => {
    setValue('snapshot', !snapshot, { shouldValidate: true });
  }, [snapshot, setValue]);

  const onUserAdd = useCallback(
    (addedUser: Pick<User, 'email' | 'name'>) => {
      const newUsers = users ? [...users] : [];
      if (
        newUsers.every(({ email, name }) => email !== addedUser.email && name !== addedUser.name)
      ) {
        newUsers.push(addedUser);
      }
      setValue('users', newUsers, { shouldValidate: true });
    },
    [users, setValue],
  );

  const onSubmit = useCallback(
    (submitData: NotifyAction) => {
      onClose(submitData);
    },
    [onClose],
  );

  const renderReceiverInput = useCallback(
    () => (
      <Grid
        container
        wrap="wrap"
        alignContent="flex-start"
        alignItems="flex-start"
        spacing={1}
        className={classes.receiverInput}
      >
        {users?.map(({ email, name }, idx) => (
          <Chip
            key={email}
            label={name || email}
            className={classes.receiverChip}
            classes={{
              root: classes.receiverChip,
              label: classes.receiverChipLabel,
              deleteIcon: classes.deleteIcon,
            }}
            variant="outlined"
            deleteIcon={<DeleteIcon />}
            onDelete={() => onReceiverDelete(idx)}
          />
        ))}
      </Grid>
    ),
    [users, classes, onReceiverDelete],
  );

  const infoList: Record<NotifyContentTag, string> = useMemo(
    () => ({
      [NotifyContentTag.TRIGGERED_TIME]: t(
        'automation:The time that the rule was triggered at, e_g_, 03/21 23_49_',
      ),
      [NotifyContentTag.TRIGGERED_EXPRESSION]: t(
        'automation:The expressions that made the rule was triggered, e_g_, deviceA humidity > 10 AND deviceB temperature > 25_',
      ),
      [NotifyContentTag.TRIGGERED_CURRENT_VALUE]: t(
        'automation:The sensor value that made the rule was triggered, e_g_, deviceA humidity = 20 AND deviceB temperature = 30_',
      ),
    }),
    [t],
  );

  useEffect(() => {
    register('users', { validate: (value) => value !== undefined && value.length > 0 });
    register('message', { validate: (value) => value !== undefined && value.trim() !== '' });
    register('snapshot');
  }, [register]);

  return (
    <BaseDialog
      open
      onClose={() => onClose()}
      title={t('automation:NOTIFY')}
      classes={{
        dialog: classes.dialog,
      }}
      content={
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
          <SearchUserField onAdd={onUserAdd} />
          <TextField
            fullWidth
            type="text"
            variant="outlined"
            label={t('automation:Receiver List')}
            value={users}
            inputProps={register('users')}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              inputComponent: renderReceiverInput,
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            inputRef={textAreaRef}
            fullWidth
            type="text"
            variant="outlined"
            label={t('automation:Content')}
            value={message}
            inputProps={register('message')}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              className: classes.contentField,
              onBlur: ({ relatedTarget }: FocusEvent<HTMLTextAreaElement>) => {
                if (isContentTagElement(relatedTarget)) return;
                textAreaRef.current?.setSelectionRange(message.length, message.length);
              },
              inputComponent: CustomContentInput,
              endAdornment: (
                <Grid container alignItems="center" justify="center" className={classes.tagWrapper}>
                  {Object.values(NotifyContentTag).map((tag) => (
                    <Button
                      key={tag}
                      variant="outlined"
                      color="primary"
                      size="small"
                      data-type="content-tag"
                      className={classes.contentTag}
                      onClick={() => {
                        onTagClick(tag);
                      }}
                    >
                      <Typography variant="overline">%{tag}%</Typography>
                    </Button>
                  ))}
                  <ThemeIconButton
                    color="primary"
                    variant="standard"
                    tooltipVariant="standard"
                    tooltip={
                      <Grid
                        container
                        component="ul"
                        direction="column"
                        className={classes.contentInfo}
                      >
                        {Object.entries(infoList).map(([title, desc]) => (
                          <li key={title}>
                            <Typography variant="subtitle2" component="span">
                              {`%${title}% : `}
                            </Typography>
                            <Typography variant="body2" component="span">
                              {desc}
                            </Typography>
                          </li>
                        ))}
                      </Grid>
                    }
                    classes={{ root: classes.infoButton }}
                  >
                    <InfoIcon />
                  </ThemeIconButton>
                </Grid>
              ),
            }}
            InputLabelProps={{ shrink: true }}
            multiline
          />
          <Grid container alignItems="center">
            <CircleCheckbox checked={snapshot} onChange={onSnapshotToggle} />
            <Typography variant="body1" className={classes.snapshotText}>
              {t('automation:Attach updated snapshot(s)')}
            </Typography>
            <ThemeIconButton
              color="primary"
              variant="standard"
              tooltipVariant="standard"
              tooltip={
                <Grid container direction="column" className={classes.snapshotInfo}>
                  <Typography variant="body2" component="span">
                    {t(
                      'automation:Check this checkbox to attach the snapshot(s) in the notification when the rule is triggered in case the "triggered expression(s)" contains at least one sensor with the type "snapshot"_',
                    )}
                  </Typography>
                  <Typography variant="body2" component="span">
                    {t(
                      'automation:For example, the sensor "car_snapshot" of cameraA is a sensor of the "snapshot" type_ And there is a rule with the condition "cameraA car_flow > 10 AND cameraA car_snapshot updated in 10 seconds_" Then the notification content will attach the image "car_snapshot" of cameraA when this rule is triggered_ If this checkbox is checked_',
                    )}
                  </Typography>
                </Grid>
              }
              classes={{ root: classes.infoButton }}
            >
              <InfoIcon />
            </ThemeIconButton>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            size="small"
            color="primary"
            className={classes.dialogButton}
            disabled={!isValid}
          >
            {t('common:OK')}
          </Button>
        </form>
      }
    />
  );
};

export default memo(NotifySettingDialog);
