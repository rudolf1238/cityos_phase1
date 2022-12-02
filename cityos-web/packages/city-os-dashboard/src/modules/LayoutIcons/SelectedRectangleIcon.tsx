import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import DarkSelectedRectangleIcon from '../../assets/icon/layout-rectangle-selected-dark.svg';
import LightSelectedRectangleIcon from '../../assets/icon/layout-rectangle-selected.svg';

const SelectedRectangleIcon: VoidFunctionComponent = () => {
  const theme = useTheme();

  if (theme.palette.type === 'light') return <LightSelectedRectangleIcon />;
  return <DarkSelectedRectangleIcon />;
};

export default memo(SelectedRectangleIcon);
