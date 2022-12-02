import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceLayout from '../../Configures/ConfigTemplates/DeviceLayout';

type PowerConsumptionConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_LAYOUT>;

const PowerConsumptionConfig: VoidFunctionComponent<PowerConsumptionConfigProps> = ({
  config,
  saveType,
  onSave,
}: PowerConsumptionConfigProps) => (
  <DeviceLayout
    gadgetType={GadgetType.POWER_CONSUMPTION}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default PowerConsumptionConfig;
