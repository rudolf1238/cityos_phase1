import { useCallback } from 'react';

import { Action } from 'city-os-common/libs/schema';

import useWebTranslation from './useWebTranslation';

interface UseActionTypeResponse extends Omit<ReturnType<typeof useWebTranslation>, 't'> {
  tAction: (actionType: Action) => string;
}

const useActionTranslation = (): UseActionTypeResponse => {
  const { t, ...methods } = useWebTranslation('common');

  const tAction = useCallback(
    (type: Action) => {
      const mapping: Record<Action, string> = {
        [Action.VIEW]: t('View'),
        [Action.ADD]: t('Add'),
        [Action.REMOVE]: t('Remove/Delete'),
        [Action.MODIFY]: t('Modify'),
        [Action.EXPORT]: t('Export/Download'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tAction,
  };
};

export default useActionTranslation;
