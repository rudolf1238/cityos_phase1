import { ApolloProvider as OriginApolloProvider } from '@apollo/client';
import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

import useApolloClient from '../hooks/useApolloClientTransport';

interface ApolloProviderProps {
  children?: ReactNode;
}

const ApolloProvider: FunctionComponent = ({
  children,
}: PropsWithChildren<ApolloProviderProps>) => {
  const apolloClient = useApolloClient();

  return <OriginApolloProvider client={apolloClient}>{children}</OriginApolloProvider>;
};

export default ApolloProvider;
