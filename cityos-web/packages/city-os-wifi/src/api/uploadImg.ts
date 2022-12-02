import axios from 'axios';

export interface UploadImgPayload {
  file: File;
  onUploadProgress?: (event: ProgressEvent) => void;
  authorization?: string;
  groupId?: string;
  controller?: AbortController;
}
export interface UploadImgResponse {
  code: number;
  status: string;
  name: string;
}



const uploadImg = async (props: UploadImgPayload) => {
  const { controller, file, onUploadProgress, authorization, groupId } = props;

  const formData = new FormData();
  formData.append('file', file);

  const requestConfig = {
    baseURL: process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || 'http://localhost:4000/image-mgmt/',
    headers: {
      authorization: authorization || '',
      'group-id': groupId || '',
    },
    onUploadProgress,
    signal: controller?.signal,
  };

  const http = axios.create(requestConfig);

  const { data } = await http.post<string>('uploadFileToWifiPlus', formData);
  return data;
};

export default uploadImg;
