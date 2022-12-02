import { I18nextProvider, Namespace, initReactI18next } from 'react-i18next';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import i18n from 'i18next';

import enUSColumn from 'city-os-common/locales/en-US/column.json';
import enUSCommon from 'city-os-common/locales/en-US/common.json';
import enUSError from 'city-os-common/locales/en-US/error.json';
import enUSMainLayout from 'city-os-common/locales/en-US/mainLayout.json';
import enUSProfileMenu from 'city-os-common/locales/en-US/profileMenu.json';
import enUSVariables from 'city-os-common/locales/en-US/variables.json';
import zhHantTWColumn from 'city-os-common/locales/zh-Hant-TW/column.json';
import zhHantTWCommon from 'city-os-common/locales/zh-Hant-TW/common.json';
import zhHantTWError from 'city-os-common/locales/zh-Hant-TW/error.json';
import zhHantTWMainLayout from 'city-os-common/locales/zh-Hant-TW/mainLayout.json';
import zhHantTWProfileMenu from 'city-os-common/locales/zh-Hant-TW/profileMenu.json';
import zhHantTWVariables from 'city-os-common/locales/zh-Hant-TW/variables.json';

import enUSDevice from '../locales/en-US/device.json';
import enUSDivision from '../locales/en-US/division.json';
import enUSElasticSearch from '../locales/en-US/elasticSearch.json';
import enUSLandingPage from '../locales/en-US/landingPage.json';
import enUSLogin from '../locales/en-US/login.json';
import enUSPassword from '../locales/en-US/password.json';
import enUSRecycleBin from '../locales/en-US/recycleBin.json';
import enUSRole from '../locales/en-US/role.json';
import enUSUser from '../locales/en-US/user.json';
import enUSVerify from '../locales/en-US/verify.json';
import zhHantTWDevice from '../locales/zh-Hant-TW/device.json';
import zhHantTWDivision from '../locales/zh-Hant-TW/division.json';
import zhHantTWElasticSearch from '../locales/zh-Hant-TW/elasticSearch.json';
import zhHantTWLandingPage from '../locales/zh-Hant-TW/landingPage.json';
import zhHantTWLogin from '../locales/zh-Hant-TW/login.json';
import zhHantTWPassword from '../locales/zh-Hant-TW/password.json';
import zhHantTWRecycleBin from '../locales/zh-Hant-TW/recycleBin.json';
import zhHantTWRole from '../locales/zh-Hant-TW/role.json';
import zhHantTWUser from '../locales/zh-Hant-TW/user.json';
import zhHantTWVerify from '../locales/zh-Hant-TW/verify.json';

const resources = {
  'en-US': {
    column: enUSColumn,
    common: enUSCommon,
    device: enUSDevice,
    division: enUSDivision,
    elasticSearch: enUSElasticSearch,
    error: enUSError,
    landingPage: enUSLandingPage,
    login: enUSLogin,
    mainLayout: enUSMainLayout,
    password: enUSPassword,
    profileMenu: enUSProfileMenu,
    recycleBin: enUSRecycleBin,
    role: enUSRole,
    user: enUSUser,
    variables: enUSVariables,
    verify: enUSVerify,
  },
  'zh-Hant-TW': {
    column: zhHantTWColumn,
    common: zhHantTWCommon,
    device: zhHantTWDevice,
    division: zhHantTWDivision,
    elasticSearch: zhHantTWElasticSearch,
    error: zhHantTWError,
    landingPage: zhHantTWLandingPage,
    login: zhHantTWLogin,
    mainLayout: zhHantTWMainLayout,
    password: zhHantTWPassword,
    profileMenu: zhHantTWProfileMenu,
    recycleBin: zhHantTWRecycleBin,
    role: zhHantTWRole,
    user: zhHantTWUser,
    variables: zhHantTWVariables,
    verify: zhHantTWVerify,
  },
};

void i18n.use(initReactI18next).init({
  fallbackLng: 'en-US',
  ns: Object.keys(resources['en-US']),
  defaultNS: 'en-US',
  resources,
  debug: D_DEBUG,
});

export type WebResources = typeof resources['en-US'];

export type WebNamespace = Namespace<keyof typeof resources['en-US']>;

type I18nWebProviderProps = Record<never, never>;

const I18nWebProvider: FunctionComponent<I18nWebProviderProps> = ({
  children,
}: PropsWithChildren<I18nWebProviderProps>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export default I18nWebProvider;
