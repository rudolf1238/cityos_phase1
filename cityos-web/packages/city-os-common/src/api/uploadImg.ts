import axios from 'axios';

export interface UploadImgPayload {
  file: File;
  onUploadProgress?: (event: ProgressEvent) => void;
  authorization?: string;
  groupId?: string;
  controller?: AbortController;
}

export interface UploadImgResponse {
  returnCode: string;
  message: string | undefined;
  fileInfo: {
    _id: string;
    fieldname: string;
    filename: string;
    mimetype: string;
    originalname: string;
    size: number;
  };
}

const uploadImg = async (props: UploadImgPayload): Promise<UploadImgResponse> => {
  const { controller, file, onUploadProgress, authorization, groupId } = props;

  const formData = new FormData();
  formData.append('image', file);

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

  const { data } = await http.post<UploadImgResponse>('uploadedFile', formData);
  return data;
};

export default uploadImg;
