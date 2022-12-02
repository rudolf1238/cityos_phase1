import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback } from 'react';

import ErrorPage from 'city-os-common/modules/ErrorPage';

import useWebTranslation from '../hooks/useWebTranslation';

import PageNotFoundImg from '../assets/img/page-not-found.svg';

const Custom404: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['error', 'common']);
  const router = useRouter();

  const handleOnClick = useCallback(() => {
    void router.push('./');
  }, [router]);

  return (
    <ErrorPage
      text={t(
        'error:We are sorry___The page you are looking for might have been removed or is temporarily unavailable_',
      )}
      img={<PageNotFoundImg />}
      button={{
        text: t('common:Return to the Homepage'),
        onClick: handleOnClick,
      }}
    />
  );
};

export default Custom404;
