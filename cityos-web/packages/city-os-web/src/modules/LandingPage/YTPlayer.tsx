import { v4 as uuidv4 } from 'uuid';
import React, {
  ForwardRefRenderFunction,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

interface YTPlayerProps {
  videoId: string;
  playerOptions: YT.PlayerOptions;
}

const YTPlayer: ForwardRefRenderFunction<YT.Player, YTPlayerProps> = (
  { videoId, playerOptions }: YTPlayerProps,
  ref: ForwardedRef<YT.Player>,
) => {
  const [elementId, setElementId] = useState<string>();
  const playerRef = useRef<YT.Player | null>(null);
  const isMountedRef = useIsMountedRef();

  const handleOnLoad = useCallback(() => {
    if (elementId && window.YT.Player && !playerRef.current) {
      playerRef.current = new window.YT.Player(elementId, {
        ...playerOptions,
        videoId,
        playerVars: {
          autoplay: 0,
          mute: 1,
          loop: 1,
          controls: 0,
          playlist: videoId,
          ...playerOptions.playerVars,
        },
      });
    }

    if (!ref) return;
    if (typeof ref === 'function') {
      ref(playerRef.current);
    } else {
      // eslint-disable-next-line no-param-reassign
      ref.current = playerRef.current;
    }
  }, [elementId, playerOptions, ref, videoId]);

  useEffect(() => {
    const src = 'https://www.youtube.com/iframe_api';
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      document.head.appendChild(script);
      window.onYouTubeIframeAPIReady = () => {
        if (isMountedRef.current) handleOnLoad();
      };
    }
    if (!process.browser) {
      return;
    }
    if (window.YT) {
      if (isMountedRef.current) handleOnLoad();
    } else if (window.onYouTubeIframeAPIReady) {
      const clonedFunc = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        clonedFunc();
        if (isMountedRef.current) handleOnLoad();
      };
    }
  }, [isMountedRef, handleOnLoad]);

  useEffect(() => {
    setElementId(uuidv4());
  }, []);

  return elementId ? <div id={elementId} /> : null;
};

export default forwardRef<YT.Player, YTPlayerProps>(YTPlayer);
