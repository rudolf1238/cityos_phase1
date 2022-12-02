import React, { ComponentProps, ElementType, VoidFunctionComponent } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import { MalDeviceStatus } from '../../libs/schema';

import CheckIcon from '../../assets/icon/check.svg';
import CrossIcon from '../../assets/icon/cross.svg';

const statusIcons: Record<MalDeviceStatus, ElementType> = {
  [MalDeviceStatus.ON]: CheckIcon,
  [MalDeviceStatus.OFF]: CrossIcon,
};

interface StatusIconProps extends ComponentProps<typeof SvgIcon> {
  type: MalDeviceStatus;
}

const StatusIcon: VoidFunctionComponent<StatusIconProps> = ({
  type,
  ...props
}: StatusIconProps) => {
  const Icon = statusIcons[type];

  return <Icon {...props} />;
};

export default StatusIcon;
