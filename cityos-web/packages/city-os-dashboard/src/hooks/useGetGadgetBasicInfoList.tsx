import { useMemo } from 'react';

import { DeviceType, RecognitionKey } from 'city-os-common/libs/schema';

import { BasicGadgetInfo, GadgetSize, GadgetType } from '../libs/type';
import useDashboardTranslation from './useDashboardTranslation';
import useGadgetTranslation from './useGadgetTranslation';

const useGetGadgetInfoList = (): BasicGadgetInfo[] => {
  const { t } = useDashboardTranslation('dashboard');
  const { tGadget } = useGadgetTranslation();

  const originGadgets = useMemo<BasicGadgetInfo[]>(
    () => [
      {
        name: tGadget(GadgetType.LIVE_VIEW),
        type: GadgetType.LIVE_VIEW,
        deviceType: DeviceType.CAMERA,
        description: t('Display the live view of one specific camera_'),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.CAR_IDENTIFY),
        type: GadgetType.CAR_IDENTIFY,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.CAR_IDENTIFY,
        },
        description: t('Display the current car plate identify result from one specific camera_'),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.HUMAN_SHAPE),
        type: GadgetType.HUMAN_SHAPE,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.HUMAN_SHAPE,
        },
        description: t(
          'Display the current pedestrian shape identify result from one specific camera_',
        ),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.CAR_FLOWS),
        type: GadgetType.CAR_FLOWS,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.CAR_FLOW,
        },
        description: t(
          'Display car flow results from a specific period of time covering multiple specified cameras_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.HUMAN_FLOWS),
        type: GadgetType.HUMAN_FLOWS,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.HUMAN_FLOW,
        },
        description: t(
          'Display crowd identity results from a specific period of time covering multiple specified cameras_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.CAR_FLOW),
        type: GadgetType.CAR_FLOW,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.CAR_FLOW,
        },
        description: t(
          'Display car flow results from a specific period of time covering a specific camera_ The solid line is values from the last period; the dotted line is values from the period before that_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.HUMAN_FLOW),
        type: GadgetType.HUMAN_FLOW,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.HUMAN_FLOW,
        },
        description: t(
          'Display crowd identity results from a specific period of time covering a specific camera_ The solid line is values from the last period; the dotted line is values from the period before that_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.AQI_OF_DEVICE),
        type: GadgetType.AQI_OF_DEVICE,
        deviceType: DeviceType.ENVIRONMENT,
        description: t(
          'Display the current PM2_5 value of one specific environment detection device as well as the current temperature and humidity values from that same device for reference_',
        ),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.AQI_IN_DIVISION),
        type: GadgetType.AQI_IN_DIVISION,
        deviceType: DeviceType.ENVIRONMENT,
        description: t(
          'Display the current highest PM2_5 value of all environment detection devices in one specific division_ And also display the current temperature and humidity value from the same environment detection device for referencing_',
        ),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.WIFI),
        type: GadgetType.WIFI,
        deviceType: DeviceType.WIFI,
        description: t(
          'Display the current number of devices currently connected to a specific Wifi device as well as a breakdown of connections over a specified period of time_ The solid line is values from the last period; the dotted line is values from the period before that_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.MALFUNCTION_FLOW),
        type: GadgetType.MALFUNCTION_FLOW,
        description: t(
          'Display the current number of malfunctioning devices in a specific division as well as the daily count of malfunctioning devices over the past 7 days_ The solid line is values covering the last 7 days; the dotted line is values for the days 8-14_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.PROPER_RATE),
        type: GadgetType.PROPER_RATE,
        description: t(
          'Display the current device availability rate for a specific division as well as a chart of daily rate of device availability over the past 7 days_ The solid line is values covering the last 7 days; the dotted line is values for the days 8-14_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.EV_STATS),
        type: GadgetType.EV_STATS,
        deviceType: DeviceType.CHARGING,
        description: t(
          'Display the daily total revenue, overall total revenue, total energy consumption, and total charging count covering the last 7 days_ The solid line is values covering the last 7 days; the dotted line is values for the days 8-14_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.EV_CHARGERS),
        type: GadgetType.EV_CHARGERS,
        deviceType: DeviceType.CHARGING,
        description: t(
          'Display a specific division of EV chargers broken down by charging status_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.EV_ALARM_STATS),
        type: GadgetType.EV_ALARM_STATS,
        deviceType: DeviceType.CHARGING,
        description: t(
          'Display the current number of EV chargers showing an _Alarm_ status as well as the daily count of EV chargers showing _Alarm_ statuses over the last 7 days_ The solid line is values covering the last 7 days; the dotted line is values for the days 8-14_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.GENDER_AGE_FLOW),
        type: GadgetType.GENDER_AGE_FLOW,
        deviceType: DeviceType.CAMERA,
        attribute: {
          key: 'recognition_type',
          value: RecognitionKey.HUMAN_FLOW_ADVANCE,
        },
        description: t(
          'Display gender and age identity results from a specific period of time covering a specific camera_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP),
        type: GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP,
        deviceType: DeviceType.LAMP,
        description: t('Set the percentage of brightness of multiple street lights_'),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.INDOOR_AIR_QUALITY),
        type: GadgetType.INDOOR_AIR_QUALITY,
        deviceType: DeviceType.BANPU_INDOOR_METER,
        description: t(
          'Display the detection results of the indoor air quality, the solid line on the graph represents the trend of indoor CO2, every 15 minutes is a scale, the data within 2 hours is displayed at a time, and the maximum, minimum and average values ​​within 2 hours are displayed below_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.INDOOR_TEMPERATURE),
        type: GadgetType.INDOOR_TEMPERATURE,
        deviceType: DeviceType.BANPU_INDOOR_METER,
        description: t(
          'Display the detection results of the indoor humidity, the solid line on the graph represents the trend of indoor humidity, every 15 minutes is a scale, the data within 2 hours is displayed at a time, and the maximum, minimum and average values ​​within 2 hours are displayed below_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.POWER_CONSUMPTION),
        type: GadgetType.POWER_CONSUMPTION,
        deviceType: DeviceType.POWER_METER,
        description: t(
          "Display all power consumption of indoor equipment, divided into 5 scales, less than 300kW, 300~400kW, 400~500kW, 500~600KW, and more than 600KW. A total of 5 scales are displayed in different colors. The Y axis of the heat map is from Monday to Sunday and Attach the date, assuming today is Wednesday, May 11, the Y-axis displays THU 05 FRI 06 SAT 07 SUN 08 MON 09 TUE 10 WED 11, the latest is placed at the bottom, the X-axis is a 24-hour scale, from 00 o'clock until 24_00",
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.WEATHER),
        type: GadgetType.WEATHER,
        deviceType: DeviceType.OPEN_DATA_WEATHER,
        description: t(
          'Presents current temperature, humidity, weather conditions, UV, wind speed, wind direction, and presents a six-hour weather forecast, including temperature, humidity, weather conditions, wind speed, etc_',
        ),
        size: GadgetSize.SQUARE,
      },
      {
        name: tGadget(GadgetType.PLACE_USAGE),
        type: GadgetType.PLACE_USAGE,
        deviceType: DeviceType.USAGE_METER,
        description: t(
          'Shows the average time that a certain area is occupied by people, this area will install a personnel sensor to detect whether there are people in this area, and can customize the name (e_g_ Campus Space Utilization)_',
        ),
        size: GadgetSize.DEFAULT,
      },
      {
        name: tGadget(GadgetType.INDOOR_ENERGY_CONSUMPTION),
        type: GadgetType.INDOOR_ENERGY_CONSUMPTION,
        deviceType: DeviceType.UNKNOWN,
        description: t(
          'Presents the current solar power generation, as well as the current total power source values ​​(solar, wired)_',
        ),
        size: GadgetSize.DEFAULT,
      },
    ],
    [t, tGadget],
  );

  return originGadgets;
};

export default useGetGadgetInfoList;
