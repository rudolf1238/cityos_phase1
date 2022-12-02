import { useCallback } from 'react';

import { MaintainStatus } from '../libs/schema';
import useCommonTranslation from './useCommonTranslation';

interface UseMaintainStatusResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tMaintainStatus: (deviceStatus: MaintainStatus) => string;
}

const useMaintainStatusTranslation = (): UseMaintainStatusResponse => {
  const { t, ...methods } = useCommonTranslation('common');

  const tMaintainStatus = useCallback(
    (type: MaintainStatus) => {
      const mapping: Record<MaintainStatus, string> = {
        [MaintainStatus.DONE]: t('DONE'),
        [MaintainStatus.PROCESSING]: t('PROCESSING'),
        [MaintainStatus.ERROR]: t('ERROR'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tMaintainStatus,
  };
};

export default useMaintainStatusTranslation;
