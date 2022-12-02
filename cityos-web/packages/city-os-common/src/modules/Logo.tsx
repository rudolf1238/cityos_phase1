import { useTheme } from '@material-ui/core/styles';
import React, { ComponentProps } from 'react';

import CityOSLogo from '../assets/logo/city-os.svg';
import CityOSLogoLight from '../assets/logo/city-os-light.svg';

const Logo: typeof CityOSLogo = (props: ComponentProps<typeof CityOSLogo>) => {
  const theme = useTheme();

  return theme.palette.type === 'light' ? (
    <CityOSLogo {...props} />
  ) : (
    <CityOSLogoLight {...props} />
  );
};

export default Logo;
