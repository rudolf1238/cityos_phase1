import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { MapNamespace, MapResources } from '../modules/I18nMapProvider';

export default function useMapTranslation(
  ns?: MapNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<MapNamespace, MapResources> {
  return useTranslation(ns, options);
}
