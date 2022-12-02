import { useCallback } from 'react';

import { Subject } from '../libs/schema';

import useCommonTranslation from './useCommonTranslation';

interface UseSubjectTypeResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tSubject: (subjectType: Subject) => string;
}

const useSubjectTranslation = (): UseSubjectTypeResponse => {
  const { t, ...methods } = useCommonTranslation(['common', 'mainLayout']);

  const tSubject = useCallback(
    (type: Subject) => {
      const mapping: Record<Subject, string> = {
        [Subject.DASHBOARD]: t('common:Dashboard'),
        [Subject.LIGHTMAP]: t('mainLayout:Smart Pole'),
        [Subject.IVS_SURVEILLANCE]: t('mainLayout:Surveillance'),
        [Subject.IVS_EVENTS]: t('mainLayout:Events'),
        // [Subject.WIFI_AREA]: t('mainLayout:Area'),
        // [Subject.WIFI_ADVERTISEMENT]: t('mainLayout:Advertisement'),
        [Subject.WIFI]: t('mainLayout:WIFI'),
        [Subject.DEVICE]: t('mainLayout:Device'),
        [Subject.GROUP]: t('common:Division'),
        [Subject.USER]: t('mainLayout:User'),
        [Subject.RECYCLE_BIN]: t('common:Recycle Bin'),
        [Subject.ROLE_TEMPLATE]: t('common:Role Template'),
        [Subject.ELASTIC_SEARCH]: t('mainLayout:Elastic Search'),
        [Subject.ABNORMAL_MANAGEMENT]: t('mainLayout:Abnormal Management'),
        // [Subject.MAINTENANCE_STAFF]: t('mainLayout:Maintenance Staff'),
        [Subject.INFO]: t('mainLayout:Info'),
        [Subject.INDOOR]: t('mainLayout:Indoor Map'),
        [Subject.AUTOMATION_RULE_MANAGEMENT]: t('mainLayout:Rule Management'),
        [Subject.ELASTIC_SEARCH]: t('mainLayout:Elastic Search'),
        [Subject.SAMPLE]: t('mainLayout:Sample'),
        [Subject.ESIGNAGE]: t('mainLayout:ESignage'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tSubject,
  };
};

export default useSubjectTranslation;
