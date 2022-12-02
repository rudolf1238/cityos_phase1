import promiseWithTimeout from './promiseWithTimeout';

/** return video duration in seconds */
const getVideoDuration = (
  url: string,
): {
  promise: Promise<number>;
  cancel: () => void;
} => {
  let removeVideo = () => {};
  let onCancel = () => {};
  const promise: Promise<number> = new Promise((resolve, reject) => {
    const video = document.createElement('video');

    removeVideo = () => {
      video.removeAttribute('src');
      video.load();
      video.remove();
    };

    onCancel = () => {
      removeVideo();
      reject(new Error('Cancel getting video duration'));
    };

    video.setAttribute('preload', 'metadata');
    video.setAttribute('src', url);
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      reject(video.error);
    };
  });

  return {
    promise: promiseWithTimeout(promise, 5000).finally(() => {
      removeVideo();
    }),
    cancel: onCancel,
  };
};

export default getVideoDuration;
