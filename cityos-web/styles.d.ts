declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    disabled: string;
    oddRow: string;
    evenRow: string;
    player: string;
    container: string;
    light: string;
    lightContainer: string;
    mask: string;
    icon: string;
    tooltip: string;
    miniTab: string;
    landingTab: string;
    playbackVideoToolbar: string;
    textFieldChip: string;
    dark: string;
  }

  interface TypeText {
    subtitle: string;
  }

  interface Palette {
    group: {
      root: string;
      project: string;
      parent: string;
      leaf: string;
    };
    pageContainer: {
      title: string;
    };
    landingPage: {
      main: string;
      contrastText: string;
    };
    shadow: {
      player: string;
    };
    menu: {
      info: string;
    };
    themeIconButton: {
      disabledText: string;
      outlined: string;
      splitMode: string;
      hoverMiner: string;
      hoverStandardText: string;
      hoverStandard: string;
      hoverStandardBorder: string;
    };
    gadget: {
      default: string;
      notInService: string;
      energyStop: string;
      available: string;
      charging: string;
      value: string;
      revenue: string;
      frame: string;
      counter: string;
      contrastText: string;
      reserved: string;
      unavailable: string;
      stopCharging: string;
      offline: string;
      preparing: string;
      alarm: string;
      paper: string;
      dark: string;
      male: string;
      female: string;
      indoorAirQuality: string;
      indoorTemperature: string;
    };
    aqi: {
      good: string;
      unhealthy: string;
      veryUnhealthy: string;
    };
    events: {
      crowd: string;
      traffic: string;
    };
    automation: {
      track: string;
    };
    heatmap: {
      color: {
        0: string;
        300: string;
        400: string;
        500: string;
        600: string;
      };
    };
  }

  interface PaletteOptions {
    group?: {
      root: string;
      project: string;
      parent: string;
      leaf: string;
    };
    pageContainer?: {
      title: string;
    };
    landingPage?: {
      main: string;
      contrastText: string;
    };
    shadow?: {
      player: string;
    };
    menu?: {
      info: string;
    };
    themeIconButton?: {
      disabledText: string;
      outlined: string;
      splitMode: string;
      hoverMiner: string;
      hoverStandardText: string;
      hoverStandard: string;
      hoverStandardBorder: string;
    };
    gadget?: {
      default: string;
      notInService: string;
      energyStop: string;
      available: string;
      charging: string;
      value: string;
      revenue: string;
      frame: string;
      counter: string;
      contrastText: string;
      reserved: string;
      unavailable: string;
      stopCharging: string;
      offline: string;
      preparing: string;
      alarm: string;
      paper: string;
      dark: string;
      male: string;
      female: string;
      indoorAirQuality: string;
      indoorTemperature: string;
    };
    aqi?: {
      good: string;
      unhealthy: string;
      veryUnhealthy: string;
    };
    events?: {
      crowd: string;
      traffic: string;
    };
    heatmap?: {
      color: {
        0: string;
        300: string;
        400: string;
        500: string;
        600: string;
      };
    };
    automation?: {
      track: string;
    };
  }
}

declare module '@material-ui/core/styles/zIndex' {
  interface ZIndex {
    leafletPreviewMarker: number;
    leafletPreviewPopup: number;
  }
  interface ZIndexOptions {
    leafletPreviewMarker?: number;
    leafletPreviewPopup?: number;
  }
}

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    zIndex: {
      leafletPreviewMarker: number;
      leafletPreviewPopup: number;
    };
  }

  interface ThemeOptions {
    zIndex?: {
      leafletPreviewMarker?: number;
      leafletPreviewPopup?: number;
    };
  }
}

export {};
