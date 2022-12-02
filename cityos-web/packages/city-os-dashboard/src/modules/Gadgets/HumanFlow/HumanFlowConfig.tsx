import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DeviceDurationLayout from '../../Configures/ConfigTemplates/DeviceDurationLayout';

type HumanFlowConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_DURATION_LAYOUT>;

const HumanFlowConfig: VoidFunctionComponent<HumanFlowConfigProps> = ({
  config,
  saveType,
  onSave,
}: HumanFlowConfigProps) => (
  <DeviceDurationLayout
    gadgetType={GadgetType.HUMAN_FLOW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default HumanFlowConfig;
