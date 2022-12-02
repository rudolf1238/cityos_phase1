import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { AbnormalNamespace, AbnormalResources } from '../modules/I18nAbnormalTranslationProvider';

export default function useAbnormalTranslation(
  ns?: AbnormalNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<AbnormalNamespace, AbnormalResources> {
  return useTranslation(ns, options);
}
