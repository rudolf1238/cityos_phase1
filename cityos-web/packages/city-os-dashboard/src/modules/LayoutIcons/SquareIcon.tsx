import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import DarkSquareIcon from '../../assets/icon/layout-square-dark.svg';
import LightSquareIcon from '../../assets/icon/layout-square.svg';

const SquareIcon: VoidFunctionComponent = () => {
  const theme = useTheme();

  if (theme.palette.type === 'light') return <LightSquareIcon />;
  return <DarkSquareIcon />;
};

export default memo(SquareIcon);
