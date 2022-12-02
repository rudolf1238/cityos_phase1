import React, { ComponentProps, ElementType, VoidFunctionComponent } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import { DeviceType } from '../libs/schema';
import AdIcon from '../assets/icon/ad.svg';
import BanpuIndoorMeterIcon from '../assets/icon/banpuIndoorMeter.svg';
import CameraIcon from '../assets/icon/camera.svg';
import ChargingIcon from '../assets/icon/charging.svg';
import ChillerIcon from '../assets/icon/chiller.svg';
import CloudyIcon from '../assets/icon/cloudy.svg';
import DigitalPowerMeterIcon from '../assets/icon/digitalPowerMeter.svg';
import ElevatorIcon from '../assets/icon/elevator.svg';
import EnvironmentIcon from '../assets/icon/environment.svg';
import FireAlarmIcon from '../assets/icon/fireAlarm.svg';
import HouseIcon from '../assets/icon/house.svg';
import LampIcon from '../assets/icon/lamp.svg';
import PoleIcon from '../assets/icon/pole.svg';
import SolarIcon from '../assets/icon/solar.svg';
import SpeakerIcon from '../assets/icon/speaker.svg';
import UnknownIcon from '../assets/icon/unknown.svg';
import WaterIcon from '../assets/icon/water.svg';
import WifiIcon from '../assets/icon/wifi.svg';

const deviceIcons: Record<DeviceType, ElementType> = {
  [DeviceType.LAMP]: PoleIcon,
  [DeviceType.DISPLAY]: AdIcon,
  [DeviceType.ENVIRONMENT]: EnvironmentIcon,
  [DeviceType.CHARGING]: ChargingIcon,
  [DeviceType.SOLAR]: SolarIcon,
  [DeviceType.CAMERA]: CameraIcon,
  [DeviceType.WATER]: WaterIcon,
  [DeviceType.WIFI]: WifiIcon,
  [DeviceType.BUILDING]: HouseIcon,
  [DeviceType.INDOOR_LAMP]: LampIcon,
  [DeviceType.CHILLER]: ChillerIcon,
  [DeviceType.SPEAKER]: SpeakerIcon,
  [DeviceType.FIRE_ALARM]: FireAlarmIcon,
  [DeviceType.POWER_METER]: DigitalPowerMeterIcon,
  [DeviceType.ELEVATOR]: ElevatorIcon,
  [DeviceType.UNKNOWN]: UnknownIcon,
  [DeviceType.BANPU_INDOOR_METER]: BanpuIndoorMeterIcon,
  [DeviceType.OPEN_DATA_WEATHER]: CloudyIcon,
  [DeviceType.USAGE_METER]: UnknownIcon,
};

interface DeviceIconProps extends ComponentProps<typeof SvgIcon> {
  type: DeviceType;
}

const DeviceIcon: VoidFunctionComponent<DeviceIconProps> = ({
  type,
  ...props
}: DeviceIconProps) => {
  const Icon = deviceIcons[type];

  return <Icon {...props} />;
};

export default DeviceIcon;
