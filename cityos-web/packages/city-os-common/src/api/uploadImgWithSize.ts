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

export interface UploadImgWithSize {
  httpResponse: UploadImgResponse;
  imageSize: { width: number; height: number };
}

export const getImageSize = async (file: File): Promise<{ width: number; height: number }> => {
  const reader = new FileReader();
  return new Promise((resolve, _reject) => {
    reader.onload = (_event: ProgressEvent) => {
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const uploadImgWithSize = async (props: UploadImgPayload): Promise<UploadImgWithSize> => {
  const { controller, file, onUploadProgress, authorization, groupId } = props;

  const formData = new FormData();
  formData.append('image', file);

  const requestConfig = {
    baseURL:
      process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT ||
      `${process.env.NEXT_PUBLIC_CONTACT_WEBSITE || ''}image-mgmt/`,
    headers: {
      authorization: authorization || '',
      'group-id': groupId || '',
    },
    onUploadProgress,
    signal: controller?.signal,
  };

  const http = axios.create(requestConfig);

  const imageSize = await getImageSize(file);

  const { data } = await http.post<UploadImgResponse>('uploadedFile', formData);

  return { httpResponse: data, imageSize };
};

export default uploadImgWithSize;
