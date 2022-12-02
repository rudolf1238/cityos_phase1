import { makeStyles } from '@material-ui/core/styles';
import React, { ReactElement, memo, useCallback, useMemo } from 'react';

import {
  ActionType,
  DeviceAction,
  Logic,
  NotifyAction,
  PartialAutomationTrigger,
  PartialRuleAutomation,
} from '../../libs/type';

import AddRuleDetailButton from './AddRuleDetailButton';
import NotifyCard from './NotifyCard';
import TriggerCard from './TriggerCard';
import TriggerSensorCard from './TriggerSensorCard';

const minCardCount = 1;
const cardLimit = 3;

const useStyles = makeStyles((theme) => ({
  cards: {
    display: 'flex',
    position: 'relative',
    gap: theme.spacing(3),
    alignItems: 'center',
    width: 'fit-content',

    '& > div': {
      flexShrink: 0,
    },
  },

  divider: {
    position: 'absolute',
    backgroundColor: theme.palette.grey[300],
    width: '100%',
    height: 1,
  },
}));

interface CardsRule<T extends string | undefined>
  extends Pick<PartialRuleAutomation, 'if' | 'then' | 'logic'> {
  id: T;
}

export interface CardsRuleInput {
  logic?: Logic | null;
  if?: PartialAutomationTrigger[];
  thenNotify?: NotifyAction[];
  thenDevice?: DeviceAction[];
}

export interface RuleCardsProps<T extends string | undefined> {
  rule: CardsRule<T>;
  disabledDeleteLimit?: boolean;
  onChange?: (id: T, newRule: CardsRuleInput) => void;
}

const RuleCards = <T extends string | undefined>({
  rule,
  disabledDeleteLimit = false,
  onChange,
}: RuleCardsProps<T>): ReactElement => {
  const classes = useStyles();

  const { id: ruleId, if: triggers, then: actions, logic } = rule;

  const { notifyActions, deviceActions } = useMemo(
    () =>
      actions.reduce<{
        notifyActions: NotifyAction[];
        deviceActions: DeviceAction[];
      }>(
        (allActions, action) => {
          // remove typename from API response to prevent from type error
          if (action.actionType === ActionType.NOTIFY) {
            const { actionType, users, message, snapshot } = action;
            allActions.notifyActions.push({ actionType, users, message, snapshot });
          } else {
            const { actionType, deviceType, devices, sensorId, setValue } = action;
            allActions.deviceActions.push({ actionType, deviceType, devices, sensorId, setValue });
          }
          return allActions;
        },
        { notifyActions: [], deviceActions: [] },
      ),
    [actions],
  );

  const handleEditTrigger = useCallback(
    async (cardIdx: number, newSetting: PartialAutomationTrigger, newLogic?: Logic) => {
      if (!onChange) return;
      const newTriggers = [...triggers];
      newTriggers[cardIdx] = newSetting;
      const cardsLogic = newLogic || logic;
      onChange(ruleId, {
        logic: cardsLogic,
        if: newTriggers,
      });
    },
    [onChange, triggers, logic, ruleId],
  );

  const handleEditDeviceAction = useCallback(
    async (cardIdx: number, newSetting: DeviceAction) => {
      if (!onChange) return;
      const newDeviceActions = [...deviceActions];
      newDeviceActions[cardIdx] = newSetting;
      onChange(ruleId, {
        thenDevice: newDeviceActions,
        thenNotify: notifyActions,
      });
    },
    [ruleId, deviceActions, notifyActions, onChange],
  );

  const handleEditNotifyAction = useCallback(
    async (cardIdx: number, newSetting: NotifyAction) => {
      if (!onChange) return;
      const newNotifyActions = [...notifyActions];
      newNotifyActions[cardIdx] = newSetting;
      onChange(ruleId, {
        thenDevice: deviceActions,
        thenNotify: newNotifyActions,
      });
    },
    [ruleId, deviceActions, notifyActions, onChange],
  );

  const handleDelete = useCallback(
    async (cardIdx: number, type?: ActionType) => {
      if (!onChange) return;
      if (type) {
        onChange(ruleId, {
          thenDevice: deviceActions.filter(
            (_, idx) => type !== ActionType.DEVICE || idx !== cardIdx,
          ),
          thenNotify: notifyActions.filter(
            (_, idx) => type !== ActionType.NOTIFY || idx !== cardIdx,
          ),
        });
      } else {
        const newTriggers = triggers.filter((_, idx) => idx !== cardIdx);
        onChange(ruleId, {
          logic,
          if: newTriggers,
        });
      }
    },
    [onChange, ruleId, deviceActions, notifyActions, triggers, logic],
  );

  return (
    <div className={classes.cards}>
      <div className={classes.divider} />
      {!onChange || triggers.length > 0 ? (
        triggers.map((trigger, idx) => (
          <TriggerCard
            key={`trigger-${idx.toString()}`}
            index={idx}
            logic={triggers.length > 1 && idx > 0 ? logic || Logic.AND : undefined}
            triggerRule={trigger}
            onChange={onChange && handleEditTrigger}
            onDelete={
              onChange && (disabledDeleteLimit || triggers.length > minCardCount)
                ? handleDelete
                : undefined
            }
          />
        ))
      ) : (
        <TriggerCard index={0} onChange={handleEditTrigger} />
      )}
      {onChange && triggers.length > 0 && triggers.length < cardLimit && (
        <AddRuleDetailButton
          index={triggers.length}
          logic={logic || undefined}
          onAddTrigger={handleEditTrigger}
        />
      )}
      {!onChange || notifyActions.length > 0 ? (
        notifyActions.map((action, idx) => (
          <NotifyCard
            key={`notify-${idx.toString()}`}
            index={idx}
            notifyAction={action}
            onChange={onChange && handleEditNotifyAction}
            onDelete={
              onChange &&
              (disabledDeleteLimit || deviceActions.length + notifyActions.length > minCardCount)
                ? handleDelete
                : undefined
            }
          />
        ))
      ) : (
        <NotifyCard index={0} onChange={handleEditNotifyAction} />
      )}
      {onChange && notifyActions.length > 0 && notifyActions.length < cardLimit && (
        <AddRuleDetailButton
          index={notifyActions.length}
          onAddNotifyAction={handleEditNotifyAction}
        />
      )}
      {!onChange || deviceActions.length > 0 ? (
        deviceActions.map((action, idx) => (
          <TriggerSensorCard
            key={`triggerSensor-${idx.toString()}`}
            index={idx}
            deviceAction={action}
            onChange={onChange && handleEditDeviceAction}
            onDelete={
              onChange &&
              (disabledDeleteLimit || deviceActions.length + notifyActions.length > minCardCount)
                ? handleDelete
                : undefined
            }
          />
        ))
      ) : (
        <TriggerSensorCard index={0} onChange={handleEditDeviceAction} />
      )}
      {onChange && deviceActions.length > 0 && deviceActions.length < cardLimit && (
        <AddRuleDetailButton
          index={deviceActions.length}
          onAddDeviceAction={handleEditDeviceAction}
        />
      )}
    </div>
  );
};

export default memo(RuleCards) as typeof RuleCards;
