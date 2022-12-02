import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { SampleNamespace, SampleResources } from '../modules/I18nSampleProvider';

export default function useIndoorTranslation(
  ns?: SampleNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<SampleNamespace, SampleResources> {
  return useTranslation(ns, options);
}
