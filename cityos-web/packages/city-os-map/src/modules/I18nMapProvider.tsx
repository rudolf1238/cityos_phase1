import { I18nextProvider, Namespace } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSColumn from 'city-os-common/locales/en-US/column.json';
import enUSCommon from 'city-os-common/locales/en-US/common.json';
import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import enUSProfileMenu from 'city-os-common/locales/en-US/profileMenu.json';
import enUSVariables from 'city-os-common/locales/en-US/variables.json';
import zhHantTWColumn from 'city-os-common/locales/zh-Hant-TW/column.json';
import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';
import zhHantTWProfileMenu from 'city-os-common/locales/zh-Hant-TW/profileMenu.json';
import zhHantTWVariables from 'city-os-common/locales/zh-Hant-TW/variables.json';

import enUSMap from '../locales/en-US/map.json';
import zhHantTWMap from '../locales/zh-Hant-TW/map.json';

const resources = {
  'en-US': {
    column: enUSColumn,
    common: enUSCommon,
    mainLayout: enUSMainLayout,
    map: enUSMap,
    profileMenu: enUSProfileMenu,
    variables: enUSVariables,
  },
  'zh-Hant-TW': {
    column: zhHantTWColumn,
    common: zhHantTWCommon,
    mainLayout: zhHantTWMainLayout,
    map: zhHantTWMap,
    profileMenu: zhHantTWProfileMenu,
    variables: zhHantTWVariables,
  },
};

Object.entries(resources).forEach(([lang, ns]) => {
  Object.entries(ns).forEach(([nsKey, nsValue]) => {
    void i18n.addResources(lang, nsKey, nsValue);
  });
});

export type MapResources = typeof resources['en-US'];

export type MapNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nMapProviderProps = Record<never, never>;

const I18nMapProvider: FunctionComponent<I18nMapProviderProps> = ({
  children,
}: PropsWithChildren<I18nMapProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nMapProvider;
