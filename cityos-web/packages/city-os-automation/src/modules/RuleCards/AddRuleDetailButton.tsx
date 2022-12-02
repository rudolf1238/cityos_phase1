import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { DeviceAction, Logic, NotifyAction, PartialAutomationTrigger } from '../../libs/type';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import IfSettingDialog from '../RuleManagement/settingDialogs/IfSettingDialog';
import NotifySettingDialog from '../RuleManagement/settingDialogs/NotifySettingDialog';
import TriggerSensorSettingDialog from '../RuleManagement/settingDialogs/TriggerSensorSettingDialog';

const useStyles = makeStyles(() => ({
  addButton: {
    width: 48,
    height: 48,
  },
}));

interface AddRuleDetailBaseProps {
  index: number;
  logic?: Logic;
  className?: string;
  onAddTrigger?: never;
  onAddDeviceAction?: never;
  onAddNotifyAction?: never;
}

interface AddTriggerProps extends Omit<AddRuleDetailBaseProps, 'onAddTrigger'> {
  onAddTrigger: (cardIdx: number, setting: PartialAutomationTrigger, logic: Logic) => Promise<void>;
}

interface AddDeviceActionProps extends Omit<AddRuleDetailBaseProps, 'onAddDeviceAction'> {
  onAddDeviceAction: (cardIdx: number, setting: DeviceAction) => Promise<void>;
}

interface AddNotifyActionProps extends Omit<AddRuleDetailBaseProps, 'onAddNotifyAction'> {
  onAddNotifyAction: (cardIdx: number, setting: NotifyAction) => Promise<void>;
}

type AddRuleDetailButtonProps = AddTriggerProps | AddDeviceActionProps | AddNotifyActionProps;

const AddRuleDetailButton: VoidFunctionComponent<AddRuleDetailButtonProps> = ({
  index,
  logic = Logic.AND,
  className,
  onAddTrigger,
  onAddDeviceAction,
  onAddNotifyAction,
}: AddRuleDetailButtonProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation('common');
  const [open, setOpen] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseTrigger = useCallback(
    (newTrigger?: PartialAutomationTrigger, newLogic?: Logic) => {
      if (onAddTrigger && newTrigger) void onAddTrigger(index, newTrigger, newLogic || Logic.AND);
      setOpen(false);
    },
    [index, onAddTrigger],
  );

  const handleCloseDeviceAction = useCallback(
    (submitData?: DeviceAction) => {
      if (onAddDeviceAction && submitData) void onAddDeviceAction(index, submitData);
      setOpen(false);
    },
    [index, onAddDeviceAction],
  );

  const handleCloseNotifyAction = useCallback(
    (submitData?: NotifyAction) => {
      if (onAddNotifyAction && submitData) void onAddNotifyAction(index, submitData);
      setOpen(false);
    },
    [index, onAddNotifyAction],
  );

  return (
    <>
      <ThemeIconButton
        color="primary"
        variant="contained"
        tooltip={t('Create')}
        className={clsx(classes.addButton, className)}
        onClick={handleOpenDialog}
      >
        <AddIcon />
      </ThemeIconButton>
      {onAddTrigger && open && <IfSettingDialog logic={logic} onClose={handleCloseTrigger} />}
      {onAddDeviceAction && open && (
        <TriggerSensorSettingDialog onClose={handleCloseDeviceAction} />
      )}
      {onAddNotifyAction && open && <NotifySettingDialog onClose={handleCloseNotifyAction} />}
    </>
  );
};

export default memo(AddRuleDetailButton);
