import { I18nextProvider, Namespace } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSCommon from 'city-os-common/locales/en-US/common.json';
import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import enUSProfileMenu from 'city-os-common/locales/en-US/profileMenu.json';
import enUSVariables from 'city-os-common/locales/en-US/variables.json';
import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';
import zhHantTWProfileMenu from 'city-os-common/locales/zh-Hant-TW/profileMenu.json';
import zhHantTWVariables from 'city-os-common/locales/zh-Hant-TW/variables.json';

import enUSSurveillance from '../locales/en-US/surveillance.json';
import zhHantTWSurveillance from '../locales/zh-Hant-TW/surveillance.json';

const resources = {
  'en-US': {
    common: enUSCommon,
    mainLayout: enUSMainLayout,
    profileMenu: enUSProfileMenu,
    surveillance: enUSSurveillance,
    variables: enUSVariables,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    mainLayout: zhHantTWMainLayout,
    profileMenu: zhHantTWProfileMenu,
    surveillance: zhHantTWSurveillance,
    variables: zhHantTWVariables,
  },
};

Object.entries(resources).forEach(([lang, ns]) => {
  Object.entries(ns).forEach(([nsKey, nsValue]) => {
    void i18n.addResources(lang, nsKey, nsValue);
  });
});

export type SurveillanceResources = typeof resources['en-US'];

export type SurveillanceNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nSurveillanceProviderProps = Record<never, never>;

const I18nSurveillanceProvider: FunctionComponent<I18nSurveillanceProviderProps> = ({
  children,
}: PropsWithChildren<I18nSurveillanceProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nSurveillanceProvider;
