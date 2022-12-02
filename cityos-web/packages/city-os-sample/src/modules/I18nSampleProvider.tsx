import { I18nextProvider, Namespace } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSCommon from 'city-os-common/locales/en-US/common.json';
import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import enUSVariables from 'city-os-common/locales/en-US/variables.json';

import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';
import zhHantTWVariables from 'city-os-common/locales/zh-Hant-TW/variables.json';

import enUSSample from '../locales/en-US/sample.json';
import zhHantTWSample from '../locales/zh-Hant-TW/sample.json';

const resources = {
  'en-US': {
    common: enUSCommon,
    mainLayout: enUSMainLayout,
    sample: enUSSample,
    variables: enUSVariables,
  },
  'zh-Hant-TW': {
    common: zhHantTWCommon,
    mainLayout: zhHantTWMainLayout,
    sample: zhHantTWSample,
    variables: zhHantTWVariables,
  },
};

Object.entries(resources).forEach(([lang, ns]) => {
  Object.entries(ns).forEach(([nsKey, nsValue]) => {
    void i18n.addResources(lang, nsKey, nsValue);
  });
});

export type SampleResources = typeof resources['en-US'];

export type SampleNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nSampleProviderProps = Record<never, never>;

const I18nSampleProvider: FunctionComponent<I18nSampleProviderProps> = ({
  children,
}: PropsWithChildren<I18nSampleProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nSampleProvider;
