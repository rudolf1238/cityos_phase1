import { ErrorType } from 'city-os-common/modules/videoPlayer/type';

export enum SplitMode {
  SINGLE = 'SINGLE',
  FOUR = 'FOUR',
  NINE = 'NINE',
  SIXTEEN = 'SIXTEEN',
}

export interface LiveViewDevice {
  deviceId: string;
  /** null value represent not fixed */
  fixedIndex: number | null;
}

export interface LiveViewConfig {
  devices: LiveViewDevice[];
  splitMode: SplitMode | null;
  autoplay: boolean | null;
  autoplayInSeconds: number | null;
}

export interface PlaybackRange {
  from: Date;
  to: Date;
}

export interface VideoStatusRecord {
  [deviceId: string]: {
    canPlay: boolean;
    errorType?: ErrorType;
    changingStartTime?: number;
    nextClipStartTime: number | null;
  };
}
