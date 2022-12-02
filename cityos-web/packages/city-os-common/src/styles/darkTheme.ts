import { ThemeOptions, createMuiTheme } from '@material-ui/core/styles';

import { lightThemeOptions } from './lightTheme';

const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    ...lightThemeOptions.palette,
    type: 'dark',
    primary: {
      light: '#00C2FF',
      main: '#1A84F9',
      dark: '#1A58F9',
      contrastText: '#FFF',
    },
    secondary: {
      ...lightThemeOptions.palette?.secondary,
      main: '#20AA7E',
    },
    error: {
      ...lightThemeOptions.palette?.error,
      main: '#DD5969',
    },
    warning: {
      ...lightThemeOptions.palette?.warning,
      main: '#D98F1F',
    },
    text: {
      ...lightThemeOptions.palette?.text,
      primary: '#FFF',
      disabled: '#33334D',
      subtitle: '#2176C5',
    },
    info: {
      main: '#BDBDBD',
      contrastText: '#FFF',
    },
    grey: {
      ...lightThemeOptions.palette?.grey,
      50: 'rgba(255, 255, 255, 0.05)',
      100: 'rgba(255, 255, 255, 0.12)',
      300: 'rgba(255, 255, 255, 0.26)',
      500: 'rgba(255, 255, 255, 0.49)',
      600: '#BDBDBD',
      700: 'rgba(255, 255, 255, 0.7)',
      800: '#2F3650',
      900: '#FFF',
    },
    action: {
      selected: '#114292',
      hover: '#0E275E',
      active: '#00C2FF',
    },
    background: {
      ...lightThemeOptions.palette?.background,
      default: '#0B0B2A',
      paper: '#182245',
      disabled: '#0D1D49',
      oddRow: '#182245',
      evenRow: '#121A38',
      lightContainer: '#13193A',
      container: '#0B0B2A',
      light: '#13193A',
      mask: 'rgba(19, 87, 159, 0.8)',
      icon: '#2F3650',
      miniTab: '#13579F',
      landingTab: '#BDCFDB',
      playbackVideoToolbar: '#121A38',
      textFieldChip: '#114292',
      dark: '#000',
    },
    pageContainer: {
      title: '#F2F8FE',
    },
    menu: {
      info: '#9EADBD',
    },
    themeIconButton: {
      disabledText: 'rgba(255, 255, 255, 0.12)',
      outlined: '#1B2F64',
      splitMode: '#1B2F64',
      hoverMiner: '#1A58F9',
      hoverStandardText: '#FFF',
      hoverStandard: '#1A58F9',
      hoverStandardBorder: 'transparent',
    },
    gadget: {
      default: '#20AA7E',
      notInService: '#B558F6',
      energyStop: '#FBC01F',
      available: '#25B2FF',
      charging: '#5C61F4',
      value: '#FFF',
      revenue: '#25B2FF',
      frame: 'rgba(0, 0, 0, 0.26)',
      counter: '#0B0B2A',
      contrastText: '#FFF',
      reserved: '#9EADBD',
      unavailable: '#E0E0E0',
      stopCharging: '#D98F1F',
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
    automation: {
      track: '#1B2F64',
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
  },
  shadows: [
    'none',
    '0px 2px 1px rgba(0, 0, 0, 0.5)',
    '0px 3px 1px rgba(0, 0, 0, 0.5)',
    '0px 3px 3px rgba(0, 0, 0, 0.5)',
    '0px 2px 4px rgba(0, 0, 0, 0.5)',
    '0px 3px 5px rgba(0, 0, 0, 0.5)',
    '0px 3px 5px rgba(0, 0, 0, 0.5)',
    '0px 4px 5px rgba(0, 0, 0, 0.5)',
    '0px 5px 5px rgba(0, 0, 0, 0.5)',
    '0px 5px 6px rgba(0, 0, 0, 0.5)',
    '0px 6px 6px rgba(0, 0, 0, 0.5)',
    '0px 6px 7px rgba(0, 0, 0, 0.5)',
    '0px 7px 8px rgba(0, 0, 0, 0.5)',
    '0px 7px 8px rgba(0, 0, 0, 0.5)',
    '0px 7px 9px rgba(0, 0, 0, 0.5)',
    '0px 8px 9px rgba(0, 0, 0, 0.5)',
    '0px 8px 10px rgba(0, 0, 0, 0.5)',
    '0px 8px 11px rgba(0, 0, 0, 0.5)',
    '0px 9px 11px rgba(0, 0, 0, 0.5)',
    '0px 9px 12px rgba(0, 0, 0, 0.5)',
    '0px 10px 13px rgba(0, 0, 0, 0.5)',
    '0px 10px 13px rgba(0, 0, 0, 0.5)',
    '0px 10px 14px rgba(0, 0, 0, 0.5)',
    '0px 11px 14px rgba(0, 0, 0, 0.5)',
    '0px 11px 15px rgba(0, 0, 0, 0.5)',
  ],
  overrides: {
    ...lightThemeOptions.overrides,
    MuiCssBaseline: {
      '@global': {
        body: {
          scrollbarColor: 'rgba(255, 255, 255, 0.12) #0B0B2A',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#0B0B2A',
            width: 14,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            minHeight: 24,
            boxShadow: 'inset 0 0 10px 10px rgba(255, 255, 255, 0.12)',
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
      ...lightThemeOptions.overrides?.MuiAlert,
      standardError: {
        ...lightThemeOptions.overrides?.MuiAlert?.standardError,
        backgroundColor: '#4A4A61',
      },
      message: {
        ...lightThemeOptions.overrides?.MuiAlert?.message,
        color: 'rgba(255, 255, 255, 0.7)',
      },
      filledInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.26)',
      },
    },
    MuiAlertTitle: {
      ...lightThemeOptions.overrides?.MuiAlertTitle,
      root: {
        ...lightThemeOptions.overrides?.MuiAlertTitle?.root,
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
    MuiButton: {
      ...lightThemeOptions.overrides?.MuiButton,
      contained: {
        ...lightThemeOptions.overrides?.MuiButton?.contained,
        '&.Mui-disabled': {
          backgroundColor: '#0D1D49',
          color: 'rgba(255, 255, 255, 0.12)',
        },
      },
      outlined: {
        ...lightThemeOptions.overrides?.MuiButton?.outlined,
        '&:hover': {
          backgroundColor: '#1A58F9',
          color: '#FFF',
        },
        '&.Mui-disabled': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
      outlinedPrimary: {
        ...lightThemeOptions.overrides?.MuiButton?.outlinedPrimary,
        border: '2px solid #1B2F64',
        backgroundColor: '#1B2F64',
        boxShadow: 'transparent',
        '&:hover': {
          border: '2px solid #1A58F9',
          backgroundColor: '#1A58F9',
          color: '#FFF',
        },
      },
      text: {
        ...lightThemeOptions.overrides?.MuiButton?.text,
        color: '#1A84F9',
        '&:hover': {
          backgroundColor: 'rgba(26, 132, 249, 0.1)',
          color: '#01C1FF',
        },
      },
    },
    MuiIconButton: {
      root: {
        border: '2px solid transparent',
        '&:disabled': {
          color: 'rgba(255, 255, 255, 0.26)',
          borderColor: 'transparent',
        },
      },
    },
    MuiInputBase: {
      ...lightThemeOptions.overrides?.MuiInputBase,
      root: {
        ...lightThemeOptions.overrides?.MuiInputBase?.root,
        backgroundColor: '#182245',
      },
      input: {
        '&.Mui-disabled': {
          '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.26)',
          opacity: 1,
        },
      },
      inputTypeSearch: {
        '-webkit-appearance': 'none',
      },
      adornedEnd: {
        '& .MuiSvgIcon-root, & .MuiInputAdornment-root': {
          color: 'rgba(255, 255, 255, 0.49)',
        },
      },
    },
    MuiFormControl: {
      ...lightThemeOptions.overrides?.MuiFormControl,
      root: {
        ...lightThemeOptions.overrides?.MuiFormControl?.root,
        '&:hover label': {
          color: '#1A84F9',
          '&.MuiFormLabel-root.Mui-error': {
            color: '#DD5969',
          },
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1A84F9',
        },
        '&:hover .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.26)',
        },
        '&:hover .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '#DD5969',
        },
      },
    },
    MuiOutlinedInput: {
      ...lightThemeOptions.overrides?.MuiOutlinedInput,
      root: {
        ...lightThemeOptions.overrides?.MuiOutlinedInput?.root,
        '&:hover $notchedOutline': {
          borderColor: '#1A84F9',
        },
        '&:hover legend': {
          color: '#1A84F9',
        },
      },
      notchedOutline: {
        ...lightThemeOptions.overrides?.MuiOutlinedInput?.notchedOutline,
        borderColor: 'rgba(255, 255, 255, 0.26)',
      },
    },
    MuiInputLabel: {
      ...lightThemeOptions.overrides?.MuiInputLabel,
      root: {
        ...lightThemeOptions.overrides?.MuiInputLabel?.root,
        color: 'rgba(255, 255, 255, 0.7)',

        '&.Mui-disabled': {
          '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.26)',
        },
      },
    },
    MuiMenu: {
      ...lightThemeOptions.overrides?.MuiMenu,
      paper: {
        ...lightThemeOptions.overrides?.MuiMenu?.paper,
        border: `1px solid rgba(255, 255, 255, 0.12)`,
      },
    },
    MuiMenuItem: {
      ...lightThemeOptions.overrides?.MuiMenuItem,
      root: {
        ...lightThemeOptions.overrides?.MuiMenuItem?.root,
        color: 'rgba(255, 255, 255, 0.7)',

        '&:hover': {
          color: '#FFF',
        },
      },
    },
    MuiListItem: {
      ...lightThemeOptions.overrides?.MuiListItem,
      root: {
        ...lightThemeOptions.overrides?.MuiListItem?.root,
        color: 'rgba(255, 255, 255, 0.7)',
        backgroundColor: '#182245',
        '&:hover': {
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: '#114292',
        },
        '&$selected': {
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: '#114292',
          '&:hover': {
            color: '#FFF',
          },
        },
      },
      button: {
        '&:hover': {
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: '#114292',
        },
        '&$selected': {
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: '#114292',
          '&:hover': {
            color: '#FFF',
          },
        },
        '& .MuiTouchRipple-root span': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiPaper: {
      ...lightThemeOptions.overrides?.MuiPaper,
      outlined: {
        ...lightThemeOptions.overrides?.MuiPaper?.outlined,
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
    MuiSlider: {
      ...lightThemeOptions.overrides?.MuiSlider,
      mark: {
        ...lightThemeOptions.overrides?.MuiSlider?.mark,
        backgroundColor: '#182245',
      },
      thumb: {
        ...lightThemeOptions.overrides?.MuiSlider?.thumb,
        border: '2px solid #1A84F9',
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      },
      stickyHeader: {
        backgroundColor: '#13193A',
      },
      head: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
    MuiTableRow: {
      root: {
        backgroundColor: '#121A38',
      },
      head: {
        '&.MuiTableRow-head': {
          backgroundColor: '#13193A',
        },
      },
    },
    MuiTablePagination: {
      ...lightThemeOptions.overrides?.MuiTablePagination,
      root: {
        ...lightThemeOptions.overrides?.MuiTablePagination?.root,
        backgroundColor: '#13193A',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
      selectRoot: {
        backgroundColor: 'transparent',
      },
      actions: {
        ...lightThemeOptions.overrides?.MuiTablePagination?.actions,
        '& button': {
          padding: 0,
          color: '#1A84F9',
          borderRadius: 8,
          '&:hover': {
            borderRadius: 8,
            backgroundColor: '#1A58F9',
            color: '#FFF',
          },
        },
      },
    },
    MuiTableContainer: {
      root: {
        ...lightThemeOptions.overrides?.MuiTableContainer?.root,
        border: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
    MuiAvatar: {
      colorDefault: {
        color: '#FFF',
      },
    },
    MuiChip: {
      root: {
        ...lightThemeOptions.overrides?.MuiChip?.root,
        borderWidth: 0,
        '&.MuiChip-clickable.MuiChip-outlined:hover': {
          backgroundColor: '#4A4961',
        },
        '&.MuiChip-clickable.MuiChip-outlinedPrimary:hover': {
          backgroundColor: '#114292',
        },
        '&.MuiChip-clickable.MuiChip-outlinedPrimary.MuiChip-outlined:focus, &.MuiChip-deletable.MuiChip-outlinedPrimary.MuiChip-outlined:focus':
          {
            backgroundColor: '#114292',
          },
      },
      outlined: {
        backgroundColor: '#4A4961',
        borderWidth: 0,
      },
      outlinedPrimary: {
        backgroundColor: '#114292',
        borderWidth: 0,
      },
      label: {
        color: '#FFF',
      },
    },
    MuiStepIcon: {
      root: {
        '& .MuiStepIcon-text': {
          fill: '#0B0B2A',
        },
        '&.MuiStepIcon-active .MuiStepIcon-text': {
          fill: '#FFF',
        },
      },
    },
    MuiSwitch: {
      ...lightThemeOptions.overrides?.MuiSwitch,
      thumb: {
        ...lightThemeOptions.overrides?.MuiSwitch?.thumb,
        backgroundColor: 'rgba(255, 255, 255, 0.26)',
      },
      track: {
        ...lightThemeOptions.overrides?.MuiSwitch?.track,
        backgroundColor: '#1B2F64',
        border: '1px solid #BDBDBD',
      },
      colorPrimary: {
        ...lightThemeOptions.overrides?.MuiSwitch?.colorPrimary,
        '&$checked + $track': {
          backgroundColor: '#1B2F64',
        },
        '&$checked $thumb': {
          backgroundColor: '#1A84F9',
        },
      },
    },
    MuiSelect: {
      icon: {
        color: '#BDBDBD',
      },
    },
    MuiPickersCalendarHeader: {
      ...lightThemeOptions.overrides?.MuiPickersCalendarHeader,
      dayLabel: {
        color: 'rgba(255, 255, 255, 0.49)',
      },
      iconButton: {
        color: 'rgba(255, 255, 255, 0.49)',
        borderRadius: 8,
        padding: 0,
        '&:hover': {
          backgroundColor: '#1A58F9',
          color: '#FFF',
        },
      },
    },
    MuiPickersDay: {
      ...lightThemeOptions.overrides?.MuiPickersDay,
      day: {
        '&:hover': {
          backgroundColor: '#1A58F9',
          fontWeight: 700,
        },
      },
      daySelected: {
        fontWeight: 700,
      },
      dayDisabled: {
        color: 'rgba(255, 255, 255, 0.26)',
      },
    },
    MuiPickerDTToolbar: {
      ...lightThemeOptions.overrides?.MuiPickerDTToolbar,
      toolbar: {
        backgroundColor: '#121A38',
        '& .MuiPickersToolbarText-toolbarTxt': {
          color: '#FFF',
          opacity: 0.5,
          fontWeight: 400,
        },
        '& .MuiPickersToolbarText-toolbarBtnSelected': {
          opacity: 1,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      },
    },
  },
};

const darkTheme = createMuiTheme(darkThemeOptions);

export default darkTheme;
