import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, {
  ReactNode,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import chunk from 'lodash/chunk';
import clsx from 'clsx';
import i18n from 'i18next';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Alert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Collapse from '@material-ui/core/Collapse';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Image from 'next/image';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuIcon from '@material-ui/icons/Menu';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';

import { DeviceType, Language } from 'city-os-common/libs/schema';
import { isString } from 'city-os-common/libs/validators';
import { languageOptions } from 'city-os-common/libs/i18n';

import AspectRatio from 'city-os-common/modules/AspectRatio';
import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import CityOSLightLogo from 'city-os-common/assets/logo/city-os-light.svg';
import DeviceIcon from 'city-os-common/src/modules/DeviceIcon';

import { CONTACT_US, ContactUsPayload, ContactUsResponse } from '../api/contactUs';
import { changeLanguage, parseI18nLanguage } from '../libs/i18n';
import useWebTranslation from '../hooks/useWebTranslation';

import IoTCityBackground from '../assets/img/iot-city-background.png';
import chtTrainingInstitute from '../assets/img/cht-training-institute.png';
import cityBackground from '../assets/img/city-background.png';
import cityOSBackground from '../assets/img/city-os-background.png';
import cityProjection from '../assets/img/city-projection.png';
import danhaiLightRail from '../assets/img/danhai-light-rail.png';
import dashboardDarkThumbnail from '../assets/img/dashboard-dark-thumbnail.png';
import dashboardLightThumbnail from '../assets/img/dashboard-light-thumbnail.png';
import deviceThumbnail from '../assets/img/device-thumbnail.png';
import floraExpo2018Logo from '../assets/logo/flora-expo-2018.png';
import galaxyBackground from '../assets/img/galaxy-background.png';
import hoFaIndustrialParkLogo from '../assets/logo/ho-fa-industrial-park.png';
import kaohsiungHamasen from '../assets/img/kaohsiung-hamasen.png';
import kaohsiungLogo from '../assets/logo/kaoshiung.png';
import lightPole from '../assets/img/light-pole.png';
import mapThumbnail from '../assets/img/map-thumbnail.png';
import poleDescBackground from '../assets/img/pole-description-background.png';
import tafInnovationBase from '../assets/img/taf-innovation-base.png';
import taichungLogo from '../assets/logo/taichung.png';
import tamsuiCustomsWharf from '../assets/img/tamsui-customs-wharf.png';
import taoyuanIndustrialPark from '../assets/img/taoyuan-industrial-park.png';
import taoyuanLogo from '../assets/logo/taoyuan.png';
import taoyuanQingPuArea from '../assets/img/taoyuan-qing-pu-area.png';
import worldMapBackground from '../assets/img/world-map-background.png';

import CommunicationModuleIcon from '../assets/icon/communication-module.svg';
import ElectricityIcon from '../assets/icon/electricity.svg';
import EmailIcon from '../assets/icon/email.svg';
import EmergencyIcon from '../assets/icon/emergency.svg';
import LanguageIcon from '../assets/icon/language.svg';
import LazyYTPlayer from '../modules/LandingPage/LazyYTPlayer';
import LoginIcon from '../assets/icon/login.svg';
import NetworkIcon from '../assets/icon/network.svg';
import PhoneIcon from '../assets/icon/phone.svg';
import WebsiteIcon from '../assets/icon/website.svg';

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const partners = [
  taichungLogo,
  kaohsiungLogo,
  taoyuanLogo,
  floraExpo2018Logo,
  hoFaIndustrialParkLogo,
];

const valueAsStrippedString = (v: unknown) => (isString(v) ? v.trim() : '');

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.landingPage.main,
  },

  appBar: {
    backgroundColor: theme.palette.landingPage.main,
  },

  toolbar: {
    gap: theme.spacing(2),

    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
    },
  },

  brand: {
    marginRight: 'auto',
    width: 'auto',
    height: 36,
  },

  sectionFeatures: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(12, 9),
    minHeight: 'calc(var(--vh) * 100)',

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(12, 4),
    },

    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      padding: theme.spacing(8, 5),
    },

    '& > *': {
      width: '50%',

      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  },

  sectionFeaturesThumbnail: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(4),
    },
  },

  sectionFeaturesContent: {
    position: 'relative',

    [theme.breakpoints.down('md')]: {
      maxHeight: '100%',
      overflow: 'auto',
    },

    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(4),
    },

    '& > *': {
      marginBottom: theme.spacing(5),
    },
  },

  featureTitle: {
    marginBottom: theme.spacing(2),
  },

  sectionGalaxy: {
    minHeight: 'calc(var(--vh) * 100)',
    textAlign: 'center',
    color: theme.palette.primary.contrastText,
  },

  sectionGalaxyContent: {
    padding: theme.spacing(1.25),
    minHeight: 'calc(var(--vh) * 100)',

    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2.75),
    },

    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6.25),
    },

    '& > *': {
      padding: theme.spacing(1.25),

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2.75),
      },

      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(6.25),
      },
    },
  },

  galaxyTitle: {
    marginBottom: theme.spacing(4),
  },

  '@keyframes floating': {
    from: {
      transform: 'translateY(0)',
    },

    '50%': {
      transform: 'translateY(-10px)',
    },

    to: {
      transform: 'translateY(0)',
    },
  },

  cityProjection: {
    animation: '$floating 5s ease-in-out infinite',
  },

  sectionCards: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(3, 0),

    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3.5),
    },

    [theme.breakpoints.up('md')]: {
      justifyContent: 'center',
    },

    '& > *': {
      padding: theme.spacing(1),
      height: '100%',

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3.5),
      },
    },
  },

  card: {
    borderRadius: theme.shape.borderRadius * 2.5,
    padding: theme.spacing(2.5, 3),
    textAlign: 'left',
  },

  cardHeader: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(2),

    '& > :last-child': {
      flexBasis: 0,
      flexGrow: 1,
    },
  },

  cardContent: {
    marginTop: theme.spacing(2),

    'ul&': {
      marginBottom: 0,
      paddingLeft: '2em',
    },
  },

  sectionShowcase: {
    padding: theme.spacing(13, 1),
    textAlign: 'center',
  },

  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
    borderRadius: '50%',
    backgroundColor: fade(theme.palette.action.selected, 0.3),
    paddingTop: 'calc(50% / 3)',
    width: 'calc(50% / 3)',
    pointerEvents: 'auto',

    '&::before': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 0.4,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      paddingTop: 'calc(500% / 3)',
      width: 'calc(500% / 3)',
    },

    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      width: '100%',
      height: '100%',
    },
  },

  info: {
    position: 'absolute',
    width: 'max(250px, calc(250% / 3))',
  },

  deviceIcon: {
    width: 40,
    height: 40,
    color: theme.palette.primary.main,
  },

  sectionCases: {
    padding: theme.spacing(8, 0),
    textAlign: 'center',
  },

  cases: {
    display: 'inline-flex',
    maxWidth: 720,
    overflow: 'hidden visible',

    '& > *': {
      flexShrink: 0,
      transition: theme.transitions.create('margin-left'),
      padding: theme.spacing(8, 3),
      width: '100%',
    },
  },

  case: {
    borderRadius: theme.shape.borderRadius * 2.5,
    padding: theme.spacing(2),
    minHeight: '100%',

    '& img': {
      borderRadius: theme.shape.borderRadius,
    },

    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },

  pageIndicators: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
  },

  pageIndicator: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.landingTab,
    cursor: 'pointer',
    width: 40,
    height: 8,
  },

  pageIndicatorActive: {
    backgroundColor: theme.palette.primary.main,
  },

  sectionPartners: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(9, 4),
    textAlign: 'center',

    '& > *': {
      display: 'inline-flex',
      gap: theme.spacing(2),
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'min(740px, 100%)',
    },

    '& img': {
      maxWidth: '100%',
    },
  },

  sectionForm: {
    paddingTop: theme.spacing(27),

    '&::after': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      zIndex: -1,
      background: `linear-gradient(to top, ${theme.palette.landingPage.main} 50%, transparent 80%)`,
      width: '100%',
      height: '20%',
      content: '""',
    },
  },

  sectionFormContent: {
    margin: '0 auto',
    padding: theme.spacing(8, 2.5),
    width: `min(740px, calc(100vw - ${theme.spacing(2)}px))`,
    textAlign: 'center',

    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(8, 6),
    },

    '& > :first-child': {
      marginBottom: theme.spacing(4),
    },

    '& > form': {
      padding: theme.spacing(3, 0),

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3, 5),
      },
    },
  },

  footer: {
    backgroundColor: theme.palette.landingPage.main,
    color: theme.palette.landingPage.contrastText,

    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
  },

  footerBrandWrapper: {
    paddingTop: theme.spacing(8),
    textAlign: 'center',
  },

  contactInfo: {
    display: 'inline-block',
    marginTop: theme.spacing(8),

    [theme.breakpoints.down('xs')]: {
      textAlign: 'left',
    },

    '& a': {
      display: 'inline-flex',
      gap: theme.spacing(2.5),
      marginBottom: theme.spacing(2.5),
    },
  },

  footerBottom: {
    display: 'flex',
    flexDirection: 'column',
  },

  ribbon: {
    background: `linear-gradient(to right, #DC8A39 0% 25%, #6BA652 25% 50%, #1882C3 50% 75%, #245F9E 75% 100%)`,
    height: '.875rem',
  },

  footerText: {
    padding: theme.spacing(3, 3, 8),

    [theme.breakpoints.down('xs')]: {
      order: -1,
    },

    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3, 0, 8),
    },
  },

  menuButton: {
    borderRadius: 0,
    padding: theme.spacing(1),
    color: theme.palette.primary.contrastText,

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  menuButtonActive: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,

    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },

  collapse: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },

  menuWrapper: {
    display: 'flex',
    columnGap: theme.spacing(2),

    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      backgroundColor: theme.palette.landingPage.main,
    },
  },

  menuItem: {
    borderRadius: 0,
    padding: theme.spacing(1, 1.5),
    fontWeight: theme.typography.body2.fontWeight,

    [theme.breakpoints.down('xs')]: {
      justifyContent: 'start',
      height: 48,
    },
  },

  languageRoot: {
    position: 'relative',

    '& > $menuItem': {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
  },

  languageList: {
    position: 'absolute',
    marginTop: theme.spacing(1.5),
    backgroundColor: theme.palette.landingPage.main,
    width: '100%',

    [theme.breakpoints.down('xs')]: {
      position: 'relative',
      marginTop: theme.spacing(0),
    },
  },

  languageMenuItem: {
    justifyContent: 'center',
    backgroundColor: theme.palette.landingPage.main,
    cursor: 'pointer',
    height: 48,
    color: fade(theme.palette.primary.contrastText, 0.7),

    '&:hover': {
      backgroundColor: fade(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.contrastText,
    },

    [theme.breakpoints.down('xs')]: {
      justifyContent: 'start',
    },
  },

  menuLabel: {
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(5),
    },
  },

  selected: {
    backgroundColor: fade(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.contrastText,
  },

  successText: {
    lineHeight: 2,
  },

  errorMsgBlock: {
    minHeight: theme.spacing(6.25),

    '& > .MuiAlert-root': {
      lineHeight: 1.5,
    },
  },

  lightPole: {
    display: 'inline-block',
    position: 'relative',
    zIndex: 0,
    marginLeft: 45,
    height: `max(calc(max(calc(var(--vh) * 100), 600px) - ${theme.spacing(20)}px), 900px)`,
    pointerEvents: 'none',

    '& $cardContent': {
      whiteSpace: 'pre-line',
    },

    '& ~ *': {
      marginTop: theme.spacing(1),
    },

    '& > :first-child, & > :first-child *': {
      height: '100%',
    },

    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
      height: 'auto',
    },
  },
}));

const LandingPage: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['landingPage', 'common']);
  const classes = useStyles();
  const router = useRouter();
  const [featureIndex, setFeatureIndex] = useState(0);
  const [languageOpen, setLanguageOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));
  const [casesPage, setCasesPage] = useState<number>(0);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactUsPayload['contactUsInput']>();

  const [contactUs] = useMutation<ContactUsResponse, ContactUsPayload>(CONTACT_US);

  const onSubmit = useCallback(
    async (data: ContactUsPayload['contactUsInput']) => {
      await contactUs({
        variables: {
          contactUsInput: data,
        },
      });
    },
    [contactUs],
  );

  const goToLogin = useCallback(() => {
    void router.push('/login');
  }, [router]);

  const handleLanguageClick = useCallback((language: Language) => {
    void changeLanguage(language);
    setLanguageOpen(false);
  }, []);

  const features = useMemo(
    (): {
      title: string;
      description: string;
      image: StaticImageData;
    }[] => [
      {
        title: t('landingPage:Event Notification'),
        description: t(
          "landingPage:The Mayor or Manager can monitor any events that occur in all corners of the city no matter when and where_ At the same time, each event can be notified to all relevant departments, so that all bureaus of the city government and all departments can receive and respond first-hand information in real time_ Chunghwa Telecom provides the world's most advanced smart pole, which is the best demonstration of smart city winning the first prize_",
        ),
        image: dashboardDarkThumbnail,
      },
      {
        title: t('landingPage:Environmental Monitoring'),
        description: t(
          'landingPage:The smart pole can analyze the flow of people and traffic all the time_ It can also provide guidance and optimal route planning of traffic_ Smart traffic law enforcement can also be implemented, such as red line critical stops, side-by-side parking, etc_, to improve traffic safety; in addition, It can analyze things such as pedestrian flow and vehicle flow to improve traffic_ It can even find missing children or elderly people out through AI image recognition_ The smart pole can also achieve the automatic repair function through the Internet of Things technology_ Your city will always be bright and the various facilities will operate continuously_',
        ),
        image: deviceThumbnail,
      },
      {
        title: t('landingPage:Open Data'),
        description: t(
          'landingPage:Provide open data, such as air, noise, environment, people flow, traffic flow, etc_ Various big data applications can be developed from these big data_ It can also provide different kinds of analyses to users_',
        ),
        image: mapThumbnail,
      },
      {
        title: t('landingPage:Malfunctioned Device Notification'),
        description: t(
          'landingPage:The system automatically detects abnormal device and sends a notification to the maintenance department, saving equipment maintenance manpower_',
        ),
        image: dashboardLightThumbnail,
      },
    ],
    [t],
  );

  const cards = useMemo(
    (): {
      title: string;
      icon: ReactNode;
      items: string[];
    }[] => [
      {
        title: t('landingPage:Common Mounting Platform'),
        icon: <CommunicationModuleIcon />,
        items: [
          t('landingPage:Beautiful'),
          t('landingPage:No wire exposed'),
          t('landingPage:Modularization'),
          t('landingPage:Adjusting device height anytime'),
        ],
      },
      {
        title: t('landingPage:Common Power Supply'),
        icon: <ElectricityIcon />,
        items: [
          t('landingPage:The device does not need to worry about power problems'),
          t('landingPage:Power consumption analysis'),
          t('landingPage:Abnormal power failure alarm'),
        ],
      },
      {
        title: t('landingPage:Common Internet Connectivity'),
        icon: <NetworkIcon />,
        items: [
          t('landingPage:Devices can use shared Internet'),
          t('landingPage:Can be connected via ethernet or 4g/5g network'),
        ],
      },
    ],
    [t],
  );

  const devices = useMemo(
    (): {
      name: string;
      icon: ReactNode;
      description: string;
      marker: [number, number];
      info: { top?: string; right?: string; bottom?: string; left?: string; mdTop?: string };
    }[] => [
      {
        name: t('landingPage:Intelligent Lighting'),
        icon: <DeviceIcon type={DeviceType.LAMP} className={classes.deviceIcon} />,
        description: t('landingPage:Automatic Brightness Adjusting\nAutomatic Maintenance Alert'),
        marker: [5, 3],
        info: { top: '12%', right: '70%' },
      },
      {
        name: t('landingPage:Network'),
        icon: <DeviceIcon type={DeviceType.WIFI} className={classes.deviceIcon} />,
        description: t('landingPage:5G Small Cell\nWi-Fi Hotspot'),
        marker: [9, 37],
        info: { top: '18%', left: '62%' },
      },
      {
        name: t('landingPage:Solar Power'),
        icon: <DeviceIcon type={DeviceType.SOLAR} className={classes.deviceIcon} />,
        description: t('landingPage:Green Energy'),
        marker: [12, 63],
        info: { top: '0%', left: '76%' },
      },
      {
        name: t('landingPage:Video Surveillance'),
        icon: <DeviceIcon type={DeviceType.CAMERA} className={classes.deviceIcon} />,
        description: t('landingPage:Number Plate Recognition\nImage Recognition'),
        marker: [44, 39],
        info: { top: '34%', right: '79%', mdTop: '36%' },
      },
      {
        name: t('landingPage:Weather Station'),
        icon: <DeviceIcon type={DeviceType.ENVIRONMENT} className={classes.deviceIcon} />,
        description: t('landingPage:Automatic Brightness Adjusting\nAutomatic Maintenance Alert'),
        marker: [53, 44],
        info: { top: '53%', right: '79%', mdTop: '57%' },
      },
      {
        name: t('landingPage:Information Display'),
        icon: <DeviceIcon type={DeviceType.DISPLAY} className={classes.deviceIcon} />,
        description: t('landingPage:Advertising\nPolitical News\nInformation releases'),
        marker: [66, 39],
        info: { top: '42%', left: '72%', mdTop: '40%' },
      },
      {
        name: t('landingPage:Emergency Call'),
        icon: <EmergencyIcon className={classes.deviceIcon} />,
        description: t(
          'landingPage:Field contact with the monitoring center\nEmergency Broadcasting',
        ),
        marker: [79, 58],
        info: { top: '63%', left: '77%', mdTop: '64%' },
      },
      {
        name: t('landingPage:Charging Station'),
        icon: <DeviceIcon type={DeviceType.CHARGING} className={classes.deviceIcon} />,
        description: t('landingPage:Electric Car\nElectric Bicycle'),
        marker: [89, 42],
        info: { top: '84%', left: '68%', mdTop: '92%' },
      },
      {
        name: t('landingPage:Water Level Detector '),
        icon: <DeviceIcon type={DeviceType.WATER} className={classes.deviceIcon} />,
        description: t('landingPage:Water level detect\nHigh water level alert'),
        marker: [89, 58],
        info: { top: '74%', right: '70%', mdTop: '81%' },
      },
    ],
    [classes.deviceIcon, t],
  );

  const cases = useMemo(
    (): {
      name: string;
      image: StaticImageData;
    }[] => [
      {
        name: t('landingPage:Taoyuan Industrial Park'),
        image: taoyuanIndustrialPark,
      },
      {
        name: t('landingPage:Tamsui Customs Wharf'),
        image: tamsuiCustomsWharf,
      },
      {
        name: t('landingPage:Taoyuan QingPu Area'),
        image: taoyuanQingPuArea,
      },
      {
        name: t('landingPage:CHT Training Institute'),
        image: chtTrainingInstitute,
      },
      {
        name: t('landingPage:Danhai light rail'),
        image: danhaiLightRail,
      },
      {
        name: t('landingPage:Kaohsiung Hamasen'),
        image: kaohsiungHamasen,
      },
      {
        name: t('landingPage:TAF Innovation Base'),
        image: tafInnovationBase,
      },
    ],
    [t],
  );

  const casesPerPage = 4;
  const casesTotalPages = Math.ceil(cases.length / casesPerPage);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCasesPage((p) => (p + 1) % casesTotalPages);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [casesTotalPages]);

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar className={classes.toolbar}>
          <CityOSLightLogo className={classes.brand} />
          {!smUp && (
            <IconButton
              disableRipple
              aria-label={t('common:Menu')}
              className={clsx(classes.menuButton, { [classes.menuButtonActive]: isExpanded })}
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Collapse
            in={smUp || isExpanded}
            timeout="auto"
            classes={{
              container: classes.collapse,
              wrapperInner: classes.menuWrapper,
            }}
          >
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              className={classes.menuItem}
              onClick={goToLogin}
            >
              {t('landingPage:Login')}
            </Button>
            <ClickAwayListener
              onClickAway={() => {
                setLanguageOpen(false);
              }}
            >
              <div className={classes.languageRoot}>
                <Button
                  color="inherit"
                  startIcon={<LanguageIcon />}
                  endIcon={<ExpandMoreRoundedIcon color="primary" />}
                  aria-controls="language-menu"
                  aria-haspopup="true"
                  className={classes.menuItem}
                  onClick={() => {
                    setLanguageOpen((prev) => !prev);
                  }}
                >
                  {languageOptions[parseI18nLanguage(i18n.language)]}
                </Button>
                {languageOpen && (
                  <List component="div" disablePadding className={classes.languageList}>
                    {(Object.entries(languageOptions) as [Language, string][]).map(
                      ([value, label]) => (
                        <ListItem
                          key={value}
                          value={value}
                          className={clsx(classes.languageMenuItem, {
                            [classes.selected]: parseI18nLanguage(i18n.language) === value,
                          })}
                          onClick={() => handleLanguageClick(value)}
                        >
                          <span className={classes.menuLabel}>{label}</span>
                        </ListItem>
                      ),
                    )}
                  </List>
                )}
              </div>
            </ClickAwayListener>
          </Collapse>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} disableGutters>
        <Toolbar className={classes.toolbar} />
        <LazyYTPlayer
          videoId={process.env.NEXT_PUBLIC_LANDING_PAGE_VIDEO_ID_1 || ''}
          title={t('landingPage:Next Generation City Operation System')}
          backgroundImage={cityOSBackground}
          imagePriority
        />
        <div className={classes.sectionFeatures}>
          <Image
            layout="intrinsic"
            objectFit="contain"
            src={features[featureIndex].image}
            alt={features[featureIndex].title}
            className={classes.sectionFeaturesThumbnail}
            priority
          />
          <div
            className={classes.sectionFeaturesContent}
            onScroll={(event) => {
              const centerY = event.currentTarget.scrollTop + event.currentTarget.clientHeight / 2;
              setFeatureIndex(
                event.currentTarget.children.length -
                  1 -
                  Array.from(event.currentTarget.children)
                    .reverse()
                    .findIndex((node) => (node as HTMLDivElement).offsetTop <= centerY),
              );
            }}
          >
            {features.map(({ title, description }, i) => (
              <div
                onMouseEnter={() => {
                  setFeatureIndex(i);
                }}
                key={i.toString()}
              >
                <Typography variant={xsDown ? 'h5' : 'h4'} className={classes.featureTitle}>
                  {title}
                </Typography>
                <Typography variant={xsDown ? 'body2' : 'body1'}>{description}</Typography>
              </div>
            ))}
          </div>
        </div>
        <BackgroundImage
          className={classes.sectionGalaxy}
          imageData={galaxyBackground}
          objectFit="cover"
          priority
        >
          <Grid
            container
            alignItems="center"
            justify="center"
            className={classes.sectionGalaxyContent}
          >
            <Grid item xs={12} sm={6}>
              <Typography
                variant={xsDown ? 'h5' : 'h3'}
                color="inherit"
                className={classes.galaxyTitle}
              >
                {t('landingPage:Various hardware can be integrated on CityOS')}
              </Typography>
              <Typography variant={xsDown ? 'body2' : 'body1'} color="inherit">
                {t(
                  'landingPage:You can manage and view your smart city devices on CHTCityOS like LED, weather station, Digital Display, Camera, Emergency Call __etc_',
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={classes.cityProjection}>
                <Image
                  layout="responsive"
                  src={cityProjection}
                  alt={t('landingPage:Various hardware can be integrated on CityOS')}
                />
              </div>
              <CityOSLightLogo width="70%" />
            </Grid>
          </Grid>
        </BackgroundImage>
        <LazyYTPlayer
          videoId={process.env.NEXT_PUBLIC_LANDING_PAGE_VIDEO_ID_2 || ''}
          title={t('landingPage:Your next smart pole for your smart city')}
          backgroundImage={cityBackground}
          imagePriority
        />
        <Grid container className={classes.sectionCards}>
          {cards.map(({ title, icon, items }) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={title}>
              <Paper elevation={24} className={classes.card}>
                <div className={classes.cardHeader}>
                  {icon}
                  <Typography variant="subtitle1">{title}</Typography>
                </div>
                <Divider />
                <ul className={classes.cardContent}>
                  {items.map((item) => (
                    <li key={item}>
                      <Typography variant="body1">{item}</Typography>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <BackgroundImage
          className={classes.sectionShowcase}
          imageData={poleDescBackground}
          objectFit="cover"
        >
          <div className={classes.lightPole}>
            <Image layout="intrinsic" objectFit="contain" src={lightPole} alt="" priority />
            {devices.map(({ name, marker }) => (
              <div
                key={name}
                className={classes.marker}
                style={{ top: `${marker[0]}%`, left: `${marker[1]}%` }}
                tabIndex={-1}
                role="button"
                aria-hidden="true"
              />
            ))}
            {smUp &&
              devices.map(({ info, name, icon, description }) => (
                <div
                  key={name}
                  className={classes.info}
                  style={{
                    top: mdDown && info.mdTop ? info.mdTop : info.top,
                    right: info.right,
                    left: info.left,
                    bottom: info.bottom,
                    maxWidth: `calc((100vw - 100%) / 2 ${info.left ? '-' : '+'} ${
                      45 / 2
                    }px - 8px + (100% - ${info.left || info.right || 0})`,
                  }}
                >
                  <Paper elevation={24} className={classes.card}>
                    <div className={classes.cardHeader}>
                      {icon}
                      <Typography variant="subtitle1">{name}</Typography>
                    </div>
                    <Divider />
                    <Typography variant="body1" className={classes.cardContent}>
                      {description}
                    </Typography>
                  </Paper>
                </div>
              ))}
          </div>
          {!smUp &&
            devices.map(({ name, icon, description }) => (
              <div key={name}>
                <Paper elevation={24} className={classes.card}>
                  <div className={classes.cardHeader}>
                    {icon}
                    <Typography variant="subtitle1">{name}</Typography>
                  </div>
                  <Divider />
                  <Typography variant="body1" className={classes.cardContent}>
                    {description}
                  </Typography>
                </Paper>
              </div>
            ))}
        </BackgroundImage>
        <BackgroundImage
          className={classes.sectionCases}
          imageData={worldMapBackground}
          objectFit="cover"
        >
          <Typography variant={xsDown ? 'h5' : 'h2'}>
            {t('landingPage:Successful Cases')}
          </Typography>
          <div className={classes.cases}>
            {chunk(cases, casesPerPage).map((items, i) => (
              <div
                style={{
                  marginLeft: i === 0 ? `calc(-100% * ${casesPage})` : undefined,
                }}
                key={items[0].name}
              >
                <Grid container spacing={2}>
                  {items.map(({ name, image }) => (
                    <Grid item xs={6} sm={3} key={name}>
                      <Paper elevation={24} className={classes.case} key={name}>
                        <AspectRatio ratio={16 / 9}>
                          <Image layout="fill" objectFit="cover" src={image} alt={name} />
                        </AspectRatio>
                        <Typography variant="subtitle1">{name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </div>
            ))}
          </div>
          <div className={classes.pageIndicators}>
            {Array.from({ length: casesTotalPages }, (_, i) => (
              <div
                className={clsx(
                  classes.pageIndicator,
                  i === casesPage && classes.pageIndicatorActive,
                )}
                onClick={() => {
                  setCasesPage(i);
                }}
                tabIndex={-1}
                role="button"
                aria-hidden="true"
                key={i.toString()}
              />
            ))}
          </div>
        </BackgroundImage>
        <div className={classes.sectionPartners}>
          <div>
            {partners.map((partner, i) => (
              <div key={i.toString()}>
                <Image src={partner} alt="" />
              </div>
            ))}
          </div>
        </div>
        <BackgroundImage
          className={classes.sectionForm}
          imageData={IoTCityBackground}
          objectFit="cover"
        >
          <Paper className={classes.sectionFormContent}>
            {isSubmitSuccessful ? (
              <>
                <Typography variant="h3">{t('landingPage:Thank You!')}</Typography>
                <Typography variant="h5" color="textSecondary" className={classes.successText}>
                  {t(
                    'landingPage:Thank you, we will reply to your inquires or questions as soon as possible_',
                  )}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant={xsDown ? 'h5' : 'h3'}>
                  {t('landingPage:Get started for trial')}
                </Typography>
                <Typography variant={xsDown ? 'body2' : 'h6'} color="textSecondary">
                  {t(
                    'landingPage:Please fill in the form below_ We will contact you as soon as possible_',
                  )}
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2} justify="center">
                    <Grid item xs={12} className={classes.errorMsgBlock}>
                      {errors.email?.type === 'pattern' && (
                        <Alert
                          severity="error"
                          icon={
                            <WarningRoundedIcon aria-label={t('common:warning')} fontSize="small" />
                          }
                        >
                          {errors.email?.message}
                        </Alert>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="text"
                        variant="outlined"
                        label={`${t('common:Name')} *`}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isSubmitting}
                        inputProps={register('name', {
                          required: true,
                          setValueAs: valueAsStrippedString,
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="text"
                        variant="outlined"
                        label={`${t('landingPage:Business / Organization')}`}
                        fullWidth
                        error={!!errors.organization}
                        disabled={isSubmitting}
                        inputProps={register('organization', {
                          setValueAs: valueAsStrippedString,
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        label={`${t('common:Email')} *`}
                        fullWidth
                        error={!!errors.email}
                        disabled={isSubmitting}
                        inputProps={register('email', {
                          required: true,
                          pattern: {
                            value: emailRegex,
                            message: t('landingPage:Please use a valid email_'),
                          },
                          setValueAs: valueAsStrippedString,
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        type="tel"
                        variant="outlined"
                        label={`${t('common:Phone')}`}
                        fullWidth
                        multiline
                        error={!!errors.phone}
                        disabled={isSubmitting}
                        inputProps={register('phone', {
                          setValueAs: valueAsStrippedString,
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        type="message"
                        variant="outlined"
                        label={`${t('landingPage:Message')} *`}
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.message}
                        disabled={isSubmitting}
                        inputProps={register('message', {
                          required: true,
                          setValueAs: valueAsStrippedString,
                        })}
                      />
                    </Grid>
                    <Grid item xs="auto">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        {t('landingPage:Get Started Now')}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </>
            )}
          </Paper>
        </BackgroundImage>
        <div className={classes.footer}>
          <Grid container>
            <Grid item xs={12} sm={4} className={classes.footerBrandWrapper}>
              <CityOSLightLogo className={classes.brand} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <div className={classes.contactInfo}>
                <div>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''}`}>
                    <EmailIcon />
                    <Typography>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</Typography>
                  </a>
                </div>
                <div>
                  <a
                    href={`tel:${(process.env.NEXT_PUBLIC_CONTACT_PHONE || '').replace(
                      /[^\d+]/g,
                      '',
                    )}`}
                  >
                    <PhoneIcon />
                    <Typography>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</Typography>
                  </a>
                </div>
                <div>
                  <a
                    href={process.env.NEXT_PUBLIC_CONTACT_WEBSITE || ''}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <WebsiteIcon />
                    <Typography>{process.env.NEXT_PUBLIC_CONTACT_WEBSITE}</Typography>
                  </a>
                </div>
              </div>
            </Grid>
            <Grid item xs={false} sm={4} />
            <Grid item xs={12} sm={8} className={classes.footerBottom}>
              <div className={classes.ribbon} />
              <div className={classes.footerText}>{process.env.NEXT_PUBLIC_FOOTER}</div>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
