import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, ImgHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';
import type { StandardLonghandProperties } from 'csstype';

import Image from 'next/image';

const useStyles = makeStyles({
  backgroundImage: {
    position: 'relative',
    zIndex: 0,

    '& > :first-child': {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: -1,
      width: '100%',
      height: '100%',
    },
  },
});

interface BackgroundImageProps {
  imageData: StaticImageData;
  className?: ImgHTMLAttributes<HTMLImageElement>['className'];
  alt?: ImgHTMLAttributes<HTMLImageElement>['alt'];
  objectFit?: StandardLonghandProperties['objectFit'];
  objectPosition?: StandardLonghandProperties['objectPosition'];
  priority?: boolean;
}

const BackgroundImage: FunctionComponent<BackgroundImageProps> = ({
  imageData,
  className,
  alt,
  objectFit,
  objectPosition,
  priority,
  children,
}: PropsWithChildren<BackgroundImageProps>) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.backgroundImage, className)}>
      <Image
        alt={alt}
        src={imageData}
        layout="fill"
        objectFit={objectFit}
        objectPosition={objectPosition}
        priority={priority}
      />
      {children}
    </div>
  );
};

export default BackgroundImage;
