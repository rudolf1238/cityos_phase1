import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DevicePluralTitle from '../../Configures/ConfigTemplates/DevicePluralTitle';

type SetBrightnessPercentOfLampProps = ConfigComponentProps<ConfigFormType.DEVICE_PLURAL_TITLE>;

const SensorSwitchesConfig: VoidFunctionComponent<SetBrightnessPercentOfLampProps> = ({
  config,
  saveType,
  onSave,
}: SetBrightnessPercentOfLampProps) => (
  <DevicePluralTitle
    gadgetType={GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default SensorSwitchesConfig;
