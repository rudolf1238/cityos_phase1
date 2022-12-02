import { useCallback } from 'react';
import { useRouter } from 'next/router';
import omit from 'lodash/omit';

type ChangeRoute<T> = (addQuery?: T, removeQuery?: string[] | undefined) => void;

const useChangeRoute = <T>(pathName: string | null): ChangeRoute<T> => {
  const router = useRouter();

  const changeRoute = useCallback(
    (addQuery?: T, removeQuery?: string[]) => {
      const newAddedQuery = {
        ...router.query,
        ...addQuery,
      };
      const newQuery = removeQuery ? omit(newAddedQuery, removeQuery) : newAddedQuery;
      const newRoute = {
        pathname: pathName,
        query: newQuery,
      };
      void router.push(newRoute, newRoute, { shallow: true });
    },
    [router, pathName],
  );

  return changeRoute;
};

export default useChangeRoute;
