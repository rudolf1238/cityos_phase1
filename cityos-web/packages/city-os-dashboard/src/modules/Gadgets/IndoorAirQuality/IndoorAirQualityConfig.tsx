import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type IndoorAirQualityConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const IndoorAirQualityConfig: VoidFunctionComponent<IndoorAirQualityConfigProps> = ({
  config,
  saveType,
  onSave,
}: IndoorAirQualityConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.INDOOR_AIR_QUALITY}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default IndoorAirQualityConfig;
