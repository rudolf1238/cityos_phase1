import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type HumanShapeConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const HumanShapeConfig: VoidFunctionComponent<HumanShapeConfigProps> = ({
  config,
  saveType,
  onSave,
}: HumanShapeConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.HUMAN_SHAPE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default HumanShapeConfig;
