import {
  ApolloClient,
  ApolloError,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  from,
  fromPromise,
  split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import ReducerActionType from 'city-os-common/reducers/actions';

import { REFRESH_TOKEN, RefreshTokenPayload, RefreshTokenResponse } from '../api/refreshToken';

const baseClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
  credentials: 'include',
});

const useApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  const {
    user,
    userProfile: { permissionGroup },
    dispatch,
  } = useStore();
  const isRefreshing = useRef(false);

  const tokens = useRef<{
    accessToken?: string;
    refreshToken?: string;
    deviceToken?: string;
  }>({});

  useEffect(() => {
    tokens.current = {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      deviceToken: user.deviceToken,
    };
    isRefreshing.current = false;
  }, [user.accessToken, user.deviceToken, user.refreshToken]);

  const getNewToken = useCallback(async (): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    isRefreshing.current = true;
    if (!tokens.current.refreshToken) {
      isRefreshing.current = false;
      dispatch({
        type: ReducerActionType.UserLogout,
      });
    }
    if (!tokens.current.refreshToken || !tokens.current.deviceToken) {
      throw new Error('No Device Token');
    }

    try {
      const { data } = await baseClient.mutate<RefreshTokenResponse, RefreshTokenPayload>({
        mutation: REFRESH_TOKEN,
        variables: {
          refreshToken: tokens.current.refreshToken,
          deviceToken: tokens.current.deviceToken,
        },
      });
      if (!data) {
        throw new Error('No Response');
      }
      dispatch({
        type: ReducerActionType.RefreshToken,
        payload: {
          accessToken: data.refreshToken.accessToken,
          refreshToken: data.refreshToken.refreshToken,
        },
      });
      return {
        accessToken: data.refreshToken.accessToken,
        refreshToken: data.refreshToken.refreshToken,
      };
    } catch (error) {
      if (error instanceof ApolloError && error.graphQLErrors) {
        error.graphQLErrors.forEach(({ extensions, message }) => {
          // TODO: remove log
          console.log({
            request: 'refreshToken',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            code: extensions?.code || '',
            message,
          });
          switch (extensions?.code) {
            // refresh token unauthenticated
            case ErrorCode.UNAUTHENTICATED:
            case ErrorCode.INPUT_PARAMETERS_INVALID:
              dispatch({
                type: ReducerActionType.UserLogout,
              });
              break;
            default:
              break;
          }
        });
      }
      isRefreshing.current = false;
      throw error;
    }
  }, [dispatch]);

  const authLink = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      setContext((_operation, context) => ({
        ...context,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ...context.headers,
          authorization: tokens.current.accessToken
            ? `Bearer ${tokens.current.accessToken}`
            : undefined,
          'group-id': permissionGroup?.group?.id,
        },
      })),
    [permissionGroup?.group?.id],
  );

  const errorLink = useMemo(
    () =>
      onError(({ graphQLErrors, operation, forward }) => {
        if (graphQLErrors) {
          let retry = false;
          graphQLErrors.forEach(({ extensions, message }) => {
            // TODO: remove log
            console.log({
              errorRequest: operation.operationName,
              code: (extensions?.code || '') as string,
              message,
            });
            switch (extensions?.code) {
              // access token unauthenticated
              case ErrorCode.UNAUTHENTICATED:
                console.log('Access Token UNAUTHENTICATED', user);
                retry = true;
                break;
              default:
            }
          });

          if (retry) {
            if (isRefreshing.current) {
              return forward(operation);
            }
            return fromPromise(getNewToken()).flatMap(({ accessToken }) => {
              const context = operation.getContext();
              operation.setContext({
                ...context,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                headers: {
                  ...context.headers,
                  authorization: `Bearer ${accessToken}`,
                  'group-id': permissionGroup?.group?.id,
                },
              });
              return forward(operation);
            });
          }
        }
        return undefined;
      }),
    [getNewToken, permissionGroup?.group?.id, user],
  );

  const httpLink = useMemo(() => {
    const link = new HttpLink({
      uri: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
    });
    return link;
  }, []);

  const wsLink = useMemo(() => {
    const link = process.browser
      ? new WebSocketLink({
          uri: process.env.NEXT_PUBLIC_GQL_WEBSOCKET_ENDPOINT || '',
          options: {
            reconnect: true,
            lazy: true,
            connectionParams: {
              authorization: user.accessToken ? `Bearer ${user.accessToken}` : undefined,
              'group-id': permissionGroup?.group?.id,
            },
            minTimeout: 10000,
          },
        })
      : null;
    return link;
  }, [permissionGroup?.group?.id, user.accessToken]);

  const splitLink = useMemo(() => {
    const link = process.browser
      ? split(
          ({ query, operationName, variables }) => {
            // TODO: remove log
            console.log({ query: operationName, variables });
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
          },
          wsLink as WebSocketLink,
          httpLink,
        )
      : httpLink;
    return link;
  }, [httpLink, wsLink]);

  const client = useMemo(() => {
    const newClient = new ApolloClient({
      link: from([authLink, errorLink, splitLink]),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              searchGroups: {
                merge(_existing, incoming: unknown) {
                  return incoming;
                },
              },
              roleTemplates: {
                merge(_existing, incoming: unknown) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
    });
    return newClient;
  }, [authLink, errorLink, splitLink]);

  return client;
};

export default useApolloClient;
