import React, { FunctionComponent, PropsWithChildren } from 'react';

import Container from '@material-ui/core/Container';

import PageWithFooter from './PageWithFooter';

interface PageContainerProps {
  className?: string;
}

const PageContainer: FunctionComponent<PageContainerProps> = ({
  className,
  children,
}: PropsWithChildren<PageContainerProps>) => (
  <PageWithFooter>
    <Container className={className}>
      <>{children}</>
    </Container>
  </PageWithFooter>
);

export default PageContainer;
