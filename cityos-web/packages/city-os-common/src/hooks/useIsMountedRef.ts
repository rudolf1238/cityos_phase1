import { MutableRefObject, useEffect, useRef } from 'react';

export default function useIsMountedRef(): MutableRefObject<boolean> {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}
