import {
  WeatherCondition,
  WeatherConditionCode,
  WeatherConditionTime,
  WeatherWindDirectionInfo,
} from '../../../libs/type';

import BlizzardIcon from '../../../assets/icon/weather/blizzard.svg';
import BlowingSnowIcon from '../../../assets/icon/weather/blowing-snow.svg';
import ClearIcon from '../../../assets/icon/weather/clear.svg';
import CloudyIcon from '../../../assets/icon/weather/cloudy.svg';
import FogIcon from '../../../assets/icon/weather/fog.svg';
import FreezingDrizzleIcon from '../../../assets/icon/weather/freezing-drizzle.svg';
import FreezingFogIcon from '../../../assets/icon/weather/freezing-fog.svg';
import HeavyFreezingDrizzleIcon from '../../../assets/icon/weather/heavy-freezing-drizzle.svg';
import HeavyRainAtTimesDayIcon from '../../../assets/icon/weather/heavy-rain-at-times-day.svg';
import HeavyRainAtTimesNightIcon from '../../../assets/icon/weather/heavy-rain-at-times-night.svg';
import HeavyRainIcon from '../../../assets/icon/weather/heavy-rain.svg';
import HeavySnowIcon from '../../../assets/icon/weather/heavy-snow.svg';
import IcePelletsIcon from '../../../assets/icon/weather/ice-pellets.svg';
import LightDrizzleIcon from '../../../assets/icon/weather/light-drizzle.svg';
import LightFreezingRainIcon from '../../../assets/icon/weather/light-freezing-rain.svg';
import LightRainIcon from '../../../assets/icon/weather/light-rain.svg';
import LightRainShowerDayIcon from '../../../assets/icon/weather/light-rain-shower-day.svg';
import LightRainShowerNightIcon from '../../../assets/icon/weather/light-rain-shower-night.svg';
import LightShowersOfIcePelletsDayIcon from '../../../assets/icon/weather/light-showers-of-ice-pellets-day.svg';
import LightShowersOfIcePelletsNightIcon from '../../../assets/icon/weather/light-showers-of-ice-pellets-night.svg';
import LightSleetIcon from '../../../assets/icon/weather/light-sleet.svg';
import LightSleetShowersDayIcon from '../../../assets/icon/weather/light-sleet-showers-day.svg';
import LightSleetShowersNightIcon from '../../../assets/icon/weather/light-sleet-showers-night.svg';
import LightSnowIcon from '../../../assets/icon/weather/light-snow.svg';
import LightSnowShowersDayIcon from '../../../assets/icon/weather/light-snow-showers-day.svg';
import LightSnowShowersNightIcon from '../../../assets/icon/weather/light-snow-showers-night.svg';
import MistIcon from '../../../assets/icon/weather/mist.svg';
import ModerateOrHeavyFreezingRainIcon from '../../../assets/icon/weather/moderate-or-heavy-freezing-rain.svg';
import ModerateOrHeavyRainShowerDayIcon from '../../../assets/icon/weather/moderate-or-heavy-rain-shower-day.svg';
import ModerateOrHeavyRainShowerNightIcon from '../../../assets/icon/weather/moderate-or-heavy-rain-shower-night.svg';
import ModerateOrHeavyRainWithThunderIcon from '../../../assets/icon/weather/moderate-or-heavy-rain-with-thunder.svg';
import ModerateOrHeavyShowersOfIcePelletsDayIcon from '../../../assets/icon/weather/moderate-or-heavy-showers-of-ice-pellets-day.svg';
import ModerateOrHeavyShowersOfIcePelletsNightIcon from '../../../assets/icon/weather/moderate-or-heavy-showers-of-ice-pellets-night.svg';
import ModerateOrHeavySleetIcon from '../../../assets/icon/weather/moderate-or-heavy-sleet.svg';
import ModerateOrHeavySleetShowersDayIcon from '../../../assets/icon/weather/moderate-or-heavy-sleet-showers-day.svg';
import ModerateOrHeavySleetShowersNightIcon from '../../../assets/icon/weather/moderate-or-heavy-sleet-showers-night.svg';
import ModerateOrHeavySnowShowersDayIcon from '../../../assets/icon/weather/moderate-or-heavy-snow-showers-day.svg';
import ModerateOrHeavySnowShowersNightIcon from '../../../assets/icon/weather/moderate-or-heavy-snow-showers-night.svg';
import ModerateOrHeavySnowWithThunderIcon from '../../../assets/icon/weather/moderate-or-heavy-snow-with-thunder.svg';
import ModerateRainAtTimesDayIcon from '../../../assets/icon/weather/moderate-rain-at-times-day.svg';
import ModerateRainAtTimesNightIcon from '../../../assets/icon/weather/moderate-rain-at-times-night.svg';
import ModerateRainIcon from '../../../assets/icon/weather/moderate-rain.svg';
import ModerateSnowIcon from '../../../assets/icon/weather/moderate-snow.svg';
import OvercastIcon from '../../../assets/icon/weather/overcast.svg';
import PartlyCloudyDayIcon from '../../../assets/icon/weather/partly-cloudy-day.svg';
import PartlyCloudyNightIcon from '../../../assets/icon/weather/partly-cloudy-night.svg';
import PatchyHeavySnowDayIcon from '../../../assets/icon/weather/patchy-heavy-snow-day.svg';
import PatchyHeavySnowNightIcon from '../../../assets/icon/weather/patchy-heavy-snow-night.svg';
import PatchyLightDrizzleIcon from '../../../assets/icon/weather/patchy-light-drizzle.svg';
import PatchyLightRainDayIcon from '../../../assets/icon/weather/patchy-light-rain-day.svg';
import PatchyLightRainNightIcon from '../../../assets/icon/weather/patchy-light-rain-night.svg';
import PatchyLightRainWithThunderDayIcon from '../../../assets/icon/weather/patchy-light-rain-with-thunder-day.svg';
import PatchyLightRainWithThunderNightIcon from '../../../assets/icon/weather/patchy-light-rain-with-thunder-night.svg';
import PatchyLightSnowDayIcon from '../../../assets/icon/weather/patchy-light-snow-day.svg';
import PatchyLightSnowNightIcon from '../../../assets/icon/weather/patchy-light-snow-night.svg';
import PatchyLightSnowWithThunderDayIcon from '../../../assets/icon/weather/patchy-light-snow-with-thunder-day.svg';
import PatchyLightSnowWithThunderNightIcon from '../../../assets/icon/weather/patchy-light-snow-with-thunder-night.svg';
import PatchyModerateSnowDayIcon from '../../../assets/icon/weather/patchy-moderate-snow-day.svg';
import PatchyModerateSnowNightIcon from '../../../assets/icon/weather/patchy-moderate-snow-night.svg';
import PatchyRainPossibleDayIcon from '../../../assets/icon/weather/patchy-rain-possible-day.svg';
import PatchyRainPossibleNightIcon from '../../../assets/icon/weather/patchy-rain-possible-night.svg';
import PatchySleetPossibleDayIcon from '../../../assets/icon/weather/patchy-sleet-possible-day.svg';
import PatchySleetPossibleNightIcon from '../../../assets/icon/weather/patchy-sleet-possible-night.svg';
import PatchySnowPossibleDayIcon from '../../../assets/icon/weather/patchy-snow-possible-day.svg';
import PatchySnowPossibleNightIcon from '../../../assets/icon/weather/patchy-snow-possible-night.svg';
import SunnyIcon from '../../../assets/icon/weather/sunny.svg';
import ThunderyOutbreaksPossibleDayIcon from '../../../assets/icon/weather/thundery-outbreaks-possible-day.svg';
import ThunderyOutbreaksPossibleNightIcon from '../../../assets/icon/weather/thundery-outbreaks-possible-night.svg';
import TorrentialRainShowerDayIcon from '../../../assets/icon/weather/torrential-rain-shower-day.svg';
import TorrentialRainShowerNightIcon from '../../../assets/icon/weather/torrential-rain-shower-night.svg';
import UnknownWeatherIcon from '../../../assets/icon/weather/unknown.svg';

import WindDirection0 from '../../../assets/icon/wind/direction-0.svg';
import WindDirection1 from '../../../assets/icon/wind/direction-1.svg';
import WindDirection10 from '../../../assets/icon/wind/direction-10.svg';
import WindDirection11 from '../../../assets/icon/wind/direction-11.svg';
import WindDirection12 from '../../../assets/icon/wind/direction-12.svg';
import WindDirection13 from '../../../assets/icon/wind/direction-13.svg';
import WindDirection14 from '../../../assets/icon/wind/direction-14.svg';
import WindDirection15 from '../../../assets/icon/wind/direction-15.svg';
import WindDirection2 from '../../../assets/icon/wind/direction-2.svg';
import WindDirection3 from '../../../assets/icon/wind/direction-3.svg';
import WindDirection4 from '../../../assets/icon/wind/direction-4.svg';
import WindDirection5 from '../../../assets/icon/wind/direction-5.svg';
import WindDirection6 from '../../../assets/icon/wind/direction-6.svg';
import WindDirection7 from '../../../assets/icon/wind/direction-7.svg';
import WindDirection8 from '../../../assets/icon/wind/direction-8.svg';
import WindDirection9 from '../../../assets/icon/wind/direction-9.svg';

export const weatherConditionInfo: Record<
  WeatherConditionCode,
  Record<WeatherConditionTime, WeatherCondition>
> = {
  [WeatherConditionCode.UNKNOWN]: {
    [WeatherConditionTime.DAY]: {
      name: 'unknown',
      icon: UnknownWeatherIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'unknown',
      icon: UnknownWeatherIcon,
    },
  },
  [WeatherConditionCode.SUNNY_OR_CLEAR]: {
    [WeatherConditionTime.DAY]: {
      name: 'Clear',
      icon: SunnyIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Sunny',
      icon: ClearIcon,
    },
  },
  [WeatherConditionCode.PARTLY_CLOUDY]: {
    [WeatherConditionTime.DAY]: {
      name: 'Partly cloudy',
      icon: PartlyCloudyDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Partly cloudy',
      icon: PartlyCloudyNightIcon,
    },
  },
  [WeatherConditionCode.CLOUDY]: {
    [WeatherConditionTime.DAY]: {
      name: 'Cloudy',
      icon: CloudyIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Cloudy',
      icon: CloudyIcon,
    },
  },
  [WeatherConditionCode.OVERCAST]: {
    [WeatherConditionTime.DAY]: {
      name: 'Overcast',
      icon: OvercastIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Overcast',
      icon: OvercastIcon,
    },
  },
  [WeatherConditionCode.PATCHY_SNOW_POSSIBLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy snow possible',
      icon: PatchySnowPossibleDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy snow possible',
      icon: PatchySnowPossibleNightIcon,
    },
  },
  [WeatherConditionCode.MIST]: {
    [WeatherConditionTime.DAY]: {
      name: 'Mist',
      icon: MistIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Mist',
      icon: MistIcon,
    },
  },
  [WeatherConditionCode.PATCHY_RAIN_POSSIBLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy rain possible',
      icon: PatchyRainPossibleDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy rain possible',
      icon: PatchyRainPossibleNightIcon,
    },
  },
  [WeatherConditionCode.PATCHY_SLEET_POSSIBLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy sleet possible',
      icon: PatchySleetPossibleDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy sleet possible',
      icon: PatchySleetPossibleNightIcon,
    },
  },
  [WeatherConditionCode.THUNDERY_OUTBREAKS_POSSIBLY]: {
    [WeatherConditionTime.DAY]: {
      name: 'Thundery outbreaks possible',
      icon: ThunderyOutbreaksPossibleDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Thundery outbreaks possible',
      icon: ThunderyOutbreaksPossibleNightIcon,
    },
  },
  [WeatherConditionCode.BLOWING_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Blowing snow',
      icon: BlowingSnowIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Blowing snow',
      icon: BlowingSnowIcon,
    },
  },
  [WeatherConditionCode.BLIZZARD]: {
    [WeatherConditionTime.DAY]: {
      name: 'Blizzard',
      icon: BlizzardIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Blizzard',
      icon: BlizzardIcon,
    },
  },
  [WeatherConditionCode.FOG]: {
    [WeatherConditionTime.DAY]: {
      name: 'Fog',
      icon: FogIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Fog',
      icon: FogIcon,
    },
  },
  [WeatherConditionCode.FREEZING_FOG]: {
    [WeatherConditionTime.DAY]: {
      name: 'Freezing fog',
      icon: FreezingFogIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Freezing fog',
      icon: FreezingFogIcon,
    },
  },
  [WeatherConditionCode.PATCHY_LIGHT_DRIZZLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy light drizzle',
      icon: PatchyLightDrizzleIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy light drizzle',
      icon: PatchyLightDrizzleIcon,
    },
  },
  [WeatherConditionCode.LIGHT_DRIZZLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light drizzle',
      icon: LightDrizzleIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light drizzle',
      icon: LightDrizzleIcon,
    },
  },
  [WeatherConditionCode.FREEZING_DRIZZLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Freezing drizzle',
      icon: FreezingDrizzleIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Freezing drizzle',
      icon: FreezingDrizzleIcon,
    },
  },
  [WeatherConditionCode.HEAVY_FREEZING_DRIZZLE]: {
    [WeatherConditionTime.DAY]: {
      name: 'Heavy freezing drizzle',
      icon: HeavyFreezingDrizzleIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Heavy freezing drizzle',
      icon: HeavyFreezingDrizzleIcon,
    },
  },
  [WeatherConditionCode.PATCHY_LIGHT_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy light rain',
      icon: PatchyLightRainDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy light rain',
      icon: PatchyLightRainNightIcon,
    },
  },
  [WeatherConditionCode.LIGHT_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light rain',
      icon: LightRainIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light rain',
      icon: LightRainIcon,
    },
  },
  [WeatherConditionCode.MODERATE_RAIN_AT_TIMES]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate rain at times',
      icon: ModerateRainAtTimesDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate rain at times',
      icon: ModerateRainAtTimesNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate rain',
      icon: ModerateRainIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate rain',
      icon: ModerateRainIcon,
    },
  },
  [WeatherConditionCode.HEAVY_RAIN_AT_TIMES]: {
    [WeatherConditionTime.DAY]: {
      name: 'Heavy rain at times',
      icon: HeavyRainAtTimesDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Heavy rain at times',
      icon: HeavyRainAtTimesNightIcon,
    },
  },
  [WeatherConditionCode.HEAVY_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Heavy rain',
      icon: HeavyRainIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Heavy rain',
      icon: HeavyRainIcon,
    },
  },
  [WeatherConditionCode.LIGHT_FREEZING_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light rain showers',
      icon: LightFreezingRainIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light rain showers',
      icon: LightFreezingRainIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_FREEZING_RAIN]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy freezing rain',
      icon: ModerateOrHeavyFreezingRainIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy freezing rain',
      icon: ModerateOrHeavyFreezingRainIcon,
    },
  },
  [WeatherConditionCode.LIGHT_SLEET]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light sleet',
      icon: LightSleetIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light sleet',
      icon: LightSleetIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_SLEET]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy sleet',
      icon: ModerateOrHeavySleetIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy sleet',
      icon: ModerateOrHeavySleetIcon,
    },
  },
  [WeatherConditionCode.PATCHY_LIGHT_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy light snow',
      icon: PatchyLightSnowDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy light snow',
      icon: PatchyLightSnowNightIcon,
    },
  },
  [WeatherConditionCode.LIGHT_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light snow',
      icon: LightSnowIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light snow',
      icon: LightSnowIcon,
    },
  },
  [WeatherConditionCode.PATCHY_MODERATE_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy moderate snow',
      icon: PatchyModerateSnowDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy moderate snow',
      icon: PatchyModerateSnowNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate snow',
      icon: ModerateSnowIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate snow',
      icon: ModerateSnowIcon,
    },
  },
  [WeatherConditionCode.PATCHY_HEAVY_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy heavy snow',
      icon: PatchyHeavySnowDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy heavy snow',
      icon: PatchyHeavySnowNightIcon,
    },
  },
  [WeatherConditionCode.HEAVY_SNOW]: {
    [WeatherConditionTime.DAY]: {
      name: 'Heavy snow',
      icon: HeavySnowIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Heavy snow',
      icon: HeavySnowIcon,
    },
  },
  [WeatherConditionCode.ICE_PELLETS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Ice pellets',
      icon: IcePelletsIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Ice pellets',
      icon: IcePelletsIcon,
    },
  },
  [WeatherConditionCode.LIGHT_RAIN_SHOWER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light rain shower',
      icon: LightRainShowerDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light rain shower',
      icon: LightRainShowerNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_RAIN_SHOWER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy rain shower',
      icon: ModerateOrHeavyRainShowerDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy rain shower',
      icon: ModerateOrHeavyRainShowerNightIcon,
    },
  },
  [WeatherConditionCode.TORRENTIAL_RAIN_SHOWER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Torrential rain shower',
      icon: TorrentialRainShowerDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Torrential rain shower',
      icon: TorrentialRainShowerNightIcon,
    },
  },
  [WeatherConditionCode.LIGHT_SLEET_SHOWERS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light sleet showers',
      icon: LightSleetShowersDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light sleet showers',
      icon: LightSleetShowersNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_SLEET_SHOWERS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy sleet showers',
      icon: ModerateOrHeavySleetShowersDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy sleet showers',
      icon: ModerateOrHeavySleetShowersNightIcon,
    },
  },
  [WeatherConditionCode.LIGHT_SNOW_SHOWERS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light snow showers',
      icon: LightSnowShowersDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light snow showers',
      icon: LightSnowShowersNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_SNOW_SHOWERS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy snow showers',
      icon: ModerateOrHeavySnowShowersDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy snow showers',
      icon: ModerateOrHeavySnowShowersNightIcon,
    },
  },
  [WeatherConditionCode.LIGHT_SHOWERS_OF_ICE_PELLETS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Light showers of ice pellets',
      icon: LightShowersOfIcePelletsDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Light showers of ice pellets',
      icon: LightShowersOfIcePelletsNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_SHOWERS_OF_ICE_PELLETS]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy showers of ice pellets',
      icon: ModerateOrHeavyShowersOfIcePelletsDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy showers of ice pellets',
      icon: ModerateOrHeavyShowersOfIcePelletsNightIcon,
    },
  },
  [WeatherConditionCode.PATCHY_LIGHT_RAIN_WITH_THUNDER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy light rain with thunder',
      icon: PatchyLightRainWithThunderDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy light rain with thunder',
      icon: PatchyLightRainWithThunderNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_RAIN_WITH_THUNDER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy rain with thunder',
      icon: ModerateOrHeavyRainWithThunderIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy rain with thunder',
      icon: ModerateOrHeavyRainWithThunderIcon,
    },
  },
  [WeatherConditionCode.PATCHY_LIGHT_SNOW_WITH_THUNDER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Patchy light snow with thunder',
      icon: PatchyLightSnowWithThunderDayIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Patchy light snow with thunder',
      icon: PatchyLightSnowWithThunderNightIcon,
    },
  },
  [WeatherConditionCode.MODERATE_OR_HEAVY_SNOW_WITH_THUNDER]: {
    [WeatherConditionTime.DAY]: {
      name: 'Moderate or heavy snow with thunder',
      icon: ModerateOrHeavySnowWithThunderIcon,
    },
    [WeatherConditionTime.NIGHT]: {
      name: 'Moderate or heavy snow with thunder',
      icon: ModerateOrHeavySnowWithThunderIcon,
    },
  },
};

export const weatherWindDirectionInfoList: WeatherWindDirectionInfo[] = [
  {
    name: 'N',
    icon: WindDirection0,
  },
  {
    name: 'NNE',
    icon: WindDirection1,
  },
  {
    name: 'NE',
    icon: WindDirection2,
  },
  {
    name: 'ENE',
    icon: WindDirection3,
  },
  {
    name: 'E',
    icon: WindDirection4,
  },
  {
    name: 'ESE',
    icon: WindDirection5,
  },
  {
    name: 'SE',
    icon: WindDirection6,
  },
  {
    name: 'SSE',
    icon: WindDirection7,
  },
  {
    name: 'S',
    icon: WindDirection8,
  },
  {
    name: 'SSW',
    icon: WindDirection9,
  },
  {
    name: 'SW',
    icon: WindDirection10,
  },
  {
    name: 'WSW',
    icon: WindDirection11,
  },
  {
    name: 'W',
    icon: WindDirection12,
  },
  {
    name: 'WNW',
    icon: WindDirection13,
  },
  {
    name: 'NW',
    icon: WindDirection14,
  },
  {
    name: 'NNW',
    icon: WindDirection15,
  },
];
