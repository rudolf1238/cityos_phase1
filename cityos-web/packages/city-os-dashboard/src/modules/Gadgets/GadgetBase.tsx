import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';
import React, {
  FunctionComponent,
  MouseEvent,
  PropsWithChildren,
  VoidFunctionComponent,
  useCallback,
  useState,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Button from '@material-ui/core/Button';
import Card, { CardProps } from '@material-ui/core/Card';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Typography from '@material-ui/core/Typography';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';

import formatDate from 'city-os-common/libs/formatDate';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { ConfigFormType, ConfigSaveType, GadgetConfig } from '../../libs/type';
import useDashboardTranslation from '../../hooks/useDashboardTranslation';
import useGadgetTranslation from '../../hooks/useGadgetTranslation';

import GadgetLimitAlert from '../AddGadget/GadgetLimitAlert';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },

  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5, 1, 2),
  },

  iconButton: {
    width: 30,
    height: 30,
  },

  selected: {
    backgroundColor: theme.palette.action.active,
    color: theme.palette.primary.contrastText,
  },

  menuPaper: {
    width: 368,
  },

  delete: {
    color: theme.palette.error.main,

    '&:hover': {
      color: theme.palette.error.main,
    },
  },

  deleteDialog: {
    width: 'min(600px, 90vw)',
  },

  deleteDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
  },

  subtitle: {
    alignSelf: 'flex-start',
  },

  configDialog: {
    padding: theme.spacing(6, 10, 3),
    width: 1128,

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },

    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  dialogTitle: {
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 2.5),
    },
  },

  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    transform: 'translate(-50%, -50%)',
    margin: 'auto',
    width: 'min(85%, 350px)',
    height: 'min(60%, 160px)',
    textAlign: 'center',
  },

  alertAction: {
    margin: 0,
    padding: 0,
  },

  alertIcon: {
    padding: 0,
  },

  alertMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  alertButton: {
    padding: theme.spacing(0.5),
    fontWeight: theme.typography.body2.fontWeight,
  },

  limitDialog: {
    width: 600,
    height: 270,
  },

  limitDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

export interface ConfigComponentProps<T extends ConfigFormType> {
  config?: GadgetConfig<T>;
  saveType: ConfigSaveType;
  onSave: (config: GadgetConfig<T>) => void;
}

export interface GadgetBaseProps<T extends ConfigFormType> extends CardProps {
  config: GadgetConfig<T>;
  isForbidden: boolean;
  forbiddenMessage: string;
  updateTime?: Date;
  enableDuplicate: boolean;
  isDraggable: boolean;
  onDuplicate: (config: GadgetConfig<T>) => void;
  onUpdate: (config: GadgetConfig<T>) => void;
  onDelete: (deleteId: string) => void;
  ConfigComponent: VoidFunctionComponent<ConfigComponentProps<T>>;
}

const GadgetBase = <CType extends ConfigFormType>({
  config,
  isForbidden,
  forbiddenMessage,
  updateTime,
  enableDuplicate,
  isDraggable,
  onDuplicate,
  onUpdate,
  onDelete,
  ConfigComponent,
  children,
  ...props
}: PropsWithChildren<GadgetBaseProps<CType>>): ReturnType<
  FunctionComponent<GadgetBaseProps<CType>>
> => {
  const { t } = useDashboardTranslation(['common', 'dashboard', 'variables']);
  const { tGadget } = useGadgetTranslation();
  const classes = useStyles();
  const { id, type } = config;

  const [openMore, setOpenMore] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [exceedGadgetLimit, setExceedGadgetLimit] = useState(false);
  const [saveType, setSaveType] = useState<ConfigSaveType>('update');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpenMore(true);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMore(false);
  }, []);

  const handleOpenConfig = useCallback(
    (actionType: ConfigSaveType) => {
      handleCloseMenu();
      setSaveType(actionType);
      setOpenConfig(true);
    },
    [handleCloseMenu],
  );

  const handleCloseConfig = useCallback(() => {
    setOpenConfig(false);
  }, []);

  const handleUpdateConfig = useCallback(
    (newConfig: GadgetConfig<CType>) => {
      if (saveType === 'update') {
        onUpdate(newConfig);
      } else {
        const sampleConfig = cloneDeep(newConfig);
        sampleConfig.id = uuidv4();
        onDuplicate(sampleConfig);
      }
      setOpenConfig(false);
    },
    [onDuplicate, onUpdate, saveType],
  );

  const handleOpenExceedGadgetLimit = useCallback(() => {
    setExceedGadgetLimit(true);
  }, []);

  const handleCloseExceedGadgetLimit = useCallback(() => {
    setExceedGadgetLimit(false);
  }, []);

  const handleDuplicate = useCallback(() => {
    if (enableDuplicate) {
      handleOpenConfig('create');
    } else {
      handleOpenExceedGadgetLimit();
    }
    handleCloseMenu();
  }, [enableDuplicate, handleCloseMenu, handleOpenExceedGadgetLimit, handleOpenConfig]);

  const handleOpenDelete = useCallback(() => {
    setOpenDelete(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setOpenDelete(false);
    handleCloseMenu();
  }, [handleCloseMenu]);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  return (
    <Card className={classes.root} elevation={5} {...props}>
      <div className={classes.bar}>
        <Typography variant="body2" color="textSecondary">
          {updateTime !== undefined &&
            formatDate(updateTime, t('variables:dateFormat.dashboard.gadget.bar'))}
        </Typography>
        <ThemeIconButton
          color="primary"
          variant="miner"
          className={clsx(classes.iconButton, { [classes.selected]: openMore })}
          disableRipple
          onClick={handleOpenMenu}
          disabled={isDraggable}
        >
          <MoreIcon fontSize="small" />
        </ThemeIconButton>
        <Menu
          anchorEl={anchorEl}
          open={openMore}
          onClose={handleCloseMenu}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{
            paper: classes.menuPaper,
          }}
        >
          <MenuItem
            onClick={() => {
              handleOpenConfig('update');
            }}
          >
            {t('dashboard:Configure')}
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>{t('common:Duplicate')}</MenuItem>
          <MenuItem onClick={handleOpenDelete} className={classes.delete}>
            {t('common:Delete')}
          </MenuItem>
        </Menu>
      </div>
      {isForbidden ? (
        <Alert
          severity="error"
          classes={{
            root: classes.alert,
            action: classes.alertAction,
            icon: classes.alertIcon,
            message: classes.alertMessage,
          }}
          icon={<WarningRoundedIcon aria-label={t('common:warning')} fontSize="default" />}
          action={
            <Button
              size="small"
              className={classes.alertButton}
              onClick={() => {
                handleOpenConfig('update');
              }}
            >
              {t('dashboard:Configure')}
            </Button>
          }
        >
          <AlertTitle>{tGadget(config.type)}</AlertTitle>
          <Typography variant="body2" color="textPrimary">
            {forbiddenMessage}
          </Typography>
        </Alert>
      ) : (
        children
      )}
      <BaseDialog
        open={exceedGadgetLimit}
        onClose={handleCloseExceedGadgetLimit}
        title={t('dashboard:Gadget number limited_')}
        classes={{ dialog: classes.limitDialog, content: classes.limitDialogContent }}
        content={<GadgetLimitAlert onClose={handleCloseExceedGadgetLimit} />}
      />
      <BaseDialog
        open={openConfig}
        onClose={handleCloseConfig}
        title={tGadget(type)}
        titleAlign="center"
        classes={{ dialog: classes.configDialog, title: classes.dialogTitle }}
        content={
          <ConfigComponent config={config} saveType={saveType} onSave={handleUpdateConfig} />
        }
      />
      <BaseDialog
        open={openDelete}
        onClose={handleCloseDelete}
        title={t('dashboard:Delete this gadget?')}
        classes={{ dialog: classes.deleteDialog }}
        content={
          <div className={classes.deleteDialogContent}>
            <Typography variant="body1" className={classes.subtitle}>
              {t('dashboard:This gadget and its settings will be permanently deleted_')}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleDelete}>
              {t('common:Delete')}
            </Button>
          </div>
        }
      />
    </Card>
  );
};

export default GadgetBase;
