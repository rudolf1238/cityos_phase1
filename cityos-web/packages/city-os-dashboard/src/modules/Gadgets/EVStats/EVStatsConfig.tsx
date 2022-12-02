import React, { VoidFunctionComponent } from 'react';

import { ConfigFormType, GadgetType } from '../../../libs/type';

import { ConfigComponentProps } from '../GadgetBase';
import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type EVStatsConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const EVStatsConfig: VoidFunctionComponent<EVStatsConfigProps> = ({
  config,
  saveType,
  onSave,
}: EVStatsConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.EV_STATS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default EVStatsConfig;
