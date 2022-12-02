import { useCallback } from 'react';
import { useRouter } from 'next/router';

interface UseRedirect {
  to: (path: string) => Promise<boolean>;
  toNotFoundPage: () => null;
}

const useRedirect = (): UseRedirect => {
  const router = useRouter();

  const to = useCallback((path: string) => router.push(path), [router]);

  const toNotFoundPage = useCallback(() => {
    void to('/404');
    return null;
  }, [to]);

  return { to, toNotFoundPage };
};

export default useRedirect;
