import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type CarIdentifyConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const CarIdentifyConfig: VoidFunctionComponent<CarIdentifyConfigProps> = ({
  config,
  saveType,
  onSave,
}: CarIdentifyConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.CAR_IDENTIFY}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default CarIdentifyConfig;
