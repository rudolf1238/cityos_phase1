import { UseTranslationOptions } from 'react-i18next';

import { CommonNamespace, CommonResources } from '../libs/i18n';
import useTranslation, { UseTranslationResponse } from './useTranslation';

export default function useCommonTranslation(
  ns?: CommonNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<CommonNamespace, CommonResources> {
  return useTranslation(ns, options);
}
