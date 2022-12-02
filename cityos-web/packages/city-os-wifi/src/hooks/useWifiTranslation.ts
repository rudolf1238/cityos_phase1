import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { WifiNamespace, WifiResources } from '../modules/I18nWifiProvider';

export default function useWifiTranslation(
  ns?: WifiNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<WifiNamespace, WifiResources> {
  return useTranslation(ns, options);
}
