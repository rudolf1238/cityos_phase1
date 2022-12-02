import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { WebNamespace, WebResources } from '../modules/I18nWebTranslationProvider';

export default function useWebTranslation(
  ns?: WebNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<WebNamespace, WebResources> {
  return useTranslation(ns, options);
}
