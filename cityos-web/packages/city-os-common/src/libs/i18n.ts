import { Namespace } from 'react-i18next';
import { enUS, zhTW } from 'date-fns/locale';
import i18nIsoCountries from '@ntpu/i18n-iso-countries';
import i18nIsoCountriesEn from '@ntpu/i18n-iso-countries/langs/en.json';
import i18nIsoCountriesTW from '@ntpu/i18n-iso-countries/langs/tw.json';

import { Language } from './schema';
import enUSColumn from '../locales/en-US/column.json';
import enUSCommon from '../locales/en-US/common.json';
import enUSError from '../locales/en-US/error.json';
import enUSIndoor from '../locales/en-US/indoor.json';
import enUSMainLayout from '../locales/en-US/mainLayout.json';
import enUSProfileMenu from '../locales/en-US/profileMenu.json';
import enUSVariables from '../locales/en-US/variables.json';
import zhHantTWColum from '../locales/zh-Hant-TW/column.json';
import zhHantTWCommon from '../locales/zh-Hant-TW/common.json';
import zhHantTWError from '../locales/zh-Hant-TW/error.json';
import zhHantTWIndoor from '../locales/zh-Hant-TW/indoor.json';
import zhHantTWMainLayout from '../locales/zh-Hant-TW/mainLayout.json';
import zhHantTWProfileMenu from '../locales/zh-Hant-TW/profileMenu.json';
import zhHantTWVariables from '../locales/zh-Hant-TW/variables.json';

export const resources = {
  'en-US': {
    column: enUSColumn,
    common: enUSCommon,
    error: enUSError,
    mainLayout: enUSMainLayout,
    profileMenu: enUSProfileMenu,
    variables: enUSVariables,
    indoor: enUSIndoor,
  },
  'zh-Hant-TW': {
    column: zhHantTWColum,
    common: zhHantTWCommon,
    error: zhHantTWError,
    mainLayout: zhHantTWMainLayout,
    profileMenu: zhHantTWProfileMenu,
    variables: zhHantTWVariables,
    indoor: zhHantTWIndoor,
  },
};

export type CommonResources = typeof resources['en-US'];

export type CommonNamespace = Namespace<keyof typeof resources['en-US']>;

i18nIsoCountries.registerLocale(i18nIsoCountriesEn);
i18nIsoCountries.registerLocale(i18nIsoCountriesTW);

export const localesMap: {
  [key: string]: Locale;
} = { default: enUS, 'zh-Hant-TW': zhTW };

export const languageOptions: Record<Language, string> = {
  [Language.en_US]: 'English',
  [Language.zh_Hant_TW]: '繁體中文',
};
