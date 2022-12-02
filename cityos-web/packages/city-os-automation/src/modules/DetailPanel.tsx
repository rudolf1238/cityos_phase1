import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import Typography from '@material-ui/core/Typography';

import getTimezoneString from 'city-os-common/libs/getTimezoneString';

import { EditRuleInput } from '../api/editRule';
import { EffectiveAt, PartialRuleAutomation } from '../libs/type';
import useAutomationTranslation from '../hooks/useAutomationTranslation';

import RuleCards, { CardsRuleInput } from './RuleCards';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(3.5, 4.5),
  },

  timezone: {
    alignSelf: 'flex-start',
    color: theme.palette.grey[700],
  },

  cards: {
    width: '100%',
    overflow: 'auto',
  },
}));

interface RuleDetail extends Omit<PartialRuleAutomation, 'group' | 'effectiveAt'>, EffectiveAt {}

interface DetailPanelProps {
  rule: RuleDetail;
  onChange?: (ruleId: string, editRuleInput: EditRuleInput) => void;
}

const DetailPanel: VoidFunctionComponent<DetailPanelProps> = ({
  rule: { id: ruleId, timezone, if: triggers, then: actions, logic },
  onChange,
}: DetailPanelProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation('common');

  const handleChange = useCallback(
    (id: string, newRule: CardsRuleInput) => {
      if (!onChange) return;
      onChange(id, {
        logic: newRule.logic,
        if: newRule.if?.map((trigger) => ({
          deviceType: trigger.deviceType,
          conditions: trigger.conditions.map(({ sensorId, operator, value }) => ({
            sensorId,
            operator,
            value,
          })),
          deviceIds: trigger.devices.map(({ deviceId }) => deviceId),
          logic: trigger.logic,
        })),
        thenNotify: newRule.thenNotify?.map(({ actionType: _, users, ...rest }) => ({
          userMails: users.map(({ email }) => email),
          ...rest,
        })),
        thenDevice: newRule.thenDevice?.map(({ actionType: _, devices, ...rest }) => ({
          deviceIds: devices.map(({ deviceId }) => deviceId),
          ...rest,
        })),
      });
    },
    [onChange],
  );

  return (
    <div className={classes.root}>
      {timezone !== null && (
        <Typography variant="body2" className={classes.timezone}>
          {`${t('Time Zone')}:${getTimezoneString(timezone)}`}
        </Typography>
      )}
      <div className={classes.cards}>
        <RuleCards
          rule={{
            logic,
            id: ruleId,
            if: triggers,
            then: actions,
          }}
          onChange={onChange && handleChange}
        />
      </div>
    </div>
  );
};

export default memo(DetailPanel);
