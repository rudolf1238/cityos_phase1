import React, { ComponentProps, ElementType, VoidFunctionComponent } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import { NotifyType } from '../../libs/schema';

import EmailIcon from '../../assets/icon/email.svg';
import LineIcon from '../../assets/icon/line.svg';
import SmsIcon from '../../assets/icon/sms.svg';

const nofityIcons: Record<NotifyType, ElementType> = {
  [NotifyType.EMAIL]: EmailIcon,
  [NotifyType.LINE]: LineIcon,
  [NotifyType.SMS]: SmsIcon,
};

interface NotifyIconProps extends ComponentProps<typeof SvgIcon> {
  type: NotifyType;
}

const NotifyIcon: VoidFunctionComponent<NotifyIconProps> = ({
  type,
  ...props
}: NotifyIconProps) => {
  const Icon = nofityIcons[type];

  return <Icon {...props} />;
};

export default NotifyIcon;
