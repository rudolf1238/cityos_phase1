import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type IndoorEnergyConsumptionConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const IndoorEnergyConsumptionConfig: VoidFunctionComponent<IndoorEnergyConsumptionConfigProps> = ({
  config,
  saveType,
  onSave,
}: IndoorEnergyConsumptionConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.INDOOR_ENERGY_CONSUMPTION}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default IndoorEnergyConsumptionConfig;
