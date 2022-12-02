import gql from 'graphql-tag';

import { LiveViewConfig } from '../libs/type';

export type LiveViewConfigInput = Partial<LiveViewConfig>;

export interface SaveLiveViewConfigPayload {
  input: LiveViewConfigInput;
}

export interface SaveLiveViewConfigResponse {
  saveLiveViewConfig: LiveViewConfig | null;
}

export const SAVE_LIVE_VIEW_CONFIG = gql`
  mutation saveLiveViewConfig($input: LiveViewConfigInput!) {
    saveLiveViewConfig(input: $input) {
      devices {
        deviceId
        fixedIndex
      }
      splitMode
      autoplay
      autoplayInSeconds
    }
  }
`;
