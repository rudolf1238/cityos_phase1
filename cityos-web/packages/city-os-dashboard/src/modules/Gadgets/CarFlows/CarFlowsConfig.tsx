import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DevicesDurationLayout from '../../Configures/ConfigTemplates/DevicesDurationLayout';

type CarFlowsConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_DURATION_LAYOUT>;

const CarFlowsConfig: VoidFunctionComponent<CarFlowsConfigProps> = ({
  saveType,
  onSave,
  config,
}: CarFlowsConfigProps) => (
  <DevicesDurationLayout
    gadgetType={GadgetType.CAR_FLOWS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarFlowsConfig;
