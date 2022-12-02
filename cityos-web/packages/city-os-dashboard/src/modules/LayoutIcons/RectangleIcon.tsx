import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import DarkRectangleIcon from '../../assets/icon/layout-rectangle-dark.svg';
import LightRectangleIcon from '../../assets/icon/layout-rectangle.svg';

const RectangleIcon: VoidFunctionComponent = () => {
  const theme = useTheme();

  if (theme.palette.type === 'light') return <LightRectangleIcon />;
  return <DarkRectangleIcon />;
};

export default memo(RectangleIcon);
