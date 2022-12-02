import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type AqiMonitorConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const AqiMonitorConfig: VoidFunctionComponent<AqiMonitorConfigProps> = ({
  config,
  saveType,
  onSave,
}: AqiMonitorConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.AQI_OF_DEVICE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default AqiMonitorConfig;
