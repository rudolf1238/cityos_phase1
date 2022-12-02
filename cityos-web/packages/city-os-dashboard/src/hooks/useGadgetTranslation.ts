import { useCallback } from 'react';

import { GadgetType } from '../libs/type';
import useDashboardTranslation from './useDashboardTranslation';

interface UseGadgetTranslationResponse
  extends Omit<ReturnType<typeof useDashboardTranslation>, 't'> {
  tGadget: (gadgetType: GadgetType) => string;
}

const useGadgetTranslation = (): UseGadgetTranslationResponse => {
  const { t, ...methods } = useDashboardTranslation('dashboard');

  const tGadget = useCallback(
    (type: GadgetType) => {
      const mapping: Record<GadgetType, string> = {
        [GadgetType.LIVE_VIEW]: t('Live Cams'),
        [GadgetType.CAR_IDENTIFY]: t('Car Plate Number'),
        [GadgetType.HUMAN_SHAPE]: t('People Locator'),
        [GadgetType.CAR_FLOW]: t('Traffic Flow - One'),
        [GadgetType.CAR_FLOWS]: t('Traffic Flow - Group'),
        [GadgetType.HUMAN_FLOW]: t('Crowd - One'),
        [GadgetType.HUMAN_FLOWS]: t('Crowd - Group'),
        [GadgetType.AQI_OF_DEVICE]: t('PM2_5 - One'),
        [GadgetType.AQI_IN_DIVISION]: t('PM2_5 - Division'),
        [GadgetType.WIFI]: t('Wifi Connection'),
        [GadgetType.MALFUNCTION_FLOW]: t('Malfunctions'),
        [GadgetType.PROPER_RATE]: t('Availability Rate'),
        [GadgetType.EV_STATS]: t('EV Stats Last 7 Days'),
        [GadgetType.EV_CHARGERS]: t('EV Chargers'),
        [GadgetType.EV_ALARM_STATS]: t('EV Alarm Stats'),
        [GadgetType.GENDER_AGE_FLOW]: t('Gender and Age'),
        [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP]: t('Lamp brightness'),
        [GadgetType.INDOOR_AIR_QUALITY]: t('Indoor Air Quality'),
        [GadgetType.INDOOR_TEMPERATURE]: t('Temperature'),
        [GadgetType.POWER_CONSUMPTION]: t('Power Consumption'),
        [GadgetType.WEATHER]: t('Weather'),
        [GadgetType.PLACE_USAGE]: t('Place Usage'),
        [GadgetType.INDOOR_ENERGY_CONSUMPTION]: t('Indoor Energy Consumption'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tGadget,
  };
};

export default useGadgetTranslation;
