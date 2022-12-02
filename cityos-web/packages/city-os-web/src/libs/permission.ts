import { Action, Rule, Subject } from 'city-os-common/libs/schema';

import { PermissionInput } from './schema';

export const basicTable: Partial<Record<Subject, Action[]>> = {
  [Subject.DASHBOARD]: [Action.VIEW],
  [Subject.LIGHTMAP]: [Action.VIEW, Action.MODIFY],
  [Subject.IVS_SURVEILLANCE]: [Action.VIEW, Action.EXPORT],
  [Subject.IVS_EVENTS]: [Action.VIEW, Action.EXPORT],
  [Subject.WIFI]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY],
  // Added by Shiger, Date:2022/5/28
  [Subject.ESIGNAGE]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY],
  [Subject.AUTOMATION_RULE_MANAGEMENT]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY],
  [Subject.DEVICE]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY, Action.EXPORT],
  [Subject.GROUP]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY],
  [Subject.USER]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY, Action.EXPORT],
  [Subject.INDOOR]: [Action.VIEW, Action.ADD, Action.REMOVE, Action.MODIFY],
};
export const basicRules = (Object.entries(basicTable) as [Subject, Action[]][]).reduce<Rule[]>(
  (rules, [subject, actions]) => {
    const newActions: Rule[] = actions.map((action) => ({ subject, action }));
    return rules.concat(newActions);
  },
  [],
);
export const basicSubjects = Object.keys(basicTable) as Subject[];

export const intersectRules = (rulesA: Rule[], rulesB?: Rule[]): Rule[] =>
  rulesB
    ? rulesA.filter(({ subject, action }) =>
        rulesB.some((maskRule) => subject === maskRule.subject && action === maskRule.action),
      )
    : rulesA;

export const subtractRules = (rules: Rule[], subtrahendRules?: Rule[]): Rule[] =>
  subtrahendRules
    ? rules.filter(({ subject, action }) =>
        subtrahendRules.every((rule) => !(rule.subject === subject && rule.action === action)),
      )
    : rules;

export const isRuleExisted = (rules: Rule[], subject?: Subject, action?: Action): boolean =>
  rules.some(
    (rule) => (!subject || rule.subject === subject) && (!action || rule.action === action),
  );

export const parseRulesToPermissionInputs = (rules: Rule[]): PermissionInput[] =>
  rules.map(({ subject, action }) => ({
    subject,
    action,
  }));
