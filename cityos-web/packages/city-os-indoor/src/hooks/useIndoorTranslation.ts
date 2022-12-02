import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { IndoorNamespace, IndoorResources } from '../modules/I18nIndoorProvider';

export default function useIndoorTranslation(
  ns?: IndoorNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<IndoorNamespace, IndoorResources> {
  return useTranslation(ns, options);
}
