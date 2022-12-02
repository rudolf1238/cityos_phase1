import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DivisionOnly from '../../Configures/ConfigTemplates/DivisionOnly';

type ExtremeAqiDivisionConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_ONLY>;

const ExtremeAqiDivisionConfig: VoidFunctionComponent<ExtremeAqiDivisionConfigProps> = ({
  config,
  saveType,
  onSave,
}: ExtremeAqiDivisionConfigProps) => (
  <DivisionOnly
    gadgetType={GadgetType.AQI_IN_DIVISION}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default ExtremeAqiDivisionConfig;
