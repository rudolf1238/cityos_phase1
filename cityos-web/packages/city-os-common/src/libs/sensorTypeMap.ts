import { SensorId, SensorType } from './schema';

export const tableSensorTypes: Record<SensorId, SensorType> = {
  [SensorId.LAMP_BRIGHTNESS_PERCENT]: SensorType.GAUGE,
  [SensorId.LAMP_POWER_CON]: SensorType.GAUGE,
  [SensorId.LAMP_VOLTAGE]: SensorType.GAUGE,
  [SensorId.LAMP_CURRENT]: SensorType.GAUGE,
  [SensorId.LAMP_TEMP]: SensorType.GAUGE,
  [SensorId.SOLAR_BAT_VOLTAGE]: SensorType.GAUGE,
  [SensorId.SOLAR_BAT_CURRENT]: SensorType.GAUGE,
  [SensorId.SOLAR_BAT_CAPACITY]: SensorType.GAUGE,
  [SensorId.CHARGING_STATUS]: SensorType.TEXT,
  [SensorId.CHARGING_30_DAYS_METER]: SensorType.GAUGE,
  [SensorId.CHARGING_30_DAYS_COUNT]: SensorType.GAUGE,
  [SensorId.CHARGING_METER]: SensorType.GAUGE,
  [SensorId.CHARGING_AMOUNT]: SensorType.GAUGE,
  [SensorId.CAMERA_GENDER]: SensorType.TEXT,
  [SensorId.CAMERA_CLOTHES_COLOR]: SensorType.TEXT,
  [SensorId.CAMERA_PEDESTRIAN]: SensorType.SNAPSHOT,
  [SensorId.CAMERA_NUMBER_PLATE]: SensorType.GAUGE,
  [SensorId.CAMERA_VEHICLE]: SensorType.SNAPSHOT,
  [SensorId.CAMERA_HUMAN_COUNT]: SensorType.GAUGE,
  [SensorId.CAMERA_HUMAN_IMAGE]: SensorType.SNAPSHOT,
  [SensorId.CAMERA_CAR_FLOW_STRAIGHT_COUNT]: SensorType.GAUGE,
  [SensorId.CAMERA_CAR_FLOW_STRAIGHT_IMAGE]: SensorType.SNAPSHOT,
  [SensorId.WATER_LEVEL]: SensorType.TEXT,
  [SensorId.WATER_VOLT]: SensorType.GAUGE,
  [SensorId.ENV_PM10]: SensorType.GAUGE,
  [SensorId.ENV_PM2_5]: SensorType.GAUGE,
  [SensorId.ENV_TEMPERATURE]: SensorType.GAUGE,
  [SensorId.ENV_HUMIDITY]: SensorType.GAUGE,
  [SensorId.WIFI_CONN_USER_COUNT]: SensorType.GAUGE,
  [SensorId.WIFI_UPLOAD_SPEED]: SensorType.GAUGE,
  [SensorId.WIFI_DOWNLOAD_SPEED]: SensorType.GAUGE,
  [SensorId.DISPLAY_PLAYER_ADDRESS]: SensorType.TEXT,
  [SensorId.DISPLAY_PLAYER_SNAPSHOT]: SensorType.SNAPSHOT,
  [SensorId.BANPU_INDOOR_METER_CO2]: SensorType.GAUGE,
  [SensorId.BANPU_INDOOR_METER_TEMPERATURE]: SensorType.GAUGE,
  [SensorId.POWER_METER_POWER_CONSUMPTION]: SensorType.GAUGE,
};