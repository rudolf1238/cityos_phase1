import { useEffect } from 'react';

declare global {
  interface Window {
    // it's provided by youtube iframe api, it will execute as soon as the player API code download
    onYouTubeIframeAPIReady?: () => void;
  }
}

const useYoutube = (callback: () => void): void => {
  useEffect(() => {
    const src = 'https://www.youtube.com/iframe_api';
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      document.head.appendChild(script);
      window.onYouTubeIframeAPIReady = () => {
        callback();
      };
    }
    if (!process.browser) {
      return;
    }
    if (window.YT) {
      callback();
    } else if (window.onYouTubeIframeAPIReady) {
      const clonedFunc = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        clonedFunc();
        callback();
      };
    }
  }, [callback]);
};

export default useYoutube;
