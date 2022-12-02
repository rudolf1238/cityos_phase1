import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const useTimeout = (): Dispatch<SetStateAction<number | undefined>> => {
  const [timer, setTimer] = useState<number | undefined>();

  useEffect(() => {
    if (timer === undefined) {
      return () => {};
    }
    return () => {
      window.clearTimeout(timer);
    };
  }, [timer]);

  return setTimer;
};

export default useTimeout;
