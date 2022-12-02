import React, { VoidFunctionComponent } from 'react';

import { ConfigComponentProps } from '../GadgetBase';
import { ConfigFormType, GadgetType } from '../../../libs/type';

import DivisionLayout from '../../Configures/ConfigTemplates/DivisionLayout';

type EVAlarmStatsConfigProps = ConfigComponentProps<ConfigFormType.DIVISION_LAYOUT>;

const EVAlarmStatsConfig: VoidFunctionComponent<EVAlarmStatsConfigProps> = ({
  config,
  saveType,
  onSave,
}: EVAlarmStatsConfigProps) => (
  <DivisionLayout
    gadgetType={GadgetType.EV_ALARM_STATS}
    saveType={saveType}
    onUpdateGadget={onSave}
    config={config}
  />
);

export default EVAlarmStatsConfig;
