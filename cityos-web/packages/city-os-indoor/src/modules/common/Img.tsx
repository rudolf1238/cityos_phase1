// TODO: 已搬移到通用模块並且重構

import React, {
  FunctionComponent,
  ImgHTMLAttributes,
  memo,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { getImgBase64 } from '../../api/getImg';
import { useStore } from '../../../../city-os-common/src/reducers/index';

export interface ImgProps {
  id: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  className?: string;
}

const Img: FunctionComponent<ImgProps> = (props: ImgProps) => {
  const { id, imgProps, className } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();

  const asyncGetImg = useCallback(async () => {
    const base64Image = await getImgBase64(
      id,
      `Bearer ${user.accessToken || ''}`,
      permissionGroup?.group?.id || '',
    );
    if (imgRef !== null && imgRef.current !== null && typeof base64Image === 'string') {
      imgRef.current.src = base64Image;
    }
  }, [id, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imgRef} alt="" {...imgProps} className={className} />;
};

export default memo(Img);
