import { VoidFunctionComponent, useCallback, useEffect } from 'react';

const WindowVhDetector: VoidFunctionComponent = () => {
  const setCorrectVh = useCallback(() => {
    const windowVh = window.innerHeight / 100;
    document.documentElement.style.setProperty('--vh', `${windowVh}px`);
  }, []);

  useEffect(() => {
    setCorrectVh();
    window.addEventListener('resize', setCorrectVh);

    return () => {
      window.removeEventListener('resize', setCorrectVh);
    };
  }, [setCorrectVh]);

  return null;
};

export default WindowVhDetector;
