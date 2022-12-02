import { makeStyles } from '@material-ui/core/styles';
import React, { Fragment, VoidFunctionComponent, memo, useCallback, useState } from 'react';

import Typography from '@material-ui/core/Typography';

import { SensorType } from 'city-os-common/libs/schema';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import { Logic, PartialAutomationTrigger } from '../../libs/type';
import { isLogic } from '../../libs/validators';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';
import useLogicTranslation from '../../hooks/useLogicTranslation';
import useSensorExpressionTranslation from '../../hooks/useSensorExpressionTranslation';

import IfSettingDialog from '../RuleManagement/settingDialogs/IfSettingDialog';
import RuleCardBase from './RuleCardBase';

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.primary.dark,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
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

  logic: {
    color: theme.palette.pageContainer.title,
  },
}));

interface TriggerCardProps {
  index: number;
  logic?: Logic;
  triggerRule?: PartialAutomationTrigger;
  className?: string;
  onChange?: (
    cardIdx: number,
    newSetting: PartialAutomationTrigger,
    newLogic?: Logic,
  ) => Promise<void>;
  onDelete?: (cardIdx: number) => void;
}

const TriggerCard: VoidFunctionComponent<TriggerCardProps> = ({
  index,
  logic,
  triggerRule,
  className,
  onChange,
  onDelete,
}: TriggerCardProps) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['automation', 'common']);
  const { tDevice } = useDeviceTranslation();
  const { tLogic } = useLogicTranslation();
  const { tSensorExpression } = useSensorExpressionTranslation();

  const [openSetting, setOpenSetting] = useState(false);

  const handleOpenSetting = useCallback(() => {
    setOpenSetting(true);
  }, []);

  const handleCloseSetting = useCallback(
    (newSetting?: PartialAutomationTrigger, newLogic?: Logic) => {
      if (newSetting && onChange) void onChange(index, newSetting, newLogic);
      setOpenSetting(false);
    },
    [index, onChange],
  );

  return (
    <>
      <RuleCardBase
        index={index}
        title={triggerRule && logic ? tLogic(logic) : t('automation:IF')}
        classes={{
          root: className,
          title: classes.title,
        }}
        onEdit={triggerRule && onChange && handleOpenSetting}
        onDelete={triggerRule && onDelete}
        onAdd={!triggerRule && onChange ? handleOpenSetting : undefined}
      >
        {triggerRule && (
          <div className={classes.content}>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('common:Device Type')}
              </Typography>
              <Typography className={classes.text}>{tDevice(triggerRule.deviceType)}</Typography>
            </div>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('automation:Sensor Expressions')}
              </Typography>
              <Typography className={classes.text}>
                {triggerRule.conditions.map(({ sensorId, operator, value }, idx) => {
                  const unit =
                    triggerRule.devices
                      .flatMap(({ sensors }) => sensors)
                      .find(
                        (sensor) =>
                          sensor?.sensorId === sensorId && sensor?.type === SensorType.GAUGE,
                      )?.unit || '';
                  return (
                    <Fragment key={`${sensorId}-${idx.toString()}}`}>
                      {tSensorExpression(
                        sensorId,
                        operator,
                        value.split(',').map((v) => `${v}${unit}`),
                      )}{' '}
                      {triggerRule.logic && idx < triggerRule.conditions.length - 1 && (
                        <Typography variant="subtitle1" component="span" className={classes.logic}>
                          {isLogic(triggerRule.logic)
                            ? tLogic(triggerRule.logic)
                            : triggerRule.logic}{' '}
                        </Typography>
                      )}
                    </Fragment>
                  );
                })}
              </Typography>
            </div>
            <div className={classes.item}>
              <Typography variant="caption" className={classes.subtitle}>
                {t('automation:On any one of these devices ({{count}})', {
                  count: triggerRule.devices.length,
                })}
              </Typography>
              <Typography component="span" className={classes.text}>
                {triggerRule.devices.map(({ name }) => `${name};`).join(' ')}
              </Typography>
            </div>
          </div>
        )}
      </RuleCardBase>
      {openSetting && (
        <IfSettingDialog logic={logic} trigger={triggerRule} onClose={handleCloseSetting} />
      )}
    </>
  );
};

export default memo(TriggerCard);
