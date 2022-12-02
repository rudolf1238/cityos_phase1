import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import { Subject } from 'city-os-common/libs/schema';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import { ComponentId, ComponentPageQuery } from '../libs/type';
import useConstants from '../hooks/useConstants';
import useSampleTranslation from '../hooks/useSampleTranslation';

import ComponentContent from '../modules/ComponentContent';
import ComponentsOverview from '../modules/Components';
import I18nSampleProvider from '../modules/I18nSampleProvider';

const ComponentsPage: VoidFunctionComponent = () => {
  const { t: tSample } = useSampleTranslation();
  const router = useRouter();
  const routerQuery: ComponentPageQuery = useMemo(() => router.query, [router.query]);

  const componentId = useMemo<ComponentId | null>(() => {
    const id = Array.isArray(routerQuery.id) ? routerQuery.id[0] : routerQuery.id;
    if (id === undefined) return null;
    return Object.values(ComponentId).includes(id as ComponentId) ? (id as ComponentId) : null;
  }, [routerQuery]);

  const { componentInfoList } = useConstants();

  const componentInfo = useMemo(
    () =>
      componentInfoList.filter(
        (currentComponentInfo) => currentComponentInfo.id === componentId,
      )[0] || null,
    [componentId, componentInfoList],
  );

  return (
    <I18nSampleProvider>
      <MainLayout>
        <PageContainer>
          {componentId ? (
            componentInfo && (
              <div>
                <Header
                  title={componentInfo.label}
                  backLinkText={`${tSample('sample:Go back to')} ${tSample('sample:Component')}`}
                  backLinkHref={`${subjectRoutes[Subject.SAMPLE]}/components/`}
                />
                <ComponentContent id={componentInfo.id} />
              </div>
            )
          ) : (
            <>
              <Header title={tSample('sample:Component')} />
              <ComponentsOverview />
            </>
          )}
        </PageContainer>
      </MainLayout>
    </I18nSampleProvider>
  );
};

export default memo(ComponentsPage);
