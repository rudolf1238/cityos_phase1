import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Image from 'next/image';

import { GadgetSize, GadgetSizeType, GadgetType } from '../libs/type';

import CarFlowGroupRecDarkImg from '../assets/img/gadget-car-flow-group-rec-dark.png';
import CarFlowGroupRecImg from '../assets/img/gadget-car-flow-group-rec.png';
import CarFlowGroupSquDarkImg from '../assets/img/gadget-car-flow-group-squ-dark.png';
import CarFlowGroupSquImg from '../assets/img/gadget-car-flow-group-squ.png';
import CarFlowOneRecDarkImg from '../assets/img/gadget-car-flow-one-rec-dark.png';
import CarFlowOneRecImg from '../assets/img/gadget-car-flow-one-rec.png';
import CarFlowOneSquDarkImg from '../assets/img/gadget-car-flow-one-squ-dark.png';
import CarFlowOneSquImg from '../assets/img/gadget-car-flow-one-squ.png';
import CarPlateDarkImg from '../assets/img/gadget-car-plate-number-dark.png';
import CarPlateImg from '../assets/img/gadget-car-plate-number.png';
import CrowdGroupRecDarkImg from '../assets/img/gadget-crowd-flow-group-rec-dark.png';
import CrowdGroupRecImg from '../assets/img/gadget-crowd-flow-group-rec.png';
import CrowdGroupSquDarkImg from '../assets/img/gadget-crowd-flow-group-squ-dark.png';
import CrowdGroupSquImg from '../assets/img/gadget-crowd-flow-group-squ.png';
import CrowdOneRecDarkImg from '../assets/img/gadget-crowd-flow-one-rec-dark.png';
import CrowdOneRecImg from '../assets/img/gadget-crowd-flow-one-rec.png';
import CrowdOneSquDarkImg from '../assets/img/gadget-crowd-flow-one-squ-dark.png';
import CrowdOneSquImg from '../assets/img/gadget-crowd-flow-one-squ.png';
import EvAlarmStatsRecDarkImg from '../assets/img/gadget-ev-error-stats-rec-dark.png';
import EvAlarmStatsRecImg from '../assets/img/gadget-ev-error-stats-rec.png';
import EvAlarmStatsSquDarkImg from '../assets/img/gadget-ev-error-stats-squ-dark.png';
import EvAlarmStatsSquImg from '../assets/img/gadget-ev-error-stats-squ.png';
import EvChargersRecDarkImg from '../assets/img/gadget-ev-chargers-rec-dark.png';
import EvChargersRecImg from '../assets/img/gadget-ev-chargers-rec.png';
import EvChargersSquDarkImg from '../assets/img/gadget-ev-chargers-squ-dark.png';
import EvChargersSquImg from '../assets/img/gadget-ev-chargers-squ.png';
import EvStatsRecDarkImg from '../assets/img/gadget-ev-stats-rec-dark.png';
import EvStatsRecImg from '../assets/img/gadget-ev-stats-rec.png';
import EvStatsSquDarkImg from '../assets/img/gadget-ev-stats-squ-dark.png';
import EvStatsSquImg from '../assets/img/gadget-ev-stats-squ.png';
import GenderAgeRecDarkImg from '../assets/img/gadget-gender-age-rec-dark.png';
import GenderAgeRecImg from '../assets/img/gadget-gender-age-rec.png';
import GenderAgeSquDarkImg from '../assets/img/gadget-gender-age-squ-dark.png';
import GenderAgeSquImg from '../assets/img/gadget-gender-age-squ.png';
import IndoorAirQualityRecDarkImg from '../assets/img/gadget-indoor-air-quality-rec-dark.png';
import IndoorAirQualityRecImg from '../assets/img/gadget-indoor-air-quality-rec.png';
import IndoorAirQualitySquDarkImg from '../assets/img/gadget-indoor-air-quality-squ-dark.png';
import IndoorAirQualitySquImg from '../assets/img/gadget-indoor-air-quality-squ.png';
import IndoorEnergyConsumptionDarkImg from '../assets/img/gadget-indoor-energy-consumption-dark.png';
import IndoorEnergyConsumptionImg from '../assets/img/gadget-indoor-energy-consumption.png';
import IndoorTemperatureRecDarkImg from '../assets/img/gadget-indoor-temperature-rec-dark.png';
import IndoorTemperatureRecImg from '../assets/img/gadget-indoor-temperature-rec.png';
import IndoorTemperatureSquDarkImg from '../assets/img/gadget-indoor-temperature-squ-dark.png';
import IndoorTemperatureSquImg from '../assets/img/gadget-indoor-temperature-squ.png';
import LiveCamDarkImg from '../assets/img/gadget-live-cam-dark.png';
import LiveCamImg from '../assets/img/gadget-live-cam.png';
import MalfunctioningRecDarkImg from '../assets/img/gadget-malfunctioning-rec-dark.png';
import MalfunctioningRecImg from '../assets/img/gadget-malfunctioning-rec.png';
import MalfunctioningSquDarkImg from '../assets/img/gadget-malfunctioning-squ-dark.png';
import MalfunctioningSquImg from '../assets/img/gadget-malfunctioning-squ.png';
import PM2_5DivisionDarkImg from '../assets/img/gadget-pm2.5-division-dark.png';
import PM2_5DivisionImg from '../assets/img/gadget-pm2.5-division.png';
import PM2_5OneDarkImg from '../assets/img/gadget-pm2.5-one-dark.png';
import PM2_5OneImg from '../assets/img/gadget-pm2.5-one.png';
import PeopleLocatorDarkImg from '../assets/img/gadget-people-locator-dark.png';
import PeopleLocatorImg from '../assets/img/gadget-people-locator.png';
import PlaceUsageDarkImg from '../assets/img/gadget-place-usage-dark.png';
import PlaceUsageImg from '../assets/img/gadget-place-usage.png';
import PowerConsumptionRecDarkImg from '../assets/img/gadget-power-consumption-rec-dark.png';
import PowerConsumptionRecImg from '../assets/img/gadget-power-consumption-rec.png';
import PowerConsumptionSquDarkImg from '../assets/img/gadget-power-consumption-squ-dark.png';
import PowerConsumptionSquImg from '../assets/img/gadget-power-consumption-squ.png';
import ProperRateRecDarkImg from '../assets/img/gadget-proper-rate-rec-dark.png';
import ProperRateRecImg from '../assets/img/gadget-proper-rate-rec.png';
import ProperRateSquDarkImg from '../assets/img/gadget-proper-rate-squ-dark.png';
import ProperRateSquImg from '../assets/img/gadget-proper-rate-squ.png';
import SetBrightnessPercentOfLampDarkImg from '../assets/img/gadget-set-brightness-percent-of-lamp-dark.png';
import SetBrightnessPercentOfLampImg from '../assets/img/gadget-set-brightness-percent-of-lamp.png';
import WeatherRec from '../assets/img/gadget-weather-rec.png';
import WeatherRecDark from '../assets/img/gadget-weather-rec-dark.png';
import WeatherSqu from '../assets/img/gadget-weather-squ.png';
import WeatherSquDark from '../assets/img/gadget-weather-squ-dark.png';
import WifiRecDarkImg from '../assets/img/gadget-wifi-rec-dark.png';
import WifiRecImg from '../assets/img/gadget-wifi-rec.png';
import WifiSquDarkImg from '../assets/img/gadget-wifi-squ-dark.png';
import WifiSquImg from '../assets/img/gadget-wifi-squ.png';

interface GadgetImageProps<T extends GadgetType> {
  type: T;
  size: GadgetSizeType<T>;
}

const gadgetImages: Record<
  'light' | 'dark',
  {
    [Type in GadgetType]: Record<GadgetSizeType<Type>, StaticImageData>;
  }
> = {
  light: {
    [GadgetType.AQI_IN_DIVISION]: {
      [GadgetSize.DEFAULT]: PM2_5DivisionImg,
    },
    [GadgetType.AQI_OF_DEVICE]: {
      [GadgetSize.DEFAULT]: PM2_5OneImg,
    },
    [GadgetType.CAR_FLOW]: {
      [GadgetSize.SQUARE]: CarFlowOneSquImg,
      [GadgetSize.RECTANGLE]: CarFlowOneRecImg,
    },
    [GadgetType.CAR_FLOWS]: {
      [GadgetSize.SQUARE]: CarFlowGroupSquImg,
      [GadgetSize.RECTANGLE]: CarFlowGroupRecImg,
    },
    [GadgetType.CAR_IDENTIFY]: {
      [GadgetSize.DEFAULT]: CarPlateImg,
    },
    [GadgetType.HUMAN_FLOW]: {
      [GadgetSize.SQUARE]: CrowdOneSquImg,
      [GadgetSize.RECTANGLE]: CrowdOneRecImg,
    },
    [GadgetType.HUMAN_FLOWS]: {
      [GadgetSize.SQUARE]: CrowdGroupSquImg,
      [GadgetSize.RECTANGLE]: CrowdGroupRecImg,
    },
    [GadgetType.MALFUNCTION_FLOW]: {
      [GadgetSize.SQUARE]: MalfunctioningSquImg,
      [GadgetSize.RECTANGLE]: MalfunctioningRecImg,
    },
    [GadgetType.LIVE_VIEW]: {
      [GadgetSize.SQUARE]: LiveCamImg,
    },
    [GadgetType.HUMAN_SHAPE]: {
      [GadgetSize.DEFAULT]: PeopleLocatorImg,
    },
    [GadgetType.PROPER_RATE]: {
      [GadgetSize.SQUARE]: ProperRateSquImg,
      [GadgetSize.RECTANGLE]: ProperRateRecImg,
    },
    [GadgetType.WIFI]: {
      [GadgetSize.SQUARE]: WifiSquImg,
      [GadgetSize.RECTANGLE]: WifiRecImg,
    },
    [GadgetType.EV_STATS]: {
      [GadgetSize.SQUARE]: EvStatsSquImg,
      [GadgetSize.RECTANGLE]: EvStatsRecImg,
    },
    [GadgetType.EV_CHARGERS]: {
      [GadgetSize.SQUARE]: EvChargersSquImg,
      [GadgetSize.RECTANGLE]: EvChargersRecImg,
    },
    [GadgetType.EV_ALARM_STATS]: {
      [GadgetSize.SQUARE]: EvAlarmStatsSquImg,
      [GadgetSize.RECTANGLE]: EvAlarmStatsRecImg,
    },
    [GadgetType.GENDER_AGE_FLOW]: {
      [GadgetSize.SQUARE]: GenderAgeSquImg,
      [GadgetSize.RECTANGLE]: GenderAgeRecImg,
    },
    [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP]: {
      [GadgetSize.DEFAULT]: SetBrightnessPercentOfLampImg,
    },
    [GadgetType.INDOOR_AIR_QUALITY]: {
      [GadgetSize.SQUARE]: IndoorAirQualitySquImg,
      [GadgetSize.RECTANGLE]: IndoorAirQualityRecImg,
    },
    [GadgetType.INDOOR_TEMPERATURE]: {
      [GadgetSize.SQUARE]: IndoorTemperatureSquImg,
      [GadgetSize.RECTANGLE]: IndoorTemperatureRecImg,
    },
    [GadgetType.POWER_CONSUMPTION]: {
      [GadgetSize.SQUARE]: PowerConsumptionSquImg,
      [GadgetSize.RECTANGLE]: PowerConsumptionRecImg,
    },
    [GadgetType.WEATHER]: {
      [GadgetSize.SQUARE]: WeatherSqu,
      [GadgetSize.RECTANGLE]: WeatherRec,
    },
    [GadgetType.PLACE_USAGE]: {
      [GadgetSize.DEFAULT]: PlaceUsageImg,
    },
    [GadgetType.INDOOR_ENERGY_CONSUMPTION]: {
      [GadgetSize.DEFAULT]: IndoorEnergyConsumptionImg,
    },
  },
  dark: {
    [GadgetType.AQI_IN_DIVISION]: {
      [GadgetSize.DEFAULT]: PM2_5DivisionDarkImg,
    },
    [GadgetType.AQI_OF_DEVICE]: {
      [GadgetSize.DEFAULT]: PM2_5OneDarkImg,
    },
    [GadgetType.CAR_FLOW]: {
      [GadgetSize.SQUARE]: CarFlowOneSquDarkImg,
      [GadgetSize.RECTANGLE]: CarFlowOneRecDarkImg,
    },
    [GadgetType.CAR_FLOWS]: {
      [GadgetSize.SQUARE]: CarFlowGroupSquDarkImg,
      [GadgetSize.RECTANGLE]: CarFlowGroupRecDarkImg,
    },
    [GadgetType.CAR_IDENTIFY]: {
      [GadgetSize.DEFAULT]: CarPlateDarkImg,
    },
    [GadgetType.HUMAN_FLOW]: {
      [GadgetSize.SQUARE]: CrowdOneSquDarkImg,
      [GadgetSize.RECTANGLE]: CrowdOneRecDarkImg,
    },
    [GadgetType.HUMAN_FLOWS]: {
      [GadgetSize.SQUARE]: CrowdGroupSquDarkImg,
      [GadgetSize.RECTANGLE]: CrowdGroupRecDarkImg,
    },
    [GadgetType.MALFUNCTION_FLOW]: {
      [GadgetSize.SQUARE]: MalfunctioningSquDarkImg,
      [GadgetSize.RECTANGLE]: MalfunctioningRecDarkImg,
    },
    [GadgetType.LIVE_VIEW]: {
      [GadgetSize.SQUARE]: LiveCamDarkImg,
    },
    [GadgetType.HUMAN_SHAPE]: {
      [GadgetSize.DEFAULT]: PeopleLocatorDarkImg,
    },
    [GadgetType.PROPER_RATE]: {
      [GadgetSize.SQUARE]: ProperRateSquDarkImg,
      [GadgetSize.RECTANGLE]: ProperRateRecDarkImg,
    },
    [GadgetType.WIFI]: {
      [GadgetSize.SQUARE]: WifiSquDarkImg,
      [GadgetSize.RECTANGLE]: WifiRecDarkImg,
    },
    [GadgetType.EV_STATS]: {
      [GadgetSize.SQUARE]: EvStatsSquDarkImg,
      [GadgetSize.RECTANGLE]: EvStatsRecDarkImg,
    },
    [GadgetType.EV_CHARGERS]: {
      [GadgetSize.SQUARE]: EvChargersSquDarkImg,
      [GadgetSize.RECTANGLE]: EvChargersRecDarkImg,
    },
    [GadgetType.EV_ALARM_STATS]: {
      [GadgetSize.SQUARE]: EvAlarmStatsSquDarkImg,
      [GadgetSize.RECTANGLE]: EvAlarmStatsRecDarkImg,
    },
    [GadgetType.GENDER_AGE_FLOW]: {
      [GadgetSize.SQUARE]: GenderAgeSquDarkImg,
      [GadgetSize.RECTANGLE]: GenderAgeRecDarkImg,
    },
    [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP]: {
      [GadgetSize.DEFAULT]: SetBrightnessPercentOfLampDarkImg,
    },
    [GadgetType.INDOOR_AIR_QUALITY]: {
      [GadgetSize.SQUARE]: IndoorAirQualitySquDarkImg,
      [GadgetSize.RECTANGLE]: IndoorAirQualityRecDarkImg,
    },
    [GadgetType.INDOOR_TEMPERATURE]: {
      [GadgetSize.SQUARE]: IndoorTemperatureSquDarkImg,
      [GadgetSize.RECTANGLE]: IndoorTemperatureRecDarkImg,
    },
    [GadgetType.POWER_CONSUMPTION]: {
      [GadgetSize.SQUARE]: PowerConsumptionSquDarkImg,
      [GadgetSize.RECTANGLE]: PowerConsumptionRecDarkImg,
    },
    [GadgetType.WEATHER]: {
      [GadgetSize.SQUARE]: WeatherSquDark,
      [GadgetSize.RECTANGLE]: WeatherRecDark,
    },
    [GadgetType.PLACE_USAGE]: {
      [GadgetSize.DEFAULT]: PlaceUsageDarkImg,
    },
    [GadgetType.INDOOR_ENERGY_CONSUMPTION]: {
      [GadgetSize.DEFAULT]: IndoorEnergyConsumptionDarkImg,
    },
  },
};

const GadgetImage = <Type extends GadgetType>({
  type,
  size,
}: GadgetImageProps<Type>): ReturnType<VoidFunctionComponent<GadgetImageProps<Type>>> => {
  const theme = useTheme();
  const lightImages = gadgetImages.light[type] as Record<GadgetSizeType<Type>, StaticImageData>;
  const darkImages = gadgetImages.dark[type] as Record<GadgetSizeType<Type>, StaticImageData>;

  return (
    <Image
      layout="fill"
      objectFit="contain"
      src={theme.palette.type === 'light' ? lightImages[size] : darkImages[size]}
    />
  );
};

export default memo(GadgetImage);
