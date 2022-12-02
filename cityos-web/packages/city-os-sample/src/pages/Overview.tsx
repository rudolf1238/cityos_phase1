import React, { VoidFunctionComponent, memo } from 'react';

import MainLayout from 'city-os-common/modules/MainLayout';

import I18nSampleProvider from '../modules/I18nSampleProvider';

const OverviewPage: VoidFunctionComponent = () => (
  <I18nSampleProvider>
    <MainLayout>
      <p>Version: {process.env.NEXT_PUBLIC_VERSION}</p>
    </MainLayout>
  </I18nSampleProvider>
);

export default memo(OverviewPage);
