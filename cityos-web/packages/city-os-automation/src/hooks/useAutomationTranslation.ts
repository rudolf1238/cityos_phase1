import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { AutomationNamespace, AutomationResources } from '../modules/I18nAutomationProvider';

export default function useAutomationTranslation(
  ns?: AutomationNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<AutomationNamespace, AutomationResources> {
  return useTranslation(ns, options);
}
