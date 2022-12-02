import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DeviceOnly from '../../Configures/ConfigTemplates/DeviceOnly';

type LiveViewConfigProps = ConfigComponentProps<ConfigFormType.DEVICE_ONLY>;

const LiveViewConfig: VoidFunctionComponent<LiveViewConfigProps> = ({
  config,
  saveType,
  onSave,
}: LiveViewConfigProps) => (
  <DeviceOnly
    gadgetType={GadgetType.LIVE_VIEW}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default LiveViewConfig;
