import React, { FunctionComponent, PropsWithChildren, ReactNode, useMemo } from 'react';

import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { Theme } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import darkTheme from 'city-os-common/styles/darkTheme';
import lightTheme from 'city-os-common/styles/lightTheme';

interface ThemeProviderProps {
  children?: ReactNode;
}

const ThemeProvider: FunctionComponent = ({ children }: PropsWithChildren<ThemeProviderProps>) => {
  const {
    userProfile: { profile },
  } = useStore();

  const muiTheme = useMemo(
    () => (!profile?.theme || profile.theme === Theme.LIGHT ? lightTheme : darkTheme),
    [profile?.theme],
  );

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
