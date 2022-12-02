import { ApolloError } from '@apollo/client';

import ErrorCode from './errorCode';

const isGqlError = (error: ApolloError | undefined, code: ErrorCode): boolean =>
  error?.graphQLErrors?.some(({ extensions }) => extensions?.code === code) || false;

export default isGqlError;
