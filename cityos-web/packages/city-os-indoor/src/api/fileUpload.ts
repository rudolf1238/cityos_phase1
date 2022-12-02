import axios from 'axios';

interface BasicResponseType {
  returnCode: string;
  message: string | undefined;
}

interface FileInfoTypeWithObjectId {
  _id: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  size: number;
}

interface UploadedFileType extends BasicResponseType {
  fileInfo: FileInfoTypeWithObjectId;
}

type ImageId = {
  _id: string;
};

const DEFAULT_IMAGE_MGMT_ENDPOINT = 'http://localhost:4000/image-mgmt/';
const websiteUrl =
  process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT?.replace('image-mgmt/', '') ||
  DEFAULT_IMAGE_MGMT_ENDPOINT.replace('image-mgmt/', '');
const baseUrl = process.env.NEXT_PUBLIC_IMAGE_MGMT_ENDPOINT || DEFAULT_IMAGE_MGMT_ENDPOINT;

const upload = (
  file: File,
  onUploadProgress: (event: ProgressEvent) => void,
  auth?: string,
  groupId?: string,
): Promise<UploadedFileType> => {
  const formData = new FormData();
  formData.append('image', file);

  const http = axios.create({
    baseURL: websiteUrl,
    headers: {
      'Content-type': 'application/json',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });

  return http.post(`${baseUrl}uploadedFile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      authorization: auth || '',
      'group-id': groupId || '',
    },
    onUploadProgress,
  });
};

const deleteImages = (imageIds: ImageId[], auth?: string, groupId?: string): Promise<void> => {
  const formatData = JSON.stringify(imageIds);

  const http = axios.create({
    baseURL: websiteUrl,
    headers: {
      'Content-type': 'application/json',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });

  return http.post(`${baseUrl}deleteFilesbyIds`, formatData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      authorization: auth || '',
      'group-id': groupId || '',
    },
  });
};

const FileUploadService = {
  upload,
  deleteImages,
};

export default FileUploadService;
