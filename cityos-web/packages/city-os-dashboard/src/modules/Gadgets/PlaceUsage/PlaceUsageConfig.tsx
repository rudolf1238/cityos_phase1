import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DevicesTitle from '../../Configures/ConfigTemplates/DevicesTitle';

type PlaceUsageConfigProps = ConfigComponentProps<ConfigFormType.DEVICES_TITLE>;

const AqiMonitorConfig: VoidFunctionComponent<PlaceUsageConfigProps> = ({
  config,
  saveType,
  onSave,
}: PlaceUsageConfigProps) => (
  <DevicesTitle
    gadgetType={GadgetType.PLACE_USAGE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default AqiMonitorConfig;
