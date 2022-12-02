import { useCallback } from 'react';

import { SensorId } from '../libs/schema';
import useCommonTranslation from './useCommonTranslation';

interface UseSensorIdResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tSensorId: (sensorId: SensorId) => string;
}

const useSensorIdTranslation = (): UseSensorIdResponse => {
  const { t, ...methods } = useCommonTranslation('column');

  const tSensorId = useCallback(
    (sensorId: SensorId) => {
      const mapping: Record<SensorId, string> = {
        [SensorId.LAMP_BRIGHTNESS_PERCENT]: t('Brightness (Now)'),
        [SensorId.LAMP_POWER_CON]: t('Electrical consumption (Today)'),
        [SensorId.LAMP_VOLTAGE]: t('Voltage'),
        [SensorId.LAMP_CURRENT]: t('Electrical current'),
        [SensorId.LAMP_TEMP]: t('Temperature (Now)'),
        [SensorId.SOLAR_BAT_VOLTAGE]: t('Voltage'),
        [SensorId.SOLAR_BAT_CURRENT]: t('Electrical current'),
        [SensorId.SOLAR_BAT_CAPACITY]: t('Power'),
        [SensorId.CHARGING_STATUS]: t('Charger status'),
        [SensorId.CHARGING_30_DAYS_METER]: t('Meter in 30 days'),
        [SensorId.CHARGING_30_DAYS_COUNT]: t('Count in 30 days'),
        [SensorId.CHARGING_METER]: t('Energy Consumption'),
        [SensorId.CHARGING_AMOUNT]: t('Revenue'),
        [SensorId.CAMERA_GENDER]: t('Gender'),
        [SensorId.CAMERA_CLOTHES_COLOR]: t('Clothes Color'),
        [SensorId.CAMERA_PEDESTRIAN]: t('Video snapshot'),
        [SensorId.CAMERA_NUMBER_PLATE]: t('Plate number'),
        [SensorId.CAMERA_VEHICLE]: t('Video snapshot'),
        [SensorId.CAMERA_HUMAN_COUNT]: t('Human count'),
        [SensorId.CAMERA_HUMAN_IMAGE]: t('Human image'),
        [SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT]: t('Car flow count'),
        [SensorId.CAMERA_CAR_FLOW_STRAIGHT_IMAGE]: t('Car flow image'),
        [SensorId.WATER_LEVEL]: t('Water level'),
        [SensorId.WATER_VOLT]: t('Battery'),
        [SensorId.ENV_PM10]: t('PM10'),
        [SensorId.ENV_PM2_5]: t('PM2_5'),
        [SensorId.ENV_TEMPERATURE]: t('Temperature'),
        [SensorId.ENV_HUMIDITY]: t('Humidity'),
        [SensorId.WIFI_CONN_USER_COUNT]: t('Connected (Now)'),
        [SensorId.WIFI_UPLOAD_SPEED]: t('Upload speed'),
        [SensorId.WIFI_DOWNLOAD_SPEED]: t('Download speed'),
        [SensorId.DISPLAY_PLAYER_ADDRESS]: t('Address'),
        [SensorId.DISPLAY_PLAYER_SNAPSHOT]: t('Snapshot'),
        [SensorId.BANPU_INDOOR_METER_CO2]: t('CO_2'),
        [SensorId.BANPU_INDOOR_METER_TEMPERATURE]: t('Temperature'),
        [SensorId.POWER_METER_POWER_CONSUMPTION]: t('Power consumption'),
        [SensorId.TEMP_C]: t('Current Temperature'),
        [SensorId.CONDITION_CODE]: t('Current Condition Code'),
        [SensorId.WIND_KPH]: t('Current Wind KPH'),
        [SensorId.WIND_DEGREE]: t('Current Wind Degree'),
        [SensorId.HUMIDITY]: t('Current Humidity'),
        [SensorId.IS_DAY]: t('Current Is Day'),
        [SensorId.UV]: t('UV'),
        [SensorId.TEMP_C_1]: t('Temp in 1Hr'),
        [SensorId.TEMP_C_2]: t('Temp in 2Hr'),
        [SensorId.TEMP_C_3]: t('Temp in 3Hr'),
        [SensorId.TEMP_C_4]: t('Temp in 4Hr'),
        [SensorId.TEMP_C_5]: t('Temp in 5Hr'),
        [SensorId.TEMP_C_6]: t('Temp in 6Hr'),
        [SensorId.CONDITION_CODE_1]: t('Condition Code in 1Hr'),
        [SensorId.CONDITION_CODE_2]: t('Condition Code in 2Hr'),
        [SensorId.CONDITION_CODE_3]: t('Condition Code in 3Hr'),
        [SensorId.CONDITION_CODE_4]: t('Condition Code in 4Hr'),
        [SensorId.CONDITION_CODE_5]: t('Condition Code in 5Hr'),
        [SensorId.CONDITION_CODE_6]: t('Condition Code in 6Hr'),
        [SensorId.WIND_KPH_1]: t('Wind KPH in 1Hr'),
        [SensorId.WIND_KPH_2]: t('Wind KPH in 2Hr'),
        [SensorId.WIND_KPH_3]: t('Wind KPH in 3Hr'),
        [SensorId.WIND_KPH_4]: t('Wind KPH in 4Hr'),
        [SensorId.WIND_KPH_5]: t('Wind KPH in 5Hr'),
        [SensorId.WIND_KPH_6]: t('Wind KPH in 6Hr'),
        [SensorId.HUMIDITY_1]: t('Humidity in 1Hr'),
        [SensorId.HUMIDITY_2]: t('Humidity in 2Hr'),
        [SensorId.HUMIDITY_3]: t('Humidity in 3Hr'),
        [SensorId.HUMIDITY_4]: t('Humidity in 4Hr'),
        [SensorId.HUMIDITY_5]: t('Humidity in 5Hr'),
        [SensorId.HUMIDITY_6]: t('Humidity in 6Hr'),
        [SensorId.IS_DAY_1]: t('Is Day in 1Hr'),
        [SensorId.IS_DAY_2]: t('Is Day in 2Hr'),
        [SensorId.IS_DAY_3]: t('Is Day in 3Hr'),
        [SensorId.IS_DAY_4]: t('Is Day in 4Hr'),
        [SensorId.IS_DAY_5]: t('Is Day in 5Hr'),
        [SensorId.IS_DAY_6]: t('Is Day in 6Hr'),
      };
      return mapping[sensorId];
    },
    [t],
  );

  return {
    ...methods,
    tSensorId,
  };
};

export default useSensorIdTranslation;
