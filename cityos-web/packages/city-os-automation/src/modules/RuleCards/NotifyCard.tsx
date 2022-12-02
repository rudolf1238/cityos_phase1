import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';

import Typography from '@material-ui/core/Typography';

import { ActionType, NotifyAction } from '../../libs/type';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import NotifySettingDialog from '../RuleManagement/settingDialogs/NotifySettingDialog';
import RuleCardBase from './RuleCardBase';

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.secondary.main,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  subtitle: {
    color: theme.palette.grey[500],
  },

  text: {
    color: theme.palette.grey[700],
  },
}));

interface NotifyCardProps {
  index: number;
  notifyAction?: NotifyAction;
  className?: string;
  onChange?: (cardIdx: number, newSetting: NotifyAction) => Promise<void>;
  onDelete?: (cardIdx: number, type?: ActionType) => void;
}

const NotifyCard: VoidFunctionComponent<NotifyCardProps> = ({
  index,
  notifyAction,
  className,
  onChange,
  onDelete,
}: NotifyCardProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['automation', 'common']);

  const [openSetting, setOpenSetting] = useState(false);

  const handleDelete = useCallback(
    (cardIdx: number) => {
      if (onDelete) onDelete(cardIdx, ActionType.NOTIFY);
    },
    [onDelete],
  );

  const handleOpenSetting = useCallback(() => {
    setOpenSetting(true);
  }, []);

  const handleCloseSettingDialog = useCallback(
    (newSetting?: NotifyAction) => {
      if (newSetting && onChange) void onChange(index, newSetting);
      setOpenSetting(false);
    },
    [index, onChange],
  );

  return (
    <>
      <RuleCardBase
        index={index}
        title={t('automation:NOTIFY')}
        classes={{ root: className, title: classes.title }}
        onEdit={notifyAction && onChange && handleOpenSetting}
        onDelete={notifyAction && onDelete && handleDelete}
        onAdd={!notifyAction && onChange ? handleOpenSetting : undefined}
      >
        {notifyAction && (
          <div className={classes.content}>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('automation:User ({{count}})', { count: notifyAction.users.length })}
              </Typography>
              <Typography className={classes.text}>
                {notifyAction.users.map(({ name }) => `${name};`).join(' ')}
              </Typography>
            </div>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('automation:Content')}
              </Typography>
              <Typography className={classes.text}>{notifyAction.message}</Typography>
            </div>
          </div>
        )}
      </RuleCardBase>
      {openSetting && (
        <NotifySettingDialog notifyAction={notifyAction} onClose={handleCloseSettingDialog} />
      )}
    </>
  );
};

export default memo(NotifyCard);
