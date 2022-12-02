import axios, { AxiosRequestConfig } from 'axios';

const blobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const getImgBlob = async (
  id: string,
  _authorization?: string,
  _groupId?: string,
): Promise<Blob> => {
  const requestConfig: AxiosRequestConfig = {
    method: 'get',
    baseURL: process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || '',
    headers: {
      authorization: _authorization || '',
      'group-id': _groupId || '',
    },
    responseType: 'blob',
  };

  const http = axios.create(requestConfig);

  const { data } = await http.get<Blob>(id);
  return data;
};

const getImgBase64 = async (
  id: string,
  _authorization?: string,
  _groupId?: string,
): Promise<string | ArrayBuffer | null> => {
  const imgBlob = await getImgBlob(id, _authorization, _groupId);
  return blobToBase64(imgBlob);
};

export default getImgBase64;
export { getImgBlob, getImgBase64 };
