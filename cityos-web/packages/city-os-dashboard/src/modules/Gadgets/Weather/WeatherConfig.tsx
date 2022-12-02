import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceTemperatureUnitLayout from '../../Configures/ConfigTemplates/DeviceTemperatureUnitLayout';

type WeatherConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_TEMPERATURE_UNIT_LAYOUT>;

const IndoorTemperatureConfig: VoidFunctionComponent<WeatherConfigProps> = ({
  config,
  saveType,
  onSave,
}: WeatherConfigProps) => (
  <DeviceTemperatureUnitLayout
    gadgetType={GadgetType.WEATHER}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default IndoorTemperatureConfig;
