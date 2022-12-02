import i18n from 'i18next';

import { Language } from 'city-os-common/libs/schema';
import { isLanguage } from 'city-os-common/libs/validators';

export async function changeLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language.replace(/_/g, '-'));
}

export function parseI18nLanguage(language: string): Language {
  const newLanguage = language.replace(/-/g, '_');
  return isLanguage(newLanguage) ? newLanguage : Language.en_US;
}
