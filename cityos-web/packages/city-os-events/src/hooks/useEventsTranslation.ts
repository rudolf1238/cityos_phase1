import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { EventsNamespace, EventsResources } from '../modules/I18nEventsProvider';

export default function useEventsTranslation(
  ns?: EventsNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<EventsNamespace, EventsResources> {
  return useTranslation(ns, options);
}
