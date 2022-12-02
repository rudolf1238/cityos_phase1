import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Image from 'next/image';

import { ComponentId } from '../libs/type';

import BaseMapContainerDarkImg from '../assets/img/component-base-map-container-dark.png';
import BaseMapContainerImg from '../assets/img/component-base-map-container.png';
import DivisionSelectorDarkImg from '../assets/img/component-division-selector-dark.png';
import DivisionSelectorImg from '../assets/img/component-division-selector.png';
import HeaderDarkImg from '../assets/img/component-header-dark.png';
import HeaderImg from '../assets/img/component-header.png';

const componentImages: Record<'light' | 'dark', Record<ComponentId, StaticImageData>> = {
  light: {
    [ComponentId.DIVISION_SELECTOR]: DivisionSelectorImg,
    [ComponentId.HEADER]: HeaderImg,
    [ComponentId.BASE_MAP_CONTAINER]: BaseMapContainerImg,
  },
  dark: {
    [ComponentId.DIVISION_SELECTOR]: DivisionSelectorDarkImg,
    [ComponentId.HEADER]: HeaderDarkImg,
    [ComponentId.BASE_MAP_CONTAINER]: BaseMapContainerDarkImg,
  },
};

interface ComponentImageProps {
  id: ComponentId;
}

const ComponentImage: VoidFunctionComponent<ComponentImageProps> = ({
  id,
}: ComponentImageProps) => {
  const theme = useTheme();

  const lightImages: StaticImageData = componentImages.light[id];
  const darkImages: StaticImageData = componentImages.dark[id];

  return (
    <Image
      layout="fill"
      objectFit="contain"
      src={theme.palette.type === 'light' ? lightImages : darkImages}
    />
  );
};

export default memo(ComponentImage);
