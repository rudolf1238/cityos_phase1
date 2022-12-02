import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import DarkSelectedSquareIcon from '../../assets/icon/layout-square-selected-dark.svg';
import LightSelectedSquareIcon from '../../assets/icon/layout-square-selected.svg';

const SelectedSquareIcon: VoidFunctionComponent = () => {
  const theme = useTheme();

  if (theme.palette.type === 'light') return <LightSelectedSquareIcon />;
  return <DarkSelectedSquareIcon />;
};

export default memo(SelectedSquareIcon);
