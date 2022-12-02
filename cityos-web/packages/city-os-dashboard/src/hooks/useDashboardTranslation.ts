import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { DashboardNamespace, DashboardResources } from '../modules/I18nDashboardProvider';

export default function useDashboardTranslation(
  ns?: DashboardNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<DashboardNamespace, DashboardResources> {
  return useTranslation(ns, options);
}
