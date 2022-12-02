import { useMemo } from 'react';

import { Action, Subject } from '../libs/schema';
import { isArray } from '../libs/validators';
import { useStore } from '../reducers';

const useIsEnableRule = ({
  subject,
  action,
}: {
  subject: Subject;
  /** enable if permission rules contains any one of the actions with the subject */
  action: Action | Action[];
}): boolean => {
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const isEnable = useMemo(
    () =>
      permissionGroup?.permission.rules?.some(
        (rule) =>
          subject === rule.subject &&
          (isArray(action) ? action.includes(rule.action) : action === rule.action),
      ) || false,
    [action, subject, permissionGroup?.permission.rules],
  );

  return isEnable;
};

export default useIsEnableRule;
