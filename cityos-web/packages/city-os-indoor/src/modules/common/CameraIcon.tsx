import React, { ComponentProps, ElementType, VoidFunctionComponent } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import CameraIcon360 from '../../assets/icon/poi_indoor_camera-09.svg';
import CameraIconBottom from '../../assets/icon/poi_indoor_camera-04.svg';
import CameraIconBottomLeft from '../../assets/icon/poi_indoor_camera-05.svg';
import CameraIconBottomRight from '../../assets/icon/poi_indoor_camera-03.svg';
import CameraIconLeft from '../../assets/icon/poi_indoor_camera-06.svg';
import CameraIconRight from '../../assets/icon/poi_indoor_camera-02.svg';
import CameraIconUp from '../../assets/icon/poi_indoor_camera-08.svg';
import CameraIconUpLeft from '../../assets/icon/poi_indoor_camera-07.svg';
import CameraIconUpRight from '../../assets/icon/poi_indoor_camera-01.svg';

import CameraSelectedIcon360 from '../../assets/icon/poi_indoor_camera-29.svg';
import CameraSelectedIconBottom from '../../assets/icon/poi_indoor_camera-24.svg';
import CameraSelectedIconBottomLeft from '../../assets/icon/poi_indoor_camera-25.svg';
import CameraSelectedIconBottomRight from '../../assets/icon/poi_indoor_camera-23.svg';
import CameraSelectedIconLeft from '../../assets/icon/poi_indoor_camera-26.svg';
import CameraSelectedIconRight from '../../assets/icon/poi_indoor_camera-22.svg';
import CameraSelectedIconUp from '../../assets/icon/poi_indoor_camera-28.svg';
import CameraSelectedIconUpLeft from '../../assets/icon/poi_indoor_camera-27.svg';
import CameraSelectedIconUpRight from '../../assets/icon/poi_indoor_camera-21.svg';

import CameraRemovedIcon360 from '../../assets/icon/poi_indoor_camera-19.svg';
import CameraRemovedIconBottom from '../../assets/icon/poi_indoor_camera-14.svg';
import CameraRemovedIconBottomLeft from '../../assets/icon/poi_indoor_camera-15.svg';
import CameraRemovedIconBottomRight from '../../assets/icon/poi_indoor_camera-13.svg';
import CameraRemovedIconLeft from '../../assets/icon/poi_indoor_camera-16.svg';
import CameraRemovedIconRight from '../../assets/icon/poi_indoor_camera-12.svg';
import CameraRemovedIconUp from '../../assets/icon/poi_indoor_camera-18.svg';
import CameraRemovedIconUpLeft from '../../assets/icon/poi_indoor_camera-17.svg';
import CameraRemovedIconUpRight from '../../assets/icon/poi_indoor_camera-11.svg';

const cameraIconList: ElementType[] = [
  CameraIconUp,
  CameraIconUpRight,
  CameraIconRight,
  CameraIconBottomRight,
  CameraIconBottom,
  CameraIconBottomLeft,
  CameraIconLeft,
  CameraIconUpLeft,
  CameraIcon360,
];

const cameraSelectedIconList: ElementType[] = [
  CameraSelectedIconUp,
  CameraSelectedIconUpRight,
  CameraSelectedIconRight,
  CameraSelectedIconBottomRight,
  CameraSelectedIconBottom,
  CameraSelectedIconBottomLeft,
  CameraSelectedIconLeft,
  CameraSelectedIconUpLeft,
  CameraSelectedIcon360,
];

const cameraRemovedIconList: ElementType[] = [
  CameraRemovedIconUp,
  CameraRemovedIconUpRight,
  CameraRemovedIconRight,
  CameraRemovedIconBottomRight,
  CameraRemovedIconBottom,
  CameraRemovedIconBottomLeft,
  CameraRemovedIconLeft,
  CameraRemovedIconUpLeft,
  CameraRemovedIcon360,
];

export interface CameraIconProps extends ComponentProps<typeof SvgIcon> {
  direction: number;
  selected?: boolean;
  removed?: boolean;
}

const CameraIcon: VoidFunctionComponent<CameraIconProps> = ({
  direction,
  selected,
  removed,
  ...props
}: CameraIconProps) => {
  const realDirection = direction < 0 ? 8 : direction % 8;

  let Icon = cameraIconList[realDirection];

  if (removed) {
    Icon = cameraRemovedIconList[realDirection];
  } else if (selected) {
    Icon = cameraSelectedIconList[realDirection];
  }

  return <Icon {...props} />;
};

export default CameraIcon;
