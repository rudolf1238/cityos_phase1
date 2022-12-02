import JSZip from 'jszip';
import UAParser from 'ua-parser-js';
import axios, { AxiosResponse } from 'axios';

import { isNumberString } from './validators';
import downloadFile from './downloadFile';

export enum DownloadErrorCode {
  VIDEO_LIST_EMPTY = 'VIDEO_LIST_EMPTY',
  ALL_FAILED = 'ALL_FAILED',
  PARTIAL_FAILED = 'PARTIAL_FAILED',
  CANCEL = 'CANCEL',
}

const isFirefox = new UAParser().getBrowser().name === 'Firefox';
const sizeLimitInByte = (isFirefox ? 1 : 2) * 1024 * 1024 * 1024;

const downloadVideos = async ({
  zipName,
  videos,
  signal,
  onProgress,
}: {
  zipName: string;
  videos: {
    url: string;
    name: string;
  }[];
  signal?: AbortSignal;
  onProgress?: (
    /**  Progress from 0 to 100 */
    progress: number,
  ) => void;
}): Promise<{ status: 'success' } | { status: 'failed'; reason: DownloadErrorCode }> => {
  if (videos.length === 0) return { status: 'failed', reason: DownloadErrorCode.VIDEO_LIST_EMPTY };

  let accSize = 0;
  const videoStates: Record<string, { name: string; total: number; loaded: number }> = {};
  for (let i = 0; i < videos.length; i += 1) {
    const { url, name } = videos[i];
    let size = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.head(url, { timeout: 2000 });
      const contentLength = res.headers?.['content-length'];
      size = isNumberString(contentLength) ? parseInt(contentLength, 10) : 0;
    } catch (err) {
      console.error(err);
    }
    accSize += size;
    if (accSize >= sizeLimitInByte) break;
    videoStates[url] = { name, total: size, loaded: 0 };
  }

  // double check file size in case head isn't supported
  let accZipSize = 0;
  const zip = new JSZip();
  await Promise.allSettled<void>(
    Object.entries(videoStates).map(async ([url, { name }]) => {
      try {
        const { data }: AxiosResponse<Blob> = await axios.get<Blob>(url, {
          responseType: 'blob',
          signal,
          onDownloadProgress: ({ loaded, total }: ProgressEvent) => {
            videoStates[url] = { ...videoStates[url], loaded, total };
            const allProgress = Object.values(videoStates).reduce(
              (acc, curr) =>
                acc + (curr.total ? curr.loaded / curr.total / Object.keys(videoStates).length : 0),
              0,
            );
            if (onProgress) onProgress(Math.round(allProgress * 100));
          },
        });
        accZipSize += data.size;
        if (accZipSize < sizeLimitInByte) zip.file(name, data);
      } catch (error) {
        videoStates[url] = { ...videoStates[url], loaded: 1, total: 1 };
        console.error(error);
        throw error;
      }
    }),
  );

  if (signal?.aborted) return { status: 'failed', reason: DownloadErrorCode.CANCEL };

  const fileCount = Object.keys(zip.files).length;
  if (fileCount) {
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadFile(blob, zipName);
  }

  if (fileCount === videos.length) return { status: 'success' };
  return {
    status: 'failed',
    reason: fileCount === 0 ? DownloadErrorCode.ALL_FAILED : DownloadErrorCode.PARTIAL_FAILED,
  };
};

export default downloadVideos;
