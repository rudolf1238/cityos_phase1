import { makeStyles } from '@material-ui/core/styles';
import { rawTimeZones } from '@vvo/tzdb';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import formatDate from 'city-os-common/libs/formatDate';
import getGenealogy from 'city-os-common/libs/getGenealogy';
import getTimezoneString from 'city-os-common/libs/getTimezoneString';
import omitTypenameDeep from 'city-os-common/libs/omitTypenameDeep';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  ActionType,
  AutomationAction,
  DeviceActionInput,
  EffectiveAt,
  Logic,
  NotifyActionInput,
  PartialAutomationTrigger,
} from '../../libs/type';
import { CREATE_RULE, CreateRulePayload, CreateRuleResponse } from '../../api/createRule';
import { SEARCH_RULES, SearchRulesPayload, SearchRulesResponse } from '../../api/searchRules';
import useAutomationTranslation from '../../hooks/useAutomationTranslation';

import EditClockIcon from '../../assets/edit-clock.svg';
import I18nAutomationProvider from '../I18nAutomationProvider';
import RuleCards, { CardsRuleInput } from '../RuleCards';
import TimeSettingDialog from './settingDialogs/TimeSettingDialog';
import WeekDayChips from '../WeekDayChips';

const useStyles = makeStyles((theme) => ({
  header: {
    justifyContent: 'space-between',
    padding: theme.spacing(0, 4.5),
    maxWidth: 'min(100%, 100vw)',
  },

  buttons: {
    display: 'flex',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },

  fixedContainer: {
    display: 'flex',
    background: theme.palette.background.evenRow,
    width: '100%',
    minHeight: 600,
    overflowX: 'auto',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4.5),
    padding: theme.spacing(3, 4.5, 10),
  },

  effectiveAt: {
    display: 'flex',
    width: 'max-content',
  },

  division: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),

    '& > $subtitle': {
      padding: 0,
    },
  },

  effectiveItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 'fit-content',

    '&:first-child > $subtitle': {
      padding: 0,
    },

    '&:first-child > $effectiveField': {
      borderWidth: 0,
      paddingLeft: 0,
      maxWidth: 180,
    },
  },

  subtitle: {
    padding: theme.spacing(0, 2),
    color: theme.palette.grey[500],
  },

  effectiveField: {
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(1, 2),
  },

  ruleNameField: {
    width: 672,
  },

  loading: {
    margin: 'auto',
  },
}));

const AddRule: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useAutomationTranslation(['automation', 'common', 'mainLayout', 'variables']);
  const router = useRouter();
  const {
    userProfile: { divisionGroup, joinedGroups },
    dispatch,
  } = useStore();
  const [openTimeSettingDialog, setOpenTimeSettingDialog] = useState(false);

  const copyRuleId = isString(router.query.copyId) ? router.query.copyId : undefined;
  const backLink = isString(router.query.back) ? router.query.back : undefined;

  const [ruleName, setRuleName] = useState<string>('');
  const [logic, setLogic] = useState<Logic>();
  const [effectiveAt, setEffectiveAt] = useState<EffectiveAt>(() => ({
    timezone:
      rawTimeZones.find(({ name }) => name === Intl.DateTimeFormat().resolvedOptions().timeZone)
        ?.name || '',
    effectiveDate: {
      startMonth: 1,
      startDay: 1,
      endMonth: 12,
      endDay: 31,
    },
    effectiveTime: {
      fromHour: 0,
      fromMinute: 0,
      toHour: 23,
      toMinute: 59,
    },
    effectiveWeekday: [1, 2, 3, 4, 5, 6, 7],
  }));
  const [triggers, setTriggers] = useState<PartialAutomationTrigger[]>([]);
  const [actions, setActions] = useState<AutomationAction[]>([]);

  const [createRule] = useMutation<CreateRuleResponse, CreateRulePayload>(CREATE_RULE, {
    onCompleted: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'success',
          message: t('automation:The rule has been added successfully_'),
        },
      });
      void router.push('/rule-management');
    },
    onError: () => {
      dispatch({
        type: ReducerActionType.ShowSnackbar,
        payload: {
          severity: 'error',
          message: t('automation:Failed to add rule_ Please try again_'),
        },
      });
    },
  });

  const { loading } = useQuery<SearchRulesResponse, SearchRulesPayload>(SEARCH_RULES, {
    skip: !divisionGroup?.id || !copyRuleId,
    variables: {
      groupId: divisionGroup?.id || '',
      filter: {
        keyword: copyRuleId,
      },
    },
    onCompleted: ({ searchRules }) => {
      const targetRule = searchRules.edges.find(({ node }) => node.id === copyRuleId)?.node;
      if (!targetRule) return;
      const newRule = omitTypenameDeep(targetRule);
      setRuleName(newRule.name);
      setLogic(newRule.logic || undefined);
      setEffectiveAt(newRule.effectiveAt);
      setTriggers(newRule.if);
      setActions(newRule.then);
    },
  });

  const handleCreateRule = useCallback(async () => {
    if (!ruleName || !divisionGroup?.id) return;
    const newTriggers = triggers.map(
      ({ deviceType, devices, logic: settingLogic, conditions }) => ({
        deviceType,
        deviceIds: devices.map(({ deviceId }) => deviceId),
        logic: settingLogic || undefined,
        conditions,
      }),
    );

    const { thenNotify, thenDevice } = actions.reduce<{
      thenNotify: NotifyActionInput[];
      thenDevice: DeviceActionInput[];
    }>(
      (allActions, action) => {
        if (action.actionType === ActionType.NOTIFY) {
          const { users, message, snapshot } = action;
          allActions.thenNotify.push({
            userMails: users.map(({ email }) => email),
            message,
            snapshot,
          });
        } else {
          const { deviceType, devices, sensorId, setValue } = action;
          allActions.thenDevice.push({
            deviceIds: devices.map(({ deviceId }) => deviceId),
            deviceType,
            sensorId,
            setValue,
          });
        }
        return allActions;
      },
      { thenNotify: [], thenDevice: [] },
    );

    await createRule({
      variables: {
        createRuleInput: {
          groupId: divisionGroup.id,
          name: ruleName,
          effectiveAtInput: effectiveAt,
          logic,
          if: newTriggers,
          thenNotify,
          thenDevice,
        },
      },
    });
  }, [actions, createRule, divisionGroup?.id, effectiveAt, logic, ruleName, triggers]);

  const handleBack = useCallback(() => {
    void router.push(backLink || subjectRoutes[Subject.AUTOMATION_RULE_MANAGEMENT]);
  }, [backLink, router]);

  const handleOpenTimeSettingDialog = useCallback(() => {
    setOpenTimeSettingDialog(true);
  }, []);

  const handleCloseTimeSettingDialog = useCallback((timeSetting?: EffectiveAt) => {
    if (timeSetting) {
      setEffectiveAt(timeSetting);
    }
    setOpenTimeSettingDialog(false);
  }, []);

  const handleChangeRuleName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRuleName(e.target.value);
  }, []);

  const handleChangeCardsRule = useCallback((_, newRule: CardsRuleInput) => {
    if (newRule.logic) setLogic(newRule.logic);
    if (newRule.if) setTriggers(newRule.if);
    if (newRule.thenNotify || newRule.thenDevice) {
      setActions([
        ...(newRule.thenNotify ? newRule.thenNotify : []),
        ...(newRule.thenDevice ? newRule.thenDevice : []),
      ]);
    }
  }, []);

  const groupGenealogy: string = useMemo(
    () => (divisionGroup?.id && joinedGroups ? getGenealogy(divisionGroup.id, joinedGroups) : ''),
    [divisionGroup, joinedGroups],
  );

  return (
    <I18nAutomationProvider>
      <MainLayout>
        <Guard subject={Subject.AUTOMATION_RULE_MANAGEMENT} action={Action.ADD}>
          <PageWithFooter>
            <Header
              title={copyRuleId ? t('automation:Duplicate Rule') : t('automation:New Rule')}
              backLinkText={t('mainLayout:Rule Management')}
              backLinkHref={backLink || subjectRoutes[Subject.AUTOMATION_RULE_MANAGEMENT]}
              classes={{ root: classes.header }}
            >
              <div className={classes.buttons}>
                <Button variant="outlined" color="primary" size="small" onClick={handleBack}>
                  {t('common:Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={!ruleName || !triggers.length || !actions.length}
                  onClick={handleCreateRule}
                >
                  {copyRuleId ? t('common:Duplicate') : t('common:Create')}
                </Button>
              </div>
            </Header>
            <div className={classes.fixedContainer}>
              {loading ? (
                <CircularProgress className={classes.loading} />
              ) : (
                <div className={classes.container}>
                  <div className={classes.effectiveAt}>
                    <div className={classes.effectiveItem}>
                      <Typography variant="caption" className={classes.subtitle}>
                        {t('common:Time Zone')}
                      </Typography>
                      <Typography className={classes.effectiveField}>
                        {getTimezoneString(effectiveAt.timezone)}
                      </Typography>
                    </div>
                    <div className={classes.effectiveItem}>
                      <Typography variant="caption" className={classes.subtitle}>
                        {t('automation:Effective Date')}
                      </Typography>
                      <Typography className={classes.effectiveField}>
                        {`${formatDate(
                          {
                            month: effectiveAt.effectiveDate.startMonth - 1,
                            date: effectiveAt.effectiveDate.startDay,
                          },
                          t('variables:dateFormat.automation.monthDay'),
                        )} ~ ${formatDate(
                          {
                            month: effectiveAt.effectiveDate.endMonth - 1,
                            date: effectiveAt.effectiveDate.endDay,
                          },
                          t('variables:dateFormat.automation.monthDay'),
                        )}`}
                      </Typography>
                    </div>
                    <div className={classes.effectiveItem}>
                      <Typography variant="caption" className={classes.subtitle}>
                        {t('automation:Days of The Week')}
                      </Typography>
                      <WeekDayChips
                        effectiveWeekday={effectiveAt.effectiveWeekday}
                        className={classes.effectiveField}
                      />
                    </div>
                    <div className={classes.effectiveItem}>
                      <Typography variant="caption" className={classes.subtitle}>
                        {t('automation:Effective Time')}
                      </Typography>
                      <Typography className={classes.effectiveField}>{`${formatDate(
                        {
                          hours: effectiveAt.effectiveTime.fromHour,
                          minutes: effectiveAt.effectiveTime.fromMinute,
                        },
                        t('variables:dateFormat.common.hourMinute'),
                      )} ~ ${formatDate(
                        {
                          hours: effectiveAt.effectiveTime.toHour,
                          minutes: effectiveAt.effectiveTime.toMinute,
                        },
                        t('variables:dateFormat.common.hourMinute'),
                      )}`}</Typography>
                    </div>
                    <div>
                      <ThemeIconButton
                        color="primary"
                        tooltip={t('common:Edit')}
                        onClick={handleOpenTimeSettingDialog}
                      >
                        <EditClockIcon />
                      </ThemeIconButton>
                    </div>
                  </div>
                  <div className={classes.ruleNameField}>
                    <TextField
                      type="text"
                      label={t('automation:Rule Name')}
                      placeholder={t('automation:Rule description_')}
                      value={ruleName}
                      variant="outlined"
                      required
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={handleChangeRuleName}
                    />
                  </div>
                  <RuleCards
                    disabledDeleteLimit
                    rule={{
                      logic,
                      id: undefined,
                      if: triggers,
                      then: actions,
                    }}
                    onChange={handleChangeCardsRule}
                  />
                  <div className={classes.division}>
                    <Typography variant="caption" className={classes.subtitle}>
                      {t('common:Division')}
                    </Typography>
                    <Typography>{groupGenealogy}</Typography>
                  </div>
                </div>
              )}
            </div>
            <TimeSettingDialog
              open={openTimeSettingDialog}
              effectiveAt={effectiveAt}
              onClose={handleCloseTimeSettingDialog}
            />
          </PageWithFooter>
        </Guard>
      </MainLayout>
    </I18nAutomationProvider>
  );
};

export default memo(AddRule);
