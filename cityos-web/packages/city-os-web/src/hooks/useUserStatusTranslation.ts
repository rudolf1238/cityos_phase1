import { useCallback } from 'react';

import { UserStatus } from 'city-os-common/libs/schema';

import useWebTranslation from './useWebTranslation';

interface UseUserStatusResponse extends Omit<ReturnType<typeof useWebTranslation>, 't'> {
  tUserStatus: (uerStatus: UserStatus) => string;
}

const useUserStatusTranslation = (): UseUserStatusResponse => {
  const { t, ...methods } = useWebTranslation('common');

  const tUserStatus = useCallback(
    (type: UserStatus) => {
      const mapping: Record<UserStatus, string> = {
        [UserStatus.ACTIVE]: t('ACTIVE'),
        [UserStatus.SUSPEND]: t('SUSPEND'),
        [UserStatus.WAITING]: t('WAITING'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tUserStatus,
  };
};

export default useUserStatusTranslation;
