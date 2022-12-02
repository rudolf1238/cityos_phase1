import { Palette } from '@material-ui/core/styles/createPalette';

import { ConfigFormType, GadgetSize, GadgetType, GridLayoutBreakpoint } from './type';

export const configFormSet = {
  [ConfigFormType.DEVICE_ONLY]: [
    GadgetType.LIVE_VIEW,
    GadgetType.HUMAN_SHAPE,
    GadgetType.AQI_OF_DEVICE,
    GadgetType.CAR_IDENTIFY,
    GadgetType.INDOOR_ENERGY_CONSUMPTION,
  ],
  [ConfigFormType.DEVICES_DURATION_LAYOUT]: [GadgetType.CAR_FLOWS, GadgetType.HUMAN_FLOWS],
  [ConfigFormType.DEVICE_DURATION_LAYOUT]: [
    GadgetType.CAR_FLOW,
    GadgetType.HUMAN_FLOW,
    GadgetType.WIFI,
    GadgetType.GENDER_AGE_FLOW,
    GadgetType.INDOOR_AIR_QUALITY,
    GadgetType.INDOOR_TEMPERATURE,
  ],
  [ConfigFormType.DIVISION_ONLY]: [GadgetType.AQI_IN_DIVISION],
  [ConfigFormType.DIVISION_LAYOUT]: [
    GadgetType.MALFUNCTION_FLOW,
    GadgetType.PROPER_RATE,
    GadgetType.EV_STATS,
    GadgetType.EV_ALARM_STATS,
    GadgetType.EV_CHARGERS,
  ],
  [ConfigFormType.DEVICE_PLURAL_TITLE]: [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP],
  [ConfigFormType.DEVICE_LAYOUT]: [GadgetType.POWER_CONSUMPTION],
  [ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT]: [GadgetType.WEATHER],
  [ConfigFormType.DEVICES_TITLE]: [GadgetType.PLACE_USAGE],
} as const;

export const gadgetSize: Record<GadgetSize, { width: number; height: number }> = {
  [GadgetSize.DEFAULT]: { width: 1, height: 1 },
  [GadgetSize.SQUARE]: { width: 1, height: 2 },
  [GadgetSize.RECTANGLE]: { width: 2, height: 1 },
};

export const gadgetSizeSet = {
  [GadgetType.CAR_IDENTIFY]: [GadgetSize.DEFAULT],
  [GadgetType.HUMAN_SHAPE]: [GadgetSize.DEFAULT],
  [GadgetType.AQI_IN_DIVISION]: [GadgetSize.DEFAULT],
  [GadgetType.AQI_OF_DEVICE]: [GadgetSize.DEFAULT],
  [GadgetType.EV_CHARGERS]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.LIVE_VIEW]: [GadgetSize.SQUARE],
  [GadgetType.CAR_FLOW]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.CAR_FLOWS]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.HUMAN_FLOW]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.HUMAN_FLOWS]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.EV_STATS]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.WIFI]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.MALFUNCTION_FLOW]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.PROPER_RATE]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.EV_ALARM_STATS]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.GENDER_AGE_FLOW]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP]: [GadgetSize.DEFAULT],
  [GadgetType.INDOOR_AIR_QUALITY]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.INDOOR_TEMPERATURE]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.POWER_CONSUMPTION]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.WEATHER]: [GadgetSize.SQUARE, GadgetSize.RECTANGLE],
  [GadgetType.PLACE_USAGE]: [GadgetSize.DEFAULT],
  [GadgetType.INDOOR_ENERGY_CONSUMPTION]: [GadgetSize.DEFAULT],
} as const;

export const defaultColors: (keyof Palette['gadget'])[] = [
  'notInService',
  'stopCharging',
  'default',
  'available',
  'charging',
];

export const gadgetWidthPx = 438;

export const gridLayoutMinWidths: Record<GridLayoutBreakpoint, number> = {
  [GridLayoutBreakpoint.lg]: gadgetWidthPx * 3,
  [GridLayoutBreakpoint.md]: gadgetWidthPx * 2,
  [GridLayoutBreakpoint.sm]: gadgetWidthPx * 1,
  [GridLayoutBreakpoint.xs]: 0,
};

export const gridLayoutColumnSizes: Record<GridLayoutBreakpoint, number> = {
  [GridLayoutBreakpoint.lg]: 4,
  [GridLayoutBreakpoint.md]: 3,
  [GridLayoutBreakpoint.sm]: 2,
  [GridLayoutBreakpoint.xs]: 1,
};

export const resubscribeInterval = 1000 * 60 * 30; // 30 minutes
