import { useEffect, useState } from 'react';

import useIsMountedRef from './useIsMountedRef';

const useCHTSnapshot = (projectKey: string | null, url?: string): string | undefined => {
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    const controller = new AbortController();
    setImgUrl(undefined);
    if (url && projectKey) {
      void (async () => {
        const res = await fetch(url, {
          headers: {
            CK: projectKey,
          },
          signal: controller.signal,
        });
        const data = await res.blob();
        if (isMountedRef.current) {
          setImgUrl(URL.createObjectURL(data));
        }
      })();
    }

    return () => {
      controller.abort();
    };
  }, [isMountedRef, projectKey, url]);

  useEffect(
    () => () => {
      if (imgUrl) {
        URL.revokeObjectURL(imgUrl);
      }
    },
    [imgUrl],
  );

  return imgUrl;
};

export default useCHTSnapshot;
