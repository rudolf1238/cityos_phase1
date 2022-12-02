import React, { VoidFunctionComponent, memo } from 'react';

import { ConfigFormType, GadgetConfig, GadgetType } from '../../libs/type';

import AqiMonitorConfig from '../Gadgets/AqiMonitor/AqiMonitorConfig';
import CarFlowConfig from '../Gadgets/CarFlow/CarFlowConfig';
import CarFlowsConfig from '../Gadgets/CarFlows/CarFlowsConfig';
import CarIdentifyConfig from '../Gadgets/CarIdentify/CarIdentifyConfig';
import EVAlarmStatsConfig from '../Gadgets/EVAlarmStats/EVAlarmStatsConfig';
import EVChargersConfig from '../Gadgets/EVChargers/EVChargersConfig';
import EVStatsConfig from '../Gadgets/EVStats/EVStatsConfig';
import ExtremeAqiDivisionConfig from '../Gadgets/ExtremeAqiDivision/ExtremeAqiDivisionConfig';
import GenderAgeFlowConfig from '../Gadgets/GenderAgeFlow/GenderAgeFlowConfig';
import HumanFlowConfig from '../Gadgets/HumanFlow/HumanFlowConfig';
import HumanFlowsConfig from '../Gadgets/HumanFlows/HumanFlowsConfig';
import HumanShapeConfig from '../Gadgets/HumanShape/HumanShapeConfig';
import IndoorEnergyConsumptionConfig from '../Gadgets/IndoorEnergyConsumption/IndoorEnergyConsumptionConfig';
import LiveViewConfig from '../Gadgets/LiveView/LiveViewConfig';
import MalfunctionFlowConfig from '../Gadgets/MalfunctionFlow/MalfunctionFlowConfig';
import PlaceUsageConfig from '../Gadgets/PlaceUsage/PlaceUsageConfig';
import PowerConsumptionConfig from '../Gadgets/PowerConsumption/PowerConsumptionConfig';
import ProperRateConfig from '../Gadgets/ProperRate/ProperRateConfig';
import SetBrightnessPercentOfLampConfig from '../Gadgets/SetBrightnessPercentOfLamp/SetBrightnessPercentOfLampConfig';
import SetIndoorAirQuality from '../Gadgets/IndoorAirQuality/IndoorAirQualityConfig';
import SetIndoorTemperature from '../Gadgets/IndoorTemperature/IndoorTemperatureConfig';
import WeatherConfig from '../Gadgets/Weather/WeatherConfig';
import WifiFlowConfig from '../Gadgets/WifiFlow/WifiFlowConfig';

const configComponents = {
  [GadgetType.LIVE_VIEW]: LiveViewConfig,
  [GadgetType.CAR_IDENTIFY]: CarIdentifyConfig,
  [GadgetType.HUMAN_SHAPE]: HumanShapeConfig,
  [GadgetType.AQI_OF_DEVICE]: AqiMonitorConfig,
  [GadgetType.AQI_IN_DIVISION]: ExtremeAqiDivisionConfig,
  [GadgetType.EV_CHARGERS]: EVChargersConfig,
  [GadgetType.EV_STATS]: EVStatsConfig,
  [GadgetType.CAR_FLOW]: CarFlowConfig,
  [GadgetType.CAR_FLOWS]: CarFlowsConfig,
  [GadgetType.HUMAN_FLOW]: HumanFlowConfig,
  [GadgetType.HUMAN_FLOWS]: HumanFlowsConfig,
  [GadgetType.WIFI]: WifiFlowConfig,
  [GadgetType.MALFUNCTION_FLOW]: MalfunctionFlowConfig,
  [GadgetType.PROPER_RATE]: ProperRateConfig,
  [GadgetType.EV_ALARM_STATS]: EVAlarmStatsConfig,
  [GadgetType.GENDER_AGE_FLOW]: GenderAgeFlowConfig,
  [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP]: SetBrightnessPercentOfLampConfig,
  [GadgetType.INDOOR_AIR_QUALITY]: SetIndoorAirQuality,
  [GadgetType.INDOOR_TEMPERATURE]: SetIndoorTemperature,
  [GadgetType.POWER_CONSUMPTION]: PowerConsumptionConfig,
  [GadgetType.WEATHER]: WeatherConfig,
  [GadgetType.PLACE_USAGE]: PlaceUsageConfig,
  [GadgetType.INDOOR_ENERGY_CONSUMPTION]: IndoorEnergyConsumptionConfig,
};

interface NewGadgetConfigProps {
  type: GadgetType;
  onSave: (config?: GadgetConfig<ConfigFormType>) => void;
}

const NewGadgetConfig: VoidFunctionComponent<NewGadgetConfigProps> = ({
  type,
  onSave,
}: NewGadgetConfigProps) => {
  const ConfigComponent = configComponents[type];
  return <ConfigComponent onSave={onSave} saveType="create" />;
};

export default memo(NewGadgetConfig);
