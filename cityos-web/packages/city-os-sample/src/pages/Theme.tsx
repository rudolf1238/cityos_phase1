import React, { VoidFunctionComponent, memo } from 'react';

import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';

import useSampleTranslation from '../hooks/useSampleTranslation';

import I18nSampleProvider from '../modules/I18nSampleProvider';
import Theme from '../modules/Theme';

const ThemePage: VoidFunctionComponent = () => {
  const { t: tSample } = useSampleTranslation();
  return (
    <I18nSampleProvider>
      <MainLayout>
        <PageContainer>
          <Header title={tSample('sample:Theme')} />
          {/* <Divider /> */}
          <Theme />
        </PageContainer>
      </MainLayout>
    </I18nSampleProvider>
  );
};

export default memo(ThemePage);
