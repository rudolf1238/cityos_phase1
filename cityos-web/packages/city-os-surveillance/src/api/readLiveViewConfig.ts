import gql from 'graphql-tag';

import { LiveViewConfig } from '../libs/type';

export interface ReadLiveViewConfigResponse {
  readLiveViewConfig: LiveViewConfig | null;
}

export const READ_LIVE_VIEW_CONFIG = gql`
  query readLiveViewConfig {
    readLiveViewConfig {
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
