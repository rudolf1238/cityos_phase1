import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type ProperRateConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const ProperRateConfig: VoidFunctionComponent<ProperRateConfigProps> = ({
  config,
  saveType,
  onSave,
}: ProperRateConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.PROPER_RATE}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default ProperRateConfig;
