import { UseTranslationResponse, useTranslation } from 'react-i18next';
import { useCallback } from 'react';

import { NotifyType } from '../libs/schema';

interface UseNotifyTranslationResponse extends Omit<UseTranslationResponse<'common'>, 't'> {
  tNotify: (notifyType: NotifyType) => string;
}

const useNotifyTranslation = (): UseNotifyTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tNotify = useCallback(
    (type: NotifyType) => {
      const mapping: Record<NotifyType, string> = {
        [NotifyType.LINE]: t('Line'),
        [NotifyType.EMAIL]: t('Email'),
        [NotifyType.SMS]: t('Sms'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tNotify,
  };
};

export default useNotifyTranslation;
