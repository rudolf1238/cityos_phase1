import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type IndoorTemperatureConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const IndoorTemperatureConfig: VoidFunctionComponent<IndoorTemperatureConfigProps> = ({
  config,
  saveType,
  onSave,
}: IndoorTemperatureConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.INDOOR_TEMPERATURE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default IndoorTemperatureConfig;
