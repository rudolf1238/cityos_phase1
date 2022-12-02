import { I18nextProvider, Namespace } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSCommon from 'city-os-common/locales/en-US/common.json';
import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';

import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';

import enUSIndoor from '../locales/en-US/indoor.json';
import zhHantTWIndoor from '../locales/zh-Hant-TW/indoor.json';

const resources = {
  'en-US': {
    common: enUSCommon,
    indoor: enUSIndoor,
    mainLayout: enUSMainLayout,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    indoor: zhHantTWIndoor,
    mainLayout: zhHantTWMainLayout,
  },
};

Object.entries(resources).forEach(([lang, ns]) => {
  Object.entries(ns).forEach(([nsKey, nsValue]) => {
    void i18n.addResources(lang, nsKey, nsValue);
  });
});

export type IndoorResources = typeof resources['en-US'];

export type IndoorNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nIndoorProviderProps = Record<never, never>;

const I18nIndoorProvider: FunctionComponent<I18nIndoorProviderProps> = ({
  children,
}: PropsWithChildren<I18nIndoorProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nIndoorProvider;
