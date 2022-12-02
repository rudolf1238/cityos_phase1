import { ThemeOptions, createMuiTheme } from '@material-ui/core/styles';

export const lightThemeOptions: ThemeOptions = {
  palette: {
    type: 'light',
    primary: {
      light: '#47C3F9',
      main: '#25B2FF',
      dark: '#0094E5',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#29CB97',
      contrastText: '#FFF',
    },
    error: {
      main: '#FF6363',
      contrastText: '#FFF',
    },
    success: {
      main: '#29CB97',
      contrastText: '#FFF',
    },
    text: {
      primary: '#4F4F4F',
      secondary: '#828282',
      disabled: '#E0E0E0',
      hint: '#BDBDBD',
      subtitle: '#748AA1',
    },
    info: {
      main: '#748AA1',
      contrastText: '#FFF',
    },
    warning: {
      main: '#FF9800',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    grey: {
      50: 'rgba(0, 0, 0, 0.05)',
      100: 'rgba(0, 0, 0, 0.12)',
      300: 'rgba(0, 0, 0, 0.26)',
      400: '#BDBDBD',
      500: 'rgba(0, 0, 0, 0.49)',
      600: '#828282',
      700: 'rgba(0, 0, 0, 0.7)',
      800: '#4F4F4F',
      900: '#000',
    },
    action: {
      selected: '#E9F7FF',
      hover: '#F4FBFF',
      active: '#47C3F9',
    },
    background: {
      disabled: '#E0E0E0',
      oddRow: '#FAFBFD',
      evenRow: '#FFF',
      player: 'rgba(0, 0, 0, 0.87)',
      lightContainer: '#FAFBFD',
      container: '#F5F6FA',
      light: '#F1F5F9',
      mask: 'rgba(158, 173, 189, 0.8)',
      icon: '#748AA1',
      tooltip: 'rgba(0, 0, 0, 0.85)',
      miniTab: '#9EADBD',
      landingTab: '#BDCFDB',
      playbackVideoToolbar: '#FFF',
      textFieldChip: '#F5F6FA',
      dark: '#000',
    },
    group: {
      root: '#0094E5',
      project: '#FF9A0F',
      parent: '#25B2FF',
      leaf: '#0F7CC9',
    },
    pageContainer: {
      title: '#092C4C',
    },
    landingPage: {
      main: '#162252',
      contrastText: '#FFF',
    },
    shadow: {
      player:
        '0px 16px 24px rgba(69, 178, 234, 0.24), 0px 4px 8px rgba(69, 178, 234, 0.3), 0px 8px 16px rgba(15, 177, 255, 0.2)',
    },
    menu: {
      info: '#748AA1',
    },
    themeIconButton: {
      disabledText: '#FFF',
      outlined: '#FFF',
      splitMode: '#E0E0E0',
      hoverMiner: '#E9F7FF',
      hoverStandardText: '#25B2FF',
      hoverStandard: 'rgba(37, 178, 255, 0.2)',
      hoverStandardBorder: '#25B2FF',
    },
    gadget: {
      default: '#29CB97',
      notInService: '#B558F6',
      energyStop: '#FBC01F',
      available: '#25B2FF',
      charging: '#5C61F4',
      value: '#092C4C',
      revenue: '#1A84F9',
      frame: 'rgba(0, 0, 0, 0.26)',
      counter: '#BDBDBD',
      contrastText: '#000',
      reserved: '#9EADBD',
      unavailable: '#E0E0E0',
      stopCharging: '#FF9800',
      offline: '#748AA1',
      preparing: '#114292',
      alarm: '#FB7181',
      paper: '#FFF',
      dark: '#000',
      male: '#25B2FF',
      female: '#FF70D7',
      indoorAirQuality: '#fd704b',
      indoorTemperature: '#fd9727',
    },
    aqi: {
      good: '#14C887',
      unhealthy: '#FF1E52',
      veryUnhealthy: '#6D00B9',
    },
    events: {
      crowd: '#5C61F4',
      traffic: '#748AA1',
    },
    heatmap: {
      color: {
        0: 'rgba(179, 203, 203, 0.7)',
        300: 'rgba(183, 234, 179, 0.7)',
        400: 'rgba(255, 255, 70, 0.9)',
        500: '#fd704b',
        600: '#ea437b',
      },
    },
    automation: {
      track: '#C4C4C4',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontSize: 16,
    h1: {
      fontSize: '3.5rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h2: {
      fontSize: '3rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h3: {
      fontSize: '2.5rem',
      lineHeight: 1.1,
      fontWeight: 500,
    },
    h4: {
      fontSize: '2rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.5rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h6: {
      fontSize: '1.25rem',
      lineHeight: 2,
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 700,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.285,
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.1,
      fontWeight: 400,
    },
    button: {
      fontSize: '1rem',
      lineHeight: 1.1,
      fontWeight: 700,
    },
    overline: {
      fontSize: '0.625rem',
      lineHeight: 1.1,
      fontWeight: 400,
      letterSpacing: '0.0125em',
    },
  },
  shadows: [
    'none',
    '0px 2px 1px rgba(155, 155, 155, 0.5)',
    '0px 3px 1px rgba(155, 155, 155, 0.5)',
    '0px 3px 3px rgba(155, 155, 155, 0.5)',
    '0px 2px 4px rgba(155, 155, 155, 0.5)',
    '0px 3px 5px rgba(155, 155, 155, 0.5)',
    '0px 3px 5px rgba(155, 155, 155, 0.5)',
    '0px 4px 5px rgba(155, 155, 155, 0.5)',
    '0px 5px 5px rgba(155, 155, 155, 0.5)',
    '0px 5px 6px rgba(155, 155, 155, 0.5)',
    '0px 6px 6px rgba(155, 155, 155, 0.5)',
    '0px 6px 7px rgba(155, 155, 155, 0.5)',
    '0px 7px 8px rgba(155, 155, 155, 0.5)',
    '0px 7px 8px rgba(155, 155, 155, 0.5)',
    '0px 7px 9px rgba(155, 155, 155, 0.5)',
    '0px 8px 9px rgba(155, 155, 155, 0.5)',
    '0px 8px 10px rgba(155, 155, 155, 0.5)',
    '0px 8px 11px rgba(155, 155, 155, 0.5)',
    '0px 9px 11px rgba(155, 155, 155, 0.5)',
    '0px 9px 12px rgba(155, 155, 155, 0.5)',
    '0px 10px 13px rgba(155, 155, 155, 0.5)',
    '0px 10px 13px rgba(155, 155, 155, 0.5)',
    '0px 10px 14px rgba(155, 155, 155, 0.5)',
    '0px 11px 14px rgba(155, 155, 155, 0.5)',
    '0px 11px 15px rgba(155, 155, 155, 0.5)',
  ],
  zIndex: {
    leafletPreviewPopup: 1000,
    leafletPreviewMarker: 2000,
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          scrollbarColor: '#E0E0E0 #F5F6FA',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#F5F6FA',
            width: 14,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            minHeight: 24,
            boxShadow: 'inset 0 0 10px 10px #E0E0E0',
            border: 'solid 4px transparent',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active, &::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              boxShadow: 'inset 0 0 10px 10px #959595',
            },
        },
      },
    },
    MuiAlert: {
      standardError: {
        backgroundColor: '#FFEFEF',
      },
      message: {
        color: 'rgba(0, 0, 0, 0.7)',
      },
      filledInfo: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
    MuiAlertTitle: {
      root: {
        color: 'rgba(0, 0, 0, 0.7)',
        margin: 0,
      },
    },
    MuiButton: {
      root: {
        padding: '20px 84px',
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        border: '2px solid transparent',
        '&.Mui-disabled': {
          backgroundColor: '#E0E0E0',
          color: '#FFF',
        },
        '&:hover': {
          boxShadow: 'none',
        },
      },
      outlined: {
        padding: '20px 84px',
        '&:hover': {
          backgroundColor: '#E9F7FF',
          color: '#25B2FF',
        },
      },
      sizeSmall: {
        padding: '16px 68px',
        fontSize: '1rem',
      },
      outlinedPrimary: {
        border: '2px solid #25B2FF',
        backgroundColor: '#FFF',
        '&:hover': {
          border: '2px solid #25B2FF',
          backgroundColor: 'rgba(37, 178, 255, 0.1)',
        },
      },
      text: {
        color: '#25B2FF',
        fontWeight: 700,
        fontSize: '0.875rem',
        textTransform: 'capitalize',
        '&:hover': {
          backgroundColor: 'rgba(37, 178, 255, 0.1)',
        },
      },
    },
    MuiDialogActions: {
      root: {
        width: 240,
        height: 48,
        margin: 'auto',
      },
    },
    MuiIconButton: {
      root: {
        border: '2px solid transparent',
        '&:disabled': {
          color: '#E0E0E0',
          borderColor: '#E0E0E0',
        },
        '&:hover': {
          borderColor: 'currentColor',
        },
      },
    },
    MuiInputBase: {
      root: {
        backgroundColor: '#FFF',

        '&.Mui-disabled': {
          pointerEvents: 'none',
        },
      },
      input: {
        '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active':
          {
            '-webkit-box-shadow': '0 0 0 30px white inset !important',
          },
        '&.Mui-disabled': {
          '-webkit-text-fill-color': '#E0E0E0',
          opacity: 1,
        },
      },
      inputTypeSearch: {
        '-webkit-appearance': 'none',
      },
      adornedEnd: {
        '& .MuiSvgIcon-root, & .MuiInputAdornment-root': {
          color: 'rgba(0, 0, 0, 0.49)',
        },
      },
      inputMultiline: {
        lineHeight: 1.4,
      },
    },
    MuiFormControl: {
      root: {
        '&:hover label': {
          color: '#25B2FF',
          '&.MuiFormLabel-root.Mui-disabled': {
            color: '#E0E0E0',
          },
          '&.MuiFormLabel-root.Mui-error': {
            color: '#FF6363',
          },
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#25B2FF',
        },
        '&:hover .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.26)',
        },
        '&:hover .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '#FF6363',
        },
      },
    },
    MuiOutlinedInput: {
      root: {
        '&:hover $notchedOutline': {
          borderColor: '#25B2FF',
        },
        '&:hover legend': {
          color: '#25B2FF',
        },
        '&$focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1,
        },
      },
    },
    MuiMenu: {
      paper: {
        border: `1px solid rgba(0, 0, 0, 0.12)`,
        boxShadow: 'none',
        marginTop: 8,
        borderRadius: 8,
        '&::-webkit-scrollbar': {
          borderRadius: `0 8px 8px 0`,
        },
      },
      list: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    MuiMenuItem: {
      root: {
        paddingTop: 16,
        paddingBottom: 16,
        height: 56,
        '&:hover': {
          color: 'rgba(0, 0, 0, 0.87)',
        },
      },
    },
    MuiListItem: {
      root: {
        paddingTop: 16,
        paddingBottom: 16,
        color: 'rgba(0, 0, 0, 0.7)',
        backgroundColor: '#FFF',
        '&:hover': {
          backgroundColor: '#E9F7FF',
        },
        '&$selected': {
          color: 'rgba(0, 0, 0, 0.7)',
          backgroundColor: '#E9F7FF',
          '&:hover': {
            color: '#FFF',
            backgroundColor: '#0094E5',
          },
        },
      },
      gutters: {
        paddingLeft: 20,
        paddingRight: 20,
      },
      button: {
        '&:hover': {
          color: 'rgba(0, 0, 0, 0.87)',
          backgroundColor: '#E9F7FF',
        },
        '&$selected': {
          color: 'rgba(0, 0, 0, 0.7)',
          backgroundColor: '#E9F7FF',
          '&:hover': {
            color: '#FFF',
            backgroundColor: '#0094E5',
          },
        },
        '& .MuiTouchRipple-root span': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 5,
      },
      outlined: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
    MuiSlider: {
      rail: {
        height: 8,
        borderRadius: 8,
      },
      track: {
        height: 8,
        borderRadius: 8,
      },
      mark: {
        height: 8,
        backgroundColor: '#FFF',
        borderRadius: 0,
      },
      thumb: {
        width: 24,
        height: 24,
        marginLeft: -12,
        marginTop: -8,
        backgroundColor: '#FFF',
        border: '2px solid #25B2FF',
      },
      valueLabel: {
        left: 'calc(-50% + 3px)',
        fontSize: '1rem',
      },
    },
    MuiTab: {
      labelIcon: {
        '& .MuiTab-wrapper > :first-child': {
          marginBottom: 2,
        },
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
      stickyHeader: {
        backgroundColor: '#F1F5F9',
      },
    },
    MuiTableRow: {
      root: {
        backgroundColor: '#FFF',
      },
      head: {
        '&.MuiTableRow-head': {
          backgroundColor: '#F1F5F9',
        },
      },
    },
    MuiTablePagination: {
      root: {
        backgroundColor: '#FAFBFD',
        border: '1px solid rgba(0, 0, 0, 0.12)',
      },
      selectRoot: {
        backgroundColor: 'transparent',
      },
      actions: {
        display: 'flex',
        gap: 16,
        marginRight: 20,
        '& button': {
          padding: 0,
          color: '#25B2FF',
          border: 'none',
          borderRadius: 8,
          '&:hover': {
            borderRadius: 8,
            backgroundColor: 'rgba(37, 178, 255, 0.1)',
          },
        },
        '& .MuiTouchRipple-root span': {
          borderRadius: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableContainer: {
      root: {
        borderRadius: 8,
        border: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
    MuiChip: {
      root: {
        fontSize: '0.625rem',
        '&.MuiChip-clickable.MuiChip-outlined:hover': {
          backgroundColor: 'transparent',
        },
        '&.MuiChip-clickable.MuiChip-outlinedPrimary:hover': {
          backgroundColor: 'rgba(37, 178, 255, 0.2)',
        },
      },
      outlinedPrimary: {
        backgroundColor: 'rgba(37, 178, 255, 0.2)',
      },
    },
    MuiDivider: {
      middle: {
        marginLeft: 8,
        marginRight: 8,
      },
    },
    MuiLinearProgress: {
      root: {
        height: 8,
        borderRadius: 4,
      },
      colorPrimary: {
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      },
      colorSecondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.26)',
      },
    },
    MuiSwitch: {
      root: {
        width: 40,
        height: 24,
        padding: 0,
        margin: 0,
      },
      switchBase: {
        padding: 0,
        '&$checked': {
          transform: 'translateX(16px)',
        },
        '&$colorPrimary:hover': {
          color: 'transparent',
        },
      },
      thumb: {
        width: 20,
        height: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.26)',
        boxShadow: 'none',
      },
      track: {
        borderRadius: 12,
        backgroundColor: '#FFF',
        border: '1px solid #C4C4C4',
      },
      colorPrimary: {
        '&$checked + $track': {
          backgroundColor: '#FFF',
        },
        '&$checked $thumb': {
          backgroundColor: '#25B2FF',
        },
      },
    },
    MuiPickersBasePicker: {
      container: {
        '& > .MuiPaper-root': {
          boxShadow: 'none',
        },
      },
      pickerView: {
        paddingBottom: 12,
      },
    },
    MuiPickersCalendarHeader: {
      switchHeader: {
        padding: 20,
      },
      iconButton: {
        color: 'rgba(0, 0, 0, 0.49)',
        borderRadius: 8,
        border: 'none',
        padding: 0,
        '&:hover': {
          backgroundColor: '#E9F7FF',
          color: '#25B2FF',
        },
      },
    },
    MuiPickersDay: {
      day: {
        border: 'none',
        '&:hover': {
          backgroundColor: 'rgba(37, 178, 255, 0.1)',
          color: '#25B2FF',
          fontWeight: 700,
        },
      },
      daySelected: {
        fontWeight: 700,
        '&:hover': {
          color: '#FFF',
        },
      },
      dayDisabled: {
        color: 'rgba(0, 0, 0, 0.26)',
      },
    },
    MuiPickerDTToolbar: {
      toolbar: {
        backgroundColor: 'transparent',

        '& .MuiPickersToolbarText-toolbarTxt': {
          color: 'rgba(0, 0, 0, 0.87)',
          opacity: 0.5,
          fontWeight: 400,
        },

        '& .MuiPickersToolbarText-toolbarBtnSelected': {
          opacity: 1,
        },
      },
    },
    MuiPickerDTTabs: {
      tabs: {
        backgroundColor: 'transparent',
        color: '#BDBDBD',

        '& .Mui-selected': {
          color: '#25B2FF',
        },

        '& .MuiTabs-indicator': {
          backgroundColor: '#25B2FF',
        },
      },
    },
    MuiSelect: {
      icon: {
        color: '#828282',
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      },
    },
  },
};

const lightTheme = createMuiTheme(lightThemeOptions);

export default lightTheme;
