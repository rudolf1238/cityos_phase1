import { DeviceType, IDevice } from 'city-os-common/libs/schema';
import { SubscribeDevice } from 'city-os-common/hooks/useSubscribeDevicesStatus';

interface DeviceInfo {
  deviceId: string;
  type: DeviceType;
  related?: Pick<IDevice, 'deviceId' | 'type'>[] | null;
}

const extractRelatedDevices = (device: DeviceInfo): SubscribeDevice[] =>
  [{ deviceId: device.deviceId, type: device.type }].concat(device.related || []);

export default extractRelatedDevices;
