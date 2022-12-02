import React, { ComponentProps, ElementType, VoidFunctionComponent } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import { DeviceType } from 'city-os-common/libs/schema';
import AdIcon from 'city-os-common/assets/icon/ad.svg';
import BanpuIndoorMeterIcon from 'city-os-common/assets/icon/banpuIndoorMeter.svg';
import CameraIcon from 'city-os-common/assets/icon/camera.svg';
import ChargingIcon from 'city-os-common/assets/icon/charging.svg';
import ChillerIcon from 'city-os-common/assets/icon/chiller.svg';
import CloudyIcon from 'city-os-common/assets/icon/cloudy.svg';
import DigitalPowerMeterIcon from 'city-os-common/assets/icon/digitalPowerMeter.svg';
import ElevatorIcon from 'city-os-common/assets/icon/elevator.svg';
import EnvironmentIcon from 'city-os-common/assets/icon/environment.svg';
import FireAlarmIcon from 'city-os-common/assets/icon/fireAlarm.svg';
import HouseIcon from 'city-os-common/assets/icon/house.svg';
import LampIcon from 'city-os-common/assets/icon/lamp.svg';
import PoleIcon from 'city-os-common/assets/icon/pole.svg';
import SolarIcon from 'city-os-common/assets/icon/solar.svg';
import SpeakerIcon from 'city-os-common/assets/icon/speaker.svg';
import UnknownIcon from 'city-os-common/assets/icon/unknown.svg';
import WaterIcon from 'city-os-common/assets/icon/water.svg';
import WifiIcon from 'city-os-common/assets/icon/wifi.svg';

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
