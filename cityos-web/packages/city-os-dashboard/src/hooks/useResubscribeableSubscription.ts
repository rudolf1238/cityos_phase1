import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  SubscriptionHookOptions,
  TypedDocumentNode,
  useSubscription,
} from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';

export default function useResubscribeableSubscription<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData = any,
  TVariables = OperationVariables
>(
  subscription: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: SubscriptionHookOptions<TData, TVariables>,
): {
  variables?: TVariables;
  loading: boolean;
  data?: TData;
  error?: ApolloError;
  resubscribe: () => void;
} {
  const [isResubscribing, setIsResubscribing] = useState(false);
  const result = useSubscription<TData, TVariables>(subscription, {
    ...options,
    skip: options?.skip || isResubscribing,
  });

  const resubscribe = useCallback(() => {
    setIsResubscribing(true);
  }, []);

  useEffect(() => {
    if (isResubscribing) setIsResubscribing(false);
  }, [isResubscribing]);

  return { ...result, resubscribe };
}
