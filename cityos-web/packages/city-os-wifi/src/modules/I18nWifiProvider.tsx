import { I18nextProvider, Namespace } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSCommon from 'city-os-common/locales/en-US/common.json';
import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';

import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';

import enUSWifi from '../locales/en-US/wifi.json';
import zhHantTWWifi from '../locales/zh-Hant-TW/wifi.json';

const resources = {
  'en-US': {
    common: enUSCommon,
    wifi: enUSWifi,
    mainLayout: enUSMainLayout,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    wifi: zhHantTWWifi,
    mainLayout: zhHantTWMainLayout,
  },
};

Object.entries(resources).forEach(([lang, ns]) => {
  Object.entries(ns).forEach(([nsKey, nsValue]) => {
    void i18n.addResources(lang, nsKey, nsValue);
  });
});

export type WifiResources = typeof resources['en-US'];

export type WifiNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nWifiProviderProps = Record<never, never>;

const I18nWifiProvider: FunctionComponent<I18nWifiProviderProps> = ({
  children,
}: PropsWithChildren<I18nWifiProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nWifiProvider;
